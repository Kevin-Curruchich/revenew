import { useNavigate, useParams, useSearchParams } from "react-router";

import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState, LoadingState } from "@/components/shared/QueryStates";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useProducts } from "@/modules/products/hooks/useProducts";
import type { PurchasePayload } from "../actions/create-purchase";
import { PurchaseForm } from "../components/PurchaseForm";
import type { PurchaseProductOption } from "../components/PurchaseItemRow";
import { PurchaseStatusActions } from "../components/PurchaseStatusActions";
import {
  getPurchaseStatusBadge,
  isPurchaseEditable,
  type Purchase,
} from "../domain/purchase";
import {
  useCreatePurchase,
  usePurchase,
  useUpdatePurchase,
} from "../hooks/usePurchase";

// TODO: replace with a searchable combobox once the catalog grows.
const PRODUCT_OPTIONS_LIMIT = 100;

/**
 * Products of an existing purchase may not be in the first page of the
 * catalog; add them so the selects can still show their names.
 */
const buildProductOptions = (
  catalog: PurchaseProductOption[],
  purchase: Purchase | undefined,
): PurchaseProductOption[] => {
  const options = new Map(catalog.map((product) => [product.id, product]));
  for (const item of purchase?.items ?? []) {
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

export const PurchaseFormPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const purchaseQuery = usePurchase(id);
  const productsQuery = useProducts({ limit: PRODUCT_OPTIONS_LIMIT });
  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();

  const goToList = () => navigate("/purchases");

  const handleSubmit = async (payload: PurchasePayload) => {
    if (id) {
      await updatePurchase.mutateAsync({ id, data: payload });
    } else {
      await createPurchase.mutateAsync(payload);
    }
    goToList();
  };

  if (isEditing && purchaseQuery.isPending) {
    return <LoadingState label="Cargando información de la compra..." />;
  }

  if (isEditing && purchaseQuery.isError) {
    return (
      <ErrorState
        error={purchaseQuery.error}
        title="No se pudo cargar la compra"
        onRetry={() => purchaseQuery.refetch()}
      />
    );
  }

  const purchase = purchaseQuery.data;
  const products = buildProductOptions(
    productsQuery.data?.data ?? [],
    purchase,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/purchases"
        title={isEditing ? "Editar Compra" : "Nueva Compra"}
        badge={
          purchase ? (
            <StatusBadge status={getPurchaseStatusBadge(purchase.status)} />
          ) : null
        }
        description={
          isEditing
            ? "Actualiza la compra antes de confirmar el ingreso de stock"
            : "Registra una compra para reponer inventario"
        }
      />

      <PurchaseForm
        key={purchase?.id ?? "new"}
        purchase={purchase}
        presetProductId={searchParams.get("productId") ?? ""}
        products={products}
        onSubmit={handleSubmit}
        renderStatusActions={
          purchase && isPurchaseEditable(purchase)
            ? ({ isDirty }) => (
                <PurchaseStatusActions
                  purchaseId={purchase.id}
                  hasUnsavedChanges={isDirty}
                  onDone={goToList}
                />
              )
            : undefined
        }
      />
    </div>
  );
};
