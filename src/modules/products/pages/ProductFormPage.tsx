import { Link, useNavigate, useParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState, LoadingState } from "@/components/shared/QueryStates";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ProductPayload } from "../actions/create-product";
import { ProductForm } from "../components/ProductForm";
import { StockMovementsCard } from "../components/StockMovementsCard";
import { stockAlertBadge } from "../helpers/product-labels";
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from "../hooks/useProduct";

export const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const productQuery = useProduct(id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const handleSubmit = async (payload: ProductPayload) => {
    if (id) {
      await updateProduct.mutateAsync({ id, data: payload });
    } else {
      await createProduct.mutateAsync(payload);
    }
    navigate("/products");
  };

  if (isEditing && productQuery.isPending) {
    return <LoadingState label="Cargando información del producto..." />;
  }

  if (isEditing && productQuery.isError) {
    return (
      <ErrorState
        error={productQuery.error}
        title="No se pudo cargar el producto"
        onRetry={() => productQuery.refetch()}
      />
    );
  }

  const product = productQuery.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        backTo="/products"
        title={isEditing ? "Editar Producto" : "Nuevo Producto"}
        description={
          isEditing
            ? "Modifica los datos del producto"
            : "Registra un nuevo producto en el inventario"
        }
        actions={
          id ? (
            <Button variant="outline" asChild>
              <Link to={`/purchases/new?productId=${id}`}>
                Registrar Compra
              </Link>
            </Button>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
          <CardDescription>
            Ingresa los detalles del producto para el catálogo
          </CardDescription>
          {product?.stock_alert_status ? (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">
                Alerta de stock:
              </span>
              <StatusBadge
                status={stockAlertBadge[product.stock_alert_status]}
              />
              {product.should_reorder ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Reordenar:
                  </span>
                  <Badge>Sí</Badge>
                </>
              ) : null}
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <ProductForm
            key={product?.id ?? "new"}
            product={product}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      {id ? <StockMovementsCard productId={id} /> : null}
    </div>
  );
};
