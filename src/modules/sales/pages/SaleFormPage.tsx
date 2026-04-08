import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";

import {
  useForm,
  useFieldArray,
  useWatch,
  Controller,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type FieldErrors,
  type FieldArrayWithId,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSale } from "../hooks/useSale";

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
import { useProductsForSale } from "../../products/hooks/useProductsForSale";
import type { ProductForSale } from "../../products/actions/get-products-for-sale";
import { useCustomers } from "../../customers/hooks/useCustomers";
import { formatCurrency } from "@/lib/formatters";

// Zod validation schema
const saleFormSchema = z
  .object({
    customerId: z.string().min(1, "El cliente es requerido"),
    saleDate: z.string().min(1, "La fecha es requerida"),
    items: z.array(
      z.object({
        id: z.string().optional(),
        productId: z.string().min(1, "El producto es requerido"),
        quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
        unitPrice: z
          .number()
          .min(0, "El precio debe ser mayor o igual a 0")
          .optional(),
        suggestedUnitPrice: z.number().optional(),
        pricingExceptionReason: z.string().optional(),
        subtotal: z.number(),
        product: z.any().optional(),
      }),
    ),
  })
  .superRefine((value, ctx) => {
    value.items.forEach((item, index) => {
      const isPriceDifferent =
        item.suggestedUnitPrice !== undefined &&
        item.unitPrice !== undefined &&
        item.unitPrice !== item.suggestedUnitPrice;
      const hasReason = !!item.pricingExceptionReason?.trim();

      if (isPriceDifferent && !hasReason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "pricingExceptionReason"],
          message: "Ingresa el motivo de la excepción de precio",
        });
      }
    });
  });

type SaleFormData = z.infer<typeof saleFormSchema>;

export const SaleFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const {
    data: sale,
    isLoading,
    createSale,
    updateSale,
    isCreating,
    isUpdating,
  } = useSale(id);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customerId: "",
      saleDate: "", // Default to today's date
      items: [
        {
          productId: "",
          quantity: 1,
          unitPrice: undefined,
          suggestedUnitPrice: undefined,
          subtotal: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Always load default paginated products for sale
  const { data: defaultProductsData } = useProductsForSale({ limit: 50 });
  const defaultProducts = defaultProductsData ?? [];

  // Load customers for selection
  const { data: customersData } = useCustomers({ limit: 100 });
  const customers = customersData?.data ?? [];

  // Watch the items to calculate totals
  const watchedItems = useWatch({
    control,
    name: "items",
  });

  // Reset form when sale data is loaded in edit mode
  useEffect(() => {
    if (sale && isEditing) {
      reset({
        customerId: sale.customer_id,
        saleDate: sale.date,
        items: sale.items.map((item) => {
          const product = defaultProducts.find((p) => p.id === item.product_id);
          const suggestedPrice =
            product && Number(product.first_available_lot.suggested_unit_price);
          return {
            id: item.id,
            productId: item.product_id,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            suggestedUnitPrice: suggestedPrice || undefined,
            pricingExceptionReason: item.pricing_exception_reason ?? "",
            subtotal: item.subtotal,
          };
        }),
      });
    }
  }, [sale, isEditing, reset, defaultProducts]);

  const onSubmit = async (data: SaleFormData) => {
    try {
      const payload = {
        customerId: data.customerId,
        date: data.saleDate,
        items: data.items.map((item) => {
          const isPriceDifferent =
            item.suggestedUnitPrice !== undefined &&
            item.unitPrice !== item.suggestedUnitPrice;
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            pricingExceptionReason: isPriceDifferent
              ? item.pricingExceptionReason?.trim() || undefined
              : undefined,
          };
        }),
      };

      if (isEditing && id) {
        await updateSale({ saleId: id, data: payload });
      } else {
        await createSale(payload);
      }

      navigate("/sales");
    } catch (error) {
      console.error("Error saving sale:", error);
    }
  };

  const calculateTotal = () => {
    if (!watchedItems) return "0.00";
    return watchedItems
      .reduce(
        (sum, item) =>
          sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
        0,
      )
      .toFixed(2);
  };

  if (isEditing && isLoading) {
    return <p>Cargando información de la venta...</p>;
  }

  if (isEditing && !sale) {
    return <p>No se encontró la venta.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Editar Venta" : "Nueva Venta"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Actualiza la información de la venta"
              : "Registra una nueva venta"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>Datos básicos de la venta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerId">Cliente *</Label>
                      {isEditing && sale ? (
                        <Input value={sale.customer_name} disabled />
                      ) : (
                        <Controller
                          name="customerId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger id="customerId">
                                <SelectValue placeholder="Selecciona un cliente" />
                              </SelectTrigger>
                              <SelectContent>
                                {customers.map((customer) => (
                                  <SelectItem
                                    key={customer.id}
                                    value={customer.id}
                                  >
                                    {customer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      )}
                      {errors.customerId && (
                        <p className="text-sm text-red-500">
                          {errors.customerId.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="saleDate">Fecha de Venta *</Label>
                      <Input
                        id="saleDate"
                        type="date"
                        {...register("saleDate")}
                        disabled={isEditing}
                      />
                      {errors.saleDate && (
                        <p className="text-sm text-red-500">
                          {errors.saleDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Items de Venta</CardTitle>
                  <CardDescription>
                    Agrega los productos o servicios vendidos
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() =>
                    append({
                      productId: "",
                      quantity: 1,
                      unitPrice: undefined,
                      suggestedUnitPrice: undefined,
                      pricingExceptionReason: "",
                      subtotal: 0,
                    })
                  }
                  variant="outline"
                  size="sm"
                >
                  + Agregar Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <ItemRow
                      key={field.id}
                      index={index}
                      field={field}
                      control={control}
                      register={register}
                      setValue={setValue}
                      remove={remove}
                      defaultProducts={defaultProducts}
                      errors={errors}
                      fieldsLength={fields.length}
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
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold">
                        {formatCurrency(Number(calculateTotal()))}
                      </span>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-4 space-y-2">
                      <Label>Próxima Compra Estimada</Label>
                      <Input
                        type="date"
                        placeholder="Se calculará automáticamente"
                        disabled
                      />
                      <p className="text-xs text-gray-500">
                        Se calcula automáticamente basado en el historial
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar Venta"
                    : "Registrar Venta"}
              </Button>
              <Link to="/sales" className="block">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

interface ItemRowProps {
  index: number;
  field: FieldArrayWithId<SaleFormData, "items", "id">;
  control: Control<SaleFormData>;
  register: UseFormRegister<SaleFormData>;
  setValue: UseFormSetValue<SaleFormData>;
  remove: (index: number) => void;
  defaultProducts: ProductForSale[];
  errors: FieldErrors<SaleFormData>;
  fieldsLength: number;
}

const ItemRow = ({
  index,
  field,
  control,
  register,
  setValue,
  remove,
  defaultProducts,
  errors,
  fieldsLength,
}: ItemRowProps) => {
  const watchedQuantity = useWatch({
    control,
    name: `items.${index}.quantity`,
  });

  const watchedPrice = useWatch({
    control,
    name: `items.${index}.unitPrice`,
  });

  const watchedProductId = useWatch({
    control,
    name: `items.${index}.productId`,
  });

  const subtotal = (watchedQuantity || 0) * (watchedPrice || 0);

  // Get the selected product to compare prices
  const selectedProduct = defaultProducts.find(
    (p) => p.id === watchedProductId,
  );
  const suggestedPrice = selectedProduct
    ? Number(selectedProduct.first_available_lot.suggested_unit_price)
    : null;
  const isPriceDifferent =
    suggestedPrice !== null && watchedPrice !== suggestedPrice;

  useEffect(() => {
    setValue(`items.${index}.subtotal`, subtotal, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [index, setValue, subtotal]);

  return (
    <div
      key={field.id}
      className="flex flex-col gap-4 p-4 border rounded-lg relative"
    >
      {fieldsLength > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => remove(index)}
          className="absolute top-2 right-2 text-red-600"
        >
          ✕
        </Button>
      )}
      <div className="space-y-2">
        <Label htmlFor={`items.${index}.productId`}>Producto</Label>
        <Controller
          name={`items.${index}.productId`}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                const selectedProduct = defaultProducts.find(
                  (p) => p.id === value,
                );
                field.onChange(value);
                // Auto-populate price from suggested_unit_price
                if (selectedProduct) {
                  const suggestedPrice = Number(
                    selectedProduct.first_available_lot.suggested_unit_price,
                  );
                  setValue(`items.${index}.unitPrice`, suggestedPrice, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue(
                    `items.${index}.suggestedUnitPrice`,
                    suggestedPrice,
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  );
                }
                setValue(`items.${index}.pricingExceptionReason`, "", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger id={`items.${index}.productId`}>
                <SelectValue placeholder="Selecciona un producto" />
              </SelectTrigger>
              <SelectContent>
                {defaultProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id} disabled={p.stock === 0}>
                    {p.name} ({p.sku}) - Stock: {p.stock}{" "}
                    {p.stock === 0 && "(Sin stock)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.items?.[index]?.productId && (
          <p className="text-sm text-red-500">
            {errors.items[index].productId.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`items.${index}.quantity`}>Cantidad</Label>
          <Input
            id={`items.${index}.quantity`}
            type="number"
            min="1"
            {...register(`items.${index}.quantity`, {
              valueAsNumber: true,
            })}
          />
          {errors.items?.[index]?.quantity && (
            <p className="text-sm text-red-500">
              {errors.items[index].quantity.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`items.${index}.unitPrice`}>Precio Unit.</Label>
          <Input
            id={`items.${index}.unitPrice`}
            type="number"
            min="0"
            step="0.01"
            {...register(`items.${index}.unitPrice`, {
              setValueAs: (value) =>
                value === "" || Number.isNaN(Number(value))
                  ? undefined
                  : Number(value),
            })}
          />
          {errors.items?.[index]?.unitPrice && (
            <p className="text-sm text-red-500">
              {errors.items[index].unitPrice.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Subtotal</Label>
          <Input value={formatCurrency(subtotal)} disabled />
        </div>
      </div>

      {isPriceDifferent && (
        <div className="space-y-2">
          <Label htmlFor={`items.${index}.pricingExceptionReason`}>
            Motivo excepción de precio
          </Label>
          <Input
            id={`items.${index}.pricingExceptionReason`}
            placeholder="Ej. descuento especial aprobado"
            {...register(`items.${index}.pricingExceptionReason`)}
          />
          {errors.items?.[index]?.pricingExceptionReason && (
            <p className="text-sm text-red-500">
              {errors.items[index].pricingExceptionReason?.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
