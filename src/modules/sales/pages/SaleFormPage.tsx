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
import type { SaleItem } from "../domain/sale";
import type { Product } from "../../products/domain/product";

// Mock products for the selector
const mockProducts: Product[] = [
  {
    id: 1,
    sku: "PRD-001",
    name: "Laptop Pro 15",
    description: "",
    price: 1299.99,
    stock: 45,
    status: "active",
  },
  {
    id: 2,
    sku: "PRD-002",
    name: 'Monitor 4K 27"',
    description: "",
    price: 399.5,
    stock: 12,
    status: "active",
  },
  {
    id: 3,
    sku: "PRD-003",
    name: "Teclado Mecánico",
    description: "",
    price: 89.99,
    stock: 0,
    status: "inactive",
  },
  {
    id: 4,
    sku: "PRD-004",
    name: "Ratón Inalámbrico",
    description: "",
    price: 45.0,
    stock: 120,
    status: "active",
  },
];

export const SaleFormPage = () => {
  const { id } = useParams();
  const isEditing = !!id;

  const [items, setItems] = useState<SaleItem[]>([
    { productId: 0, quantity: 1, unitPrice: 0, subtotal: 0 },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: 0,
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    if (field === "productId") {
      const product = mockProducts.find((p) => p.id === Number(value));
      if (product) {
        item.product = product;
        item.unitPrice = product.price;
      }
    }

    item.subtotal = item.quantity * item.unitPrice;
    newItems[index] = item;
    setItems(newItems);
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
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-4 items-start md:items-end p-4 border rounded-lg relative"
                  >
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="absolute top-2 right-2 md:static text-red-600 md:mb-0"
                      >
                        ✕
                      </Button>
                    )}
                    <div className="w-full md:flex-1 space-y-2">
                      <Label htmlFor={`product-${index}`}>Producto</Label>
                      <Select
                        value={
                          item.productId ? item.productId.toString() : undefined
                        }
                        onValueChange={(val) =>
                          updateItem(index, "productId", Number(val))
                        }
                      >
                        <SelectTrigger id={`product-${index}`}>
                          <SelectValue placeholder="Selecciona un producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProducts.map((p) => (
                            <SelectItem
                              key={p.id}
                              value={p.id.toString()}
                              disabled={p.stock === 0}
                            >
                              {p.name} - ${p.price.toFixed(2)}{" "}
                              {p.stock === 0 && "(Sin stock)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                      <div className="flex-1 md:w-24 space-y-2">
                        <Label htmlFor={`quantity-${index}`}>Cantidad</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              Number(e.target.value),
                            )
                          }
                        />
                      </div>

                      <div className="flex-1 md:w-32 space-y-2">
                        <Label htmlFor={`price-${index}`}>Precio Unit.</Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "unitPrice",
                              Number(e.target.value),
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="w-full md:w-32 space-y-2">
                      <Label>Subtotal</Label>
                      <Input value={`$${item.subtotal.toFixed(2)}`} disabled />
                    </div>
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
