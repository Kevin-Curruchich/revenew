import { describe, expect, it } from "vitest";
import type {
  CashMovementConfirmation,
  SaleConfirmation,
  SalePreview,
  SalePreviewItem,
} from "./agent";
import {
  buildApproveDecision,
  buildCashMovementCorrection,
  buildPurchaseCorrection,
  buildSaleCorrection,
} from "./decisions";

const saleItem = (
  overrides: Partial<SalePreviewItem> = {},
): SalePreviewItem => ({
  product_id: "p1",
  product_name: "Cartón de huevos",
  product_sku: "CART",
  requested_quantity: "2",
  lotes: [],
  cost_basis_unit: "20.00",
  suggested_unit_price: "25.00",
  final_unit_price: "25.00",
  is_price_overridden: false,
  is_habitual_price: false,
  subtotal: "50.00",
  gross_profit_unit: "5.00",
  gross_profit_total: "10.00",
  warnings: [],
  ...overrides,
});

const salePreview = (items: SalePreviewItem[]): SalePreview => ({
  customer_id: "c1",
  customer_name: "Aurita",
  date: "2026-09-30",
  items,
  totals: {
    total_revenue: "50.00",
    total_cost: "40.00",
    total_gross_profit: "10.00",
  },
});

describe("buildApproveDecision", () => {
  it("sends back the very same huella it received", () => {
    const huella = { datos: { total: "50.00", lotes: [1, 2] }, firma: "abc" };
    const confirmation: SaleConfirmation = {
      tipo: "confirmar_venta",
      interrupt_id: "i1",
      preview: salePreview([saleItem()]),
      huella,
    };

    const decision = buildApproveDecision(confirmation);

    expect(decision).toEqual({ accion: "aprobar", huella });
    // Same reference: nothing was rebuilt or copied.
    expect(decision.accion === "aprobar" && decision.huella).toBe(huella);
    // And it serializes to exactly the same JSON the server sent.
    expect(JSON.stringify(decision)).toContain(JSON.stringify(huella));
  });

  it("approves cash movements without a huella", () => {
    const confirmation: CashMovementConfirmation = {
      tipo: "confirmar_movimiento_caja",
      interrupt_id: "i2",
      movimiento: {
        tipo: "aporte_socio",
        monto: "500",
        fecha: "2026-09-30",
        medio_pago: "efectivo",
        compra_id: null,
        venta_id: null,
        nota: null,
      },
    };

    expect(buildApproveDecision(confirmation)).toEqual({ accion: "aprobar" });
  });
});

describe("buildSaleCorrection", () => {
  it("uses the tool's argument names and sends every item", () => {
    const preview = salePreview([
      saleItem(),
      saleItem({ product_id: "p2", requested_quantity: "1" }),
    ]);

    expect(
      buildSaleCorrection(preview, [{ cantidad: "3", precio_unitario: "" }]),
    ).toEqual({
      accion: "corregir",
      valores: {
        items: [
          { producto_id: "p1", cantidad: "3" },
          { producto_id: "p2", cantidad: "1" },
        ],
      },
    });
  });

  it("keeps explicit prices and applies edited ones", () => {
    const preview = salePreview([
      saleItem({ is_price_overridden: true, final_unit_price: "22.00" }),
      saleItem({ product_id: "p2" }),
    ]);

    expect(
      buildSaleCorrection(preview, [
        undefined,
        { cantidad: "2", precio_unitario: "24.50" },
      ]).valores,
    ).toEqual({
      items: [
        { producto_id: "p1", cantidad: "2", precio_unitario: "22.00" },
        { producto_id: "p2", cantidad: "2", precio_unitario: "24.50" },
      ],
    });
  });
});

describe("buildPurchaseCorrection", () => {
  it("sends every item with quantity and cost", () => {
    const decision = buildPurchaseCorrection(
      {
        proveedor: "Granja",
        referencia: null,
        fecha: "2026-09-30",
        medio_pago: "efectivo",
        notas: null,
        total: "100.00",
        items: [
          {
            producto_id: "p1",
            producto_nombre: "Cartón",
            producto_sku: "CART",
            producto_activo: true,
            producto_existe: true,
            cantidad: "5",
            costo_unitario: "20.00",
            subtotal: "100.00",
          },
        ],
      },
      [{ cantidad: "6", costo_unitario: "19.00" }],
    );

    expect(decision.valores).toEqual({
      items: [{ producto_id: "p1", cantidad: "6", costo_unitario: "19.00" }],
    });
  });
});

describe("buildCashMovementCorrection", () => {
  const movement = {
    tipo: "aporte_socio" as const,
    monto: "500",
    fecha: "2026-09-30",
    medio_pago: "efectivo" as const,
    compra_id: null,
    venta_id: null,
    nota: null,
  };

  it("only sends the fields that changed", () => {
    expect(
      buildCashMovementCorrection(movement, {
        monto: "450",
        medio_pago: "efectivo",
      }),
    ).toEqual({ accion: "corregir", valores: { monto: "450" } });
  });

  it("returns null when nothing changed", () => {
    expect(buildCashMovementCorrection(movement, { monto: "500" })).toBeNull();
  });
});
