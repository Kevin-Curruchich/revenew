import { describe, expect, it } from "vitest";
import { codePointLength, splitMentions, type Mencion } from "./mentions";

const aurita: Mencion = { tipo: "cliente", id: "c1", nombre: "Aurita", inicio: 28, fin: 35 };
const carton: Mencion = { tipo: "producto", id: "p1", nombre: "Cartón de huevos", inicio: 8, fin: 25 };
const text = "Vendí 2 @Cartón de huevos a @Aurita, no pagado";

describe("codePointLength", () => {
  it("counts an emoji as one", () => {
    expect(codePointLength("🥚a")).toBe(2);
    expect("🥚a".length).toBe(3);
  });
});

describe("splitMentions", () => {
  it("returns plain text when there are no mentions", () => {
    expect(splitMentions("hola")).toEqual([{ kind: "text", text: "hola" }]);
  });

  it("splits text and mentions in order, whatever the input order", () => {
    expect(splitMentions(text, [aurita, carton])).toEqual([
      { kind: "text", text: "Vendí 2 " },
      { kind: "mention", text: "@Cartón de huevos", mencion: carton },
      { kind: "text", text: " a " },
      { kind: "mention", text: "@Aurita", mencion: aurita },
      { kind: "text", text: ", no pagado" },
    ]);
  });

  it("counts ranges in code points (emoji before a mention)", () => {
    const mencion: Mencion = { ...aurita, inicio: 2, fin: 9 };
    expect(splitMentions("🥚 @Aurita", [mencion])).toEqual([
      { kind: "text", text: "🥚 " },
      { kind: "mention", text: "@Aurita", mencion },
    ]);
  });

  it("falls back to plain text when a range is out of the text", () => {
    expect(splitMentions("hola", [{ ...aurita, inicio: 2, fin: 40 }])).toEqual([
      { kind: "text", text: "hola" },
    ]);
  });

  it("falls back to plain text when ranges overlap", () => {
    expect(
      splitMentions(text, [carton, { ...aurita, inicio: 20, fin: 30 }]),
    ).toEqual([{ kind: "text", text }]);
  });

  it("falls back to plain text on an empty or negative range", () => {
    expect(splitMentions(text, [{ ...aurita, inicio: 5, fin: 5 }])).toEqual([{ kind: "text", text }]);
    expect(splitMentions(text, [{ ...aurita, inicio: -1, fin: 3 }])).toEqual([{ kind: "text", text }]);
  });
});
