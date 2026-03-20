import { useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldArrayWithId,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { usePurchase } from "../hooks/usePurchase";
import type { PurchaseStatus } from "../domain/purchase";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "../../products/domain/product";
import { useProducts } from "../../products/hooks/useProducts";
import { formatCurrency } from "@/lib/formatters";

const purchaseFormSchema = z.object({
  supplierName: z.string().min(1, "El proveedor es requerido"),
  purchaseDate: z.string().min(1, "La fecha es requerida"),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        productId: z.string().min(1, "El producto es requerido"),
        quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
        unitCost: z.number().min(0, "El costo debe ser mayor o igual a 0"),
        subtotal: z.number(),
      }),
    )
    .min(1, "Agrega al menos un producto"),
});

type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

const getPurchaseStatusBadgeVariant = (status: string) => {
  if (status === "confirmed") {
    return "default";
  }

  if (status === "cancelled") {
    return "destructive";
  }

  return "secondary";
};

const getPurchaseStatusLabel = (status: string) => {
  if (status === "confirmed") {
    return "Confirmada";
  }

  if (status === "cancelled") {
    return "Cancelada";
  }

  return "Borrador";
};

export const PurchaseFormPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const presetProductId = searchParams.get("productId") ?? "";

  const {
    data: purchase,
    isLoading,
    createPurchase,
    updatePurchase,
    confirmPurchase,
    cancelPurchase,
    deletePurchase,
    isCreating,
    isUpdating,
    isConfirming,
    isCancelling,
    isDeleting,
  } = usePurchase(id);

  const { data: productsData } = useProducts({ limit: 100 });
  const products = productsData?.data ?? [];

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      supplierName: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      items: [
        {
          productId: presetProductId,
          quantity: 1,
          unitCost: 0,
          subtotal: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
  });

  useEffect(() => {
    if (isEditing && purchase) {
      reset({
        supplierName: purchase.supplier_name,
        purchaseDate: purchase.date,
        items: purchase.items.map((item) => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          unitCost: item.unit_cost,
          subtotal: item.subtotal,
        })),
      });
    }
  }, [isEditing, purchase, reset]);

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      const payload = {
        supplierName: data.supplierName,
        date: data.purchaseDate,
        items: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
      };

      if (isEditing && id) {
        await updatePurchase({ purchaseId: id, data: payload });
      } else {
        await createPurchase(payload);
      }

      navigate("/purchases");
    } catch (error) {
      console.error("Error saving purchase:", error);
    }
  };

  const handleConfirm = async () => {
    if (!id) {
      return;
    }

    try {
      await confirmPurchase(id);
      navigate("/purchases");
    } catch (error) {
      console.error("Error confirming purchase:", error);
    }
  };

  const handleCancel = async () => {
    if (!id) {
      return;
    }

    try {
      await cancelPurchase(id);
      navigate("/purchases");
    } catch (error) {
      console.error("Error cancelling purchase:", error);
    }
  };

  const handleDelete = async () => {
    if (!id) {
      return;
    }

    try {
      await deletePurchase(id);
      navigate("/purchases");
    } catch (error) {
      console.error("Error deleting purchase:", error);
    }
  };

  const calculateTotal = () => {
    if (!watchedItems?.length) {
      return "0.00";
    }

    return watchedItems
      .reduce(
        (sum, item) =>
          sum + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0),
        0,
      )
      .toFixed(2);
  };

  if (isEditing && isLoading) {
    return <p>Cargando información de la compra...</p>;
  }

  if (isEditing && !purchase) {
    return <p>No se encontró la compra.</p>;
  }

  const currentStatus: PurchaseStatus | string = purchase?.status ?? "draft";
  const isDraftPurchase = currentStatus === "draft";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/purchases">
              <Button variant="ghost" size="icon">
                ←
              </Button>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">
                  {isEditing ? "Editar Compra" : "Nueva Compra"}
                </h1>
                {isEditing ? (
                  <Badge variant={getPurchaseStatusBadgeVariant(currentStatus)}>
                    {getPurchaseStatusLabel(currentStatus)}
                  </Badge>
                ) : null}
              </div>
              <p className="text-gray-600">
                {isEditing
                  ? "Actualiza la compra antes de confirmar el ingreso de stock"
                  : "Registra una compra para reponer inventario"}
              </p>
            </div>
          </div>

          {isEditing && id ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {isDraftPurchase ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleConfirm}
                    disabled={isConfirming || isUpdating || isDeleting}
                  >
                    {isConfirming ? "Confirmando..." : "Confirmar Compra"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isCancelling || isUpdating || isDeleting}
                  >
                    {isCancelling ? "Cancelando..." : "Cancelar Compra"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting || isUpdating}
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>
                  Datos básicos del proveedor y la fecha de compra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Proveedor *</Label>
                    <Input
                      id="supplierName"
                      placeholder="Ej. Distribuidora Norte"
                      {...register("supplierName")}
                      disabled={isEditing && !isDraftPurchase}
                    />
                    {errors.supplierName ? (
                      <p className="text-sm text-red-500">
                        {errors.supplierName.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Fecha de Compra *</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      {...register("purchaseDate")}
                      disabled={isEditing && !isDraftPurchase}
                    />
                    {errors.purchaseDate ? (
                      <p className="text-sm text-red-500">
                        {errors.purchaseDate.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Productos Comprados</CardTitle>
                  <CardDescription>
                    Agrega los productos que ingresarán al inventario
                  </CardDescription>
                </div>
                {(!isEditing || isDraftPurchase) && (
                  <Button
                    type="button"
                    onClick={() =>
                      append({
                        productId: "",
                        quantity: 1,
                        unitCost: 0,
                        subtotal: 0,
                      })
                    }
                    variant="outline"
                    size="sm"
                  >
                    + Agregar Item
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <PurchaseItemRow
                      key={field.id}
                      control={control}
                      errors={errors}
                      field={field}
                      fieldsLength={fields.length}
                      index={index}
                      products={products}
                      register={register}
                      remove={remove}
                      setValue={setValue}
                      readOnly={isEditing && !isDraftPurchase}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-semibold">{fields.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <Badge
                      variant={getPurchaseStatusBadgeVariant(currentStatus)}
                    >
                      {getPurchaseStatusLabel(currentStatus)}
                    </Badge>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(Number(calculateTotal()))}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse sm:flex-row lg:flex-col gap-4">
              <Link to="/purchases" className="w-full">
                <Button type="button" variant="outline" className="w-full">
                  Volver
                </Button>
              </Link>
              {(!isEditing || isDraftPurchase) && (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating || isUpdating || isConfirming}
                >
                  {isCreating || isUpdating
                    ? "Guardando..."
                    : isEditing
                      ? "Guardar Cambios"
                      : "Crear Compra"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

interface PurchaseItemRowProps {
  control: Control<PurchaseFormData>;
  errors: FieldErrors<PurchaseFormData>;
  field: FieldArrayWithId<PurchaseFormData, "items", "id">;
  fieldsLength: number;
  index: number;
  products: Product[];
  readOnly: boolean;
  register: UseFormRegister<PurchaseFormData>;
  remove: (index: number) => void;
  setValue: UseFormSetValue<PurchaseFormData>;
}

const PurchaseItemRow = ({
  control,
  errors,
  field,
  fieldsLength,
  index,
  products,
  readOnly,
  register,
  remove,
  setValue,
}: PurchaseItemRowProps) => {
  const productId = useWatch({
    control,
    name: `items.${index}.productId`,
  });
  const quantity = useWatch({
    control,
    name: `items.${index}.quantity`,
  });
  const unitCost = useWatch({
    control,
    name: `items.${index}.unitCost`,
  });

  const selectedProduct = products.find((product) => product.id === productId);
  const subtotal = (Number(quantity) || 0) * (Number(unitCost) || 0);

  useEffect(() => {
    setValue(`items.${index}.subtotal`, subtotal, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [index, setValue, subtotal]);

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">Item {index + 1}</p>
          {selectedProduct ? (
            <p className="text-sm text-gray-500">
              SKU: {selectedProduct.sku} · Stock actual: {selectedProduct.stock}
            </p>
          ) : null}
        </div>
        {!readOnly && fieldsLength > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(index)}
          >
            Quitar
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-3">
          <Label>Producto *</Label>
          {readOnly && selectedProduct ? (
            <Input value={selectedProduct.name} disabled />
          ) : (
            <Controller
              control={control}
              name={`items.${index}.productId`}
              render={({ field: controllerField }) => (
                <Select
                  value={controllerField.value}
                  onValueChange={controllerField.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
          {errors.items?.[index]?.productId ? (
            <p className="text-sm text-red-500">
              {errors.items[index]?.productId?.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={field.id + "-quantity"}>Cantidad *</Label>
          <Input
            id={field.id + "-quantity"}
            type="number"
            min="1"
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
            disabled={readOnly}
          />
          {errors.items?.[index]?.quantity ? (
            <p className="text-sm text-red-500">
              {errors.items[index]?.quantity?.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={field.id + "-unitCost"}>Costo Unitario *</Label>
          <Input
            id={field.id + "-unitCost"}
            type="number"
            min="0"
            step="0.01"
            {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
            disabled={readOnly}
          />
          {errors.items?.[index]?.unitCost ? (
            <p className="text-sm text-red-500">
              {errors.items[index]?.unitCost?.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Subtotal</Label>
          <Input value={`$${subtotal.toFixed(2)}`} disabled />
        </div>
      </div>
    </div>
  );
};
