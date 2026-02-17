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
import { Link, useParams } from "react-router";
import { useState } from "react";

interface SaleItem {
  id: number;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export const SaleFormPage = () => {
  const { id } = useParams();
  const isEditing = !!id;

  const [items, setItems] = useState<SaleItem[]>([
    { id: 1, sku: "", quantity: 1, unitPrice: 0, subtotal: 0 },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        sku: "",
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
      },
    ]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2);
  };

  return (
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
                    <Label htmlFor="customer">Cliente *</Label>
                    <Select defaultValue={isEditing ? "1" : undefined}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Juan Pérez</SelectItem>
                        <SelectItem value="2">María García</SelectItem>
                        <SelectItem value="3">Carlos López</SelectItem>
                        <SelectItem value="4">Ana Martínez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha de Venta *</Label>
                    <Input
                      id="date"
                      type="date"
                      defaultValue={isEditing ? "2026-01-15" : ""}
                    />
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
              <Button onClick={addItem} variant="outline" size="sm">
                + Agregar Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-end p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`sku-${item.id}`}>
                        SKU / Descripción
                      </Label>
                      <Input id={`sku-${item.id}`} placeholder="Producto A" />
                    </div>

                    <div className="w-24 space-y-2">
                      <Label htmlFor={`quantity-${item.id}`}>Cantidad</Label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        defaultValue="1"
                      />
                    </div>

                    <div className="w-32 space-y-2">
                      <Label htmlFor={`price-${item.id}`}>Precio Unit.</Label>
                      <Input
                        id={`price-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="w-32 space-y-2">
                      <Label>Subtotal</Label>
                      <Input value="$0.00" disabled />
                    </div>

                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
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
                  <span className="font-semibold">{items.length}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold">${calculateTotal()}</span>
                  </div>
                </div>

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
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button className="w-full" type="submit">
              {isEditing ? "Actualizar Venta" : "Registrar Venta"}
            </Button>
            <Link to="/sales" className="block">
              <Button variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
