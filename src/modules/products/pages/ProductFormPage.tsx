import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useProduct } from "../hooks/useProduct";
import type { ProductStatus } from "../domain/product";

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

const productFormSchema = z.object({
  sku: z.string().min(1, "El SKU es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string(),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  stock: z.number().min(0, "El stock debe ser mayor o igual a 0"),
  min_stock: z.number().min(0, "El stock mínimo debe ser mayor o igual a 0"),
  status: z.enum(["active", "inactive"]),
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
      price: 0,
      stock: 0,
      min_stock: 0,
      status: "active",
    },
  });

  useEffect(() => {
    if (isEditing && product) {
      reset({
        sku: product.sku,
        name: product.name,
        description: product.description ?? "",
        price: product.price,
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
        price: data.price,
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
                <Label htmlFor="price">Precio Unitario ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>
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
    </div>
  );
};
