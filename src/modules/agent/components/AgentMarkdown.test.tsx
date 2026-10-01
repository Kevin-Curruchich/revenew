import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AgentMarkdown } from "./AgentMarkdown";

const render = (text: string) => renderToStaticMarkup(<AgentMarkdown text={text} />);

describe("AgentMarkdown", () => {
  it("renders the GFM the agent writes: bold, code and tables", () => {
    const html = render(
      [
        "**Stock actual (global):**",
        "",
        "| Producto | Stock |",
        "|---|---|",
        "| Cilindro de gas | **2.0** |",
        "",
        "Hay 13 en estado `overdue`.",
      ].join("\n"),
    );

    expect(html).toContain("<strong");
    expect(html).toContain("<table");
    expect(html).toContain("Cilindro de gas</td>");
    expect(html).toContain("<code");
    expect(html).not.toContain("|---|");
  });

  it("does not inject raw HTML from the model output", () => {
    const html = render('Hola <img src=x onerror="alert(1)"> <script>x</script>');
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<script");
  });

  it("tolerates half-streamed markdown", () => {
    expect(() => render("| Producto | Stock |\n|---|")).not.toThrow();
    expect(() => render("**sin cerrar")).not.toThrow();
  });
});
