import { describe, expect, it } from "vitest";
import type { Customer } from "@/modules/customers/domain/customer";
import type { ProductForSale } from "@/modules/products/domain/product";
import type { Sale } from "@/modules/sales/domain/sale";
import { toCustomerOption, toProductOption, toSaleOption } from "./mention-options";

describe("mention options", () => {
  it("uses the customer name and company", () => {
    const option = toCustomerOption({ id: "c1", name: "Aurita", company: "Tienda" } as Customer);
    expect(option).toEqual({ tipo: "cliente", id: "c1", nombre: "Aurita", detalle: "Tienda", sinStock: false });
  });

  it("shows stock and suggested price, and flags products without stock", () => {
    const base = { id: "p1", name: "Cartón", stock: 3, first_available_lot: { suggested_unit_price: "33.33" } };
    expect(toProductOption(base as unknown as ProductForSale)).toMatchObject({
      tipo: "producto",
      nombre: "Cartón",
      sinStock: false,
    });
    expect(toProductOption(base as unknown as ProductForSale).detalle).toContain("Stock 3");
    const empty = toProductOption({ ...base, stock: 0, first_available_lot: null } as unknown as ProductForSale);
    expect(empty).toMatchObject({ sinStock: true, detalle: "Sin stock" });
  });

  it("names a sale by its date and total", () => {
    const option = toSaleOption({ id: "s1", date: "2026-09-24", total: 33.33 } as Sale);
    expect(option.tipo).toBe("venta");
    expect(option.nombre).toMatch(/^Venta 24\/09 · Q\s?33\.33$/);
  });
});
