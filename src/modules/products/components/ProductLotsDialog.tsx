import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductLotsTable } from "./ProductLotsTable";

interface ProductLotsDialogProps {
  productId: string;
  productName: string;
}

/** Lets the product list show lots without going through "Editar". */
export const ProductLotsDialog = ({
  productId,
  productName,
}: ProductLotsDialogProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm">
        Lotes
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Lotes de {productName}</DialogTitle>
        <DialogDescription>
          Del más antiguo al más reciente: cada venta toma primero del lote de
          arriba.
        </DialogDescription>
      </DialogHeader>
      {/* Mounted only while open, so lots load on demand. */}
      <ProductLotsTable productId={productId} />
    </DialogContent>
  </Dialog>
);
