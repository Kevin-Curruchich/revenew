import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useProduct } from "../hooks/useProduct";
import type { ProductEarningMode, ProductStatus } from "../domain/product";
import { useProductStockMovements } from "../hooks/useProductStockMovements";
import type { StockMovement } from "../domain/stock-movement";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const productFormSchema = z
  .object({
    sku: z.string().min(1, "El SKU es requerido"),
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string(),
    earningMode: z.enum(["percent", "fee"]),
    earningPercent: z.number().min(0, "Debe ser mayor o igual a 0"),
    earningFeeAmount: z.number().min(0, "Debe ser mayor o igual a 0"),
    stock: z.number().min(0, "El stock debe ser mayor o igual a 0"),
    min_stock: z.number().min(0, "El stock mínimo debe ser mayor o igual a 0"),
    status: z.enum(["active", "inactive"]),
  })
  .superRefine((value, ctx) => {
    if (value.earningMode === "percent" && value.earningPercent < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["earningPercent"],
        message: "El porcentaje debe ser mayor o igual a 0",
      });
    }

    if (value.earningMode === "fee" && value.earningFeeAmount < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["earningFeeAmount"],
        message: "El monto fijo debe ser mayor o igual a 0",
      });
    }
  });

type ProductFormData = z.infer<typeof productFormSchema>;

export const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const {
    data: product,
    isLoading,
    createProduct,
    updateProduct,
    isCreating,
    isUpdating,
  } = useProduct(id);

  const { data: stockMovementsData, isLoading: isLoadingStockMovements } =
    useProductStockMovements(id, { limit: 20, offset: 0 });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      earningMode: "percent",
      earningPercent: 0,
      earningFeeAmount: 0,
      stock: 0,
      min_stock: 0,
      status: "active",
    },
  });

  const earningMode = useWatch({
    control,
    name: "earningMode",
  });

  useEffect(() => {
    if (isEditing && product) {
      reset({
        sku: product.sku,
        name: product.name,
        description: product.description ?? "",
        earningMode: product.earning_mode,
        earningPercent: product.earning_percent,
        earningFeeAmount: product.earning_fee_amount,
        stock: product.stock,
        min_stock: product.min_stock,
        status: product.status,
      });
    }
  }, [isEditing, product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const payload = {
        sku: data.sku,
        name: data.name,
        description: data.description,
        earningMode: data.earningMode as ProductEarningMode,
        earningPercent: data.earningPercent,
        earningFeeAmount: data.earningFeeAmount,
        stock: data.stock,
        min_stock: data.min_stock,
        status: data.status as ProductStatus,
      };

      if (isEditing && id) {
        await updateProduct({ productId: id, data: payload });
      } else {
        await createProduct(payload);
      }

      navigate("/products");
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  if (isEditing && isLoading) {
    return <p>Cargando información del producto...</p>;
  }

  if (isEditing && !product) {
    return <p>No se encontró el producto.</p>;
  }

  const stockAlertText =
    product?.stock_alert_status === "out_of_stock"
      ? "Sin stock"
      : product?.stock_alert_status === "low_stock"
        ? "Stock bajo"
        : product?.stock_alert_status === "in_stock"
          ? "Stock disponible"
          : "Sin alerta";

  const stockAlertVariant =
    product?.stock_alert_status === "out_of_stock"
      ? "destructive"
      : product?.stock_alert_status === "low_stock"
        ? "secondary"
        : "outline";

  const getMovementBadgeVariant = (
    movementType: StockMovement["movement_type"],
  ) => {
    if (movementType === "purchase") {
      return "default";
    }

    if (movementType === "sale") {
      return "destructive";
    }

    if (movementType === "adjustment") {
      return "secondary";
    }

    return "outline";
  };

  const getMovementLabel = (movementType: StockMovement["movement_type"]) => {
    if (movementType === "purchase") {
      return "Compra";
    }

    if (movementType === "sale") {
      return "Venta";
    }

    if (movementType === "adjustment") {
      return "Ajuste";
    }

    if (movementType === "initial_stock") {
      return "Stock inicial";
    }

    return movementType;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/products">
          <Button variant="ghost" size="icon">
            ←
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Modifica los datos del producto"
              : "Registra un nuevo producto en el inventario"}
          </p>
        </div>
        {isEditing && id ? (
          <Link to={`/purchases/new?productId=${id}`} className="ml-auto">
            <Button variant="outline">Registrar Compra</Button>
          </Link>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
          <CardDescription>
            Ingresa los detalles del producto para el catálogo
          </CardDescription>
          {isEditing && product?.stock_alert_status && (
            <div className="pt-2 flex items-center gap-2">
              <span className="text-sm text-gray-600">Alerta de stock:</span>
              <Badge variant={stockAlertVariant}>{stockAlertText}</Badge>
              {product?.should_reorder && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Reordenar:</span>
                  <Badge variant="default">Sí</Badge>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="Ej. PRD-001"
                  {...register("sku")}
                />
                {errors.sku && (
                  <p className="text-sm text-red-500">{errors.sku.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-red-500">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                placeholder="Ej. Laptop Pro 15"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder="Breve descripción del producto"
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="earningMode">Modo de Ganancia</Label>
                <Controller
                  name="earningMode"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="earningMode">
                        <SelectValue placeholder="Selecciona modo de ganancia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Porcentaje</SelectItem>
                        <SelectItem value="fee">Monto fijo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.earningMode && (
                  <p className="text-sm text-red-500">
                    {errors.earningMode.message}
                  </p>
                )}
              </div>

              {earningMode === "percent" ? (
                <div className="space-y-2">
                  <Label htmlFor="earningPercent">Ganancia (%)</Label>
                  <Input
                    id="earningPercent"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    {...register("earningPercent", { valueAsNumber: true })}
                  />
                  {errors.earningPercent && (
                    <p className="text-sm text-red-500">
                      {errors.earningPercent.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="earningFeeAmount">Ganancia fija ($)</Label>
                  <Input
                    id="earningFeeAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register("earningFeeAmount", { valueAsNumber: true })}
                  />
                  {errors.earningFeeAmount && (
                    <p className="text-sm text-red-500">
                      {errors.earningFeeAmount.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Inicial</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("stock", { valueAsNumber: true })}
                />
                {errors.stock && (
                  <p className="text-sm text-red-500">{errors.stock.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock">Stock Mínimo</Label>
                <Input
                  id="min_stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("min_stock", { valueAsNumber: true })}
                />
                {errors.min_stock && (
                  <p className="text-sm text-red-500">
                    {errors.min_stock.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4">
              <Link to="/products" className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating
                  ? "Guardando..."
                  : isEditing
                    ? "Guardar Cambios"
                    : "Crear Producto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Movimientos de Stock</CardTitle>
            <CardDescription>
              Entradas y salidas del inventario para este producto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStockMovements ? (
              <p>Cargando historial de stock...</p>
            ) : stockMovementsData?.data.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Cambio</TableHead>
                    <TableHead className="text-right">Stock Anterior</TableHead>
                    <TableHead className="text-right">Stock Actual</TableHead>
                    <TableHead>Referencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovementsData.data.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {movement.created_at_formatted ??
                          movement.created_at ??
                          "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getMovementBadgeVariant(
                            movement.movement_type,
                          )}
                        >
                          {getMovementLabel(movement.movement_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {movement.quantity_change >= 0 ? "+" : ""}
                        {movement.quantity_change}
                      </TableCell>
                      <TableCell className="text-right">
                        {movement.stock_before ?? "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {movement.stock_after ?? "-"}
                      </TableCell>
                      <TableCell>
                        {movement.reference_type && movement.reference_id
                          ? `${movement.reference_type} #${movement.reference_id.slice(0, 8)}`
                          : (movement.reference_type ?? "-")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-gray-500">
                No hay movimientos registrados para este producto.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
