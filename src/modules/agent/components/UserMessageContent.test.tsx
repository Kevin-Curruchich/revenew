import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { Comando, Mencion } from "../domain/mentions";
import { UserMessageContent } from "./UserMessageContent";

const render = (text: string, menciones?: Mencion[], comando?: string) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <UserMessageContent text={text} menciones={menciones} comando={comando as Comando | undefined} />
    </MemoryRouter>,
  );

describe("UserMessageContent", () => {
  it("links each mention to its page and shows the command", () => {
    const html = render(
      "Vendí @Cartón a @Aurita",
      [
        { tipo: "producto", id: "p1", nombre: "Cartón", inicio: 6, fin: 13 },
        { tipo: "cliente", id: "c1", nombre: "Aurita", inicio: 16, fin: 23 },
      ],
      "venta",
    );
    expect(html).toContain('href="/products/p1"');
    expect(html).toContain('href="/customers/c1"');
    expect(html).toContain("Venta");
  });

  it("links a sale mention to the sale", () => {
    const html = render("@Venta 24/09 · Q33.33", [
      { tipo: "venta", id: "s1", nombre: "Venta 24/09 · Q33.33", inicio: 0, fin: 21 },
    ]);
    expect(html).toContain('href="/sales/s1"');
  });

  it("shows plain text when the ranges are broken", () => {
    const html = render("hola", [
      { tipo: "cliente", id: "c1", nombre: "x", inicio: 3, fin: 99 },
    ]);
    expect(html).toBe("hola");
  });

  it("survives a command or mention type it doesn't know", () => {
    const html = render(
      "Fiado a @Aurita",
      [{ tipo: "proveedor" as Mencion["tipo"], id: "x1", nombre: "Aurita", inicio: 8, fin: 15 }],
      "fiado",
    );
    expect(html).toContain("fiado");
    expect(html).toContain("@Aurita");
    expect(html).not.toContain("href");
  });
});
