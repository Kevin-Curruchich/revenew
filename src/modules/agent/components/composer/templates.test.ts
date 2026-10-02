import { describe, expect, it } from "vitest";
import { buildTemplate, itemRow } from "./templates";

const slotTipos = (nodes: ReturnType<typeof buildTemplate>) =>
  nodes.filter((node) => node.type === "slot").map((node) => node.attrs?.tipo);

describe("buildTemplate", () => {
  it("starts with the command chip", () => {
    expect(buildTemplate("venta")[0]).toEqual({ type: "commandChip", attrs: { comando: "venta" } });
  });

  it("has the slots of each command, in order", () => {
    expect(slotTipos(buildTemplate("venta"))).toEqual(["cantidad", "producto", "cliente", "pagado"]);
    expect(slotTipos(buildTemplate("compra"))).toEqual(["cantidad", "producto", "costo"]);
    expect(slotTipos(buildTemplate("cobro"))).toEqual(["cliente", "venta", "medio"]);
    expect(slotTipos(buildTemplate("caja"))).toEqual(["tipo_caja", "monto", "nota"]);
  });
});

describe("itemRow", () => {
  it("adds a quantity and a product", () => {
    expect(itemRow()[0]).toEqual({ type: "text", text: ", " });
    expect(slotTipos(itemRow())).toEqual(["cantidad", "producto"]);
  });
});
