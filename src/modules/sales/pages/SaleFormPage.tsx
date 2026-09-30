import { useNavigate, useParams, useSearchParams } from "react-router";

import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState, LoadingState } from "@/components/shared/QueryStates";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCustomers } from "@/modules/customers/hooks/useCustomers";
import {
  getSuggestedUnitPrice,
  type ProductForSale,
} from "@/modules/products/domain/product";
import { useProductsForSale } from "@/modules/products/hooks/useProductsForSale";
import type { SalePayload } from "../actions/create-sale";
import { PaymentStatusControl } from "../components/PaymentStatusControl";
import { SaleForm } from "../components/SaleForm";
import type { SaleProductOption } from "../components/SaleItemRow";
import { toSaleFormValues } from "../components/sale-form-schema";
import { getPaymentStatusBadge, type Sale } from "../domain/sale";
import { useCreateSale, useSale, useUpdateSale } from "../hooks/useSale";

// TODO: replace the selects with searchable comboboxes once the catalogs grow.
const PRODUCT_OPTIONS_LIMIT = 50;
const CUSTOMER_OPTIONS_LIMIT = 100;

/**
 * Products already in the sale may not be offered for sale anymore (e.g. no
 * stock left); keep them as options so their selects still show a name.
 */
const buildProductOptions = (
  productsForSale: ProductForSale[],
  sale: Sale | undefined,
): SaleProductOption[] => {
  const options = new Map<string, SaleProductOption>(
    productsForSale.map((product) => [
      product.id,
      {
        id: product.id,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        suggestedUnitPrice: getSuggestedUnitPrice(product),
      },
    ]),
  );
  for (const item of sale?.items ?? []) {
    if (!options.has(item.product_id)) {
      options.set(item.product_id, {
        id: item.product_id,
        name: item.product_name,
        sku: item.product_sku,
      });
    }
  }
  return [...options.values()];
};

export const SaleFormPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const saleQuery = useSale(id);
  const productsQuery = useProductsForSale({ limit: PRODUCT_OPTIONS_LIMIT });
  const customersQuery = useCustomers({ limit: CUSTOMER_OPTIONS_LIMIT });
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();

  const handleSubmit = async (payload: SalePayload) => {
    if (id) {
      await updateSale.mutateAsync({ id, data: payload });
    } else {
      await createSale.mutateAsync(payload);
    }
    navigate("/sales");
  };

  // Suggested prices come from the products, so wait for them before
  // building the form's default values.
  if ((isEditing && saleQuery.isPending) || productsQuery.isPending) {
    return <LoadingState label="Cargando información de la venta..." />;
  }

  if (isEditing && saleQuery.isError) {
    return (
      <ErrorState
        error={saleQuery.error}
        title="No se pudo cargar la venta"
        onRetry={() => saleQuery.refetch()}
      />
    );
  }

  if (productsQuery.isError) {
    return (
      <ErrorState
        error={productsQuery.error}
        title="No se pudieron cargar los productos"
        onRetry={() => productsQuery.refetch()}
      />
    );
  }

  const sale = saleQuery.data;
  const productsForSale = productsQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/sales"
        title={isEditing ? "Editar Venta" : "Nueva Venta"}
        description={
          isEditing
            ? "Actualiza la información de la venta"
            : "Registra una nueva venta"
        }
        badge={
          sale ? (
            <StatusBadge
              status={getPaymentStatusBadge(sale.is_payment_pending)}
            />
          ) : null
        }
      />

      <SaleForm
        key={sale?.id ?? "new"}
        sale={sale}
        defaultValues={toSaleFormValues(
          sale,
          productsForSale,
          searchParams.get("customerId") ?? "",
        )}
        customers={customersQuery.data?.data ?? []}
        products={buildProductOptions(productsForSale, sale)}
        onSubmit={handleSubmit}
        summaryExtra={
          sale ? (
            <PaymentStatusControl
              key={String(sale.is_payment_pending)}
              sale={sale}
            />
          ) : null
        }
      />
    </div>
  );
};
