import type { JSONContent } from "@tiptap/core";

import {
  codePointLength,
  COMMANDS,
  type Comando,
  type Mencion,
  type OutgoingMessage,
} from "../../domain/mentions";
import { NODE } from "./schema";
import { buildTemplate } from "./templates";

const MENTION_TIPOS = new Set(["cliente", "producto", "venta"]);

/**
 * Turns the editor document into what `POST /stream` expects. Empty slots
 * add nothing, so the spaces and separators they leave behind are cleaned
 * up; mention ranges are measured on the final text, in code points.
 */
export const serializeMessage = (doc: JSONContent): OutgoingMessage => {
  let out = "";
  let comando: Comando | undefined;
  const menciones: Mencion[] = [];

  const append = (piece: string) => {
    // Collapse the double spaces an empty slot leaves between two texts.
    out += out === "" || /[ \n]$/.test(out) ? piece.replace(/^ +/, "") : piece;
  };

  const walk = (node: JSONContent) => {
    switch (node.type) {
      case "text":
        append(node.text ?? "");
        return;
      case "hardBreak":
        out = out.replace(/ +$/, "");
        append("\n");
        return;
      case NODE.commandChip:
        if ((COMMANDS as readonly unknown[]).includes(node.attrs?.comando)) {
          comando = node.attrs?.comando as Comando;
        }
        return;
      case NODE.slot:
        return;
      case NODE.mention: {
        const { tipo, id, nombre } = node.attrs ?? {};
        const label = `@${nombre ?? ""}`;
        if (!id || !MENTION_TIPOS.has(tipo)) {
          append(label);
          return;
        }
        const inicio = codePointLength(out);
        out += label;
        menciones.push({ tipo, id, nombre, inicio, fin: codePointLength(out) });
        return;
      }
      case "paragraph":
        if (out !== "") append("\n");
        node.content?.forEach(walk);
        return;
      default:
        node.content?.forEach(walk);
    }
  };

  walk(doc);

  // Trailing spaces and separators left by unfilled slots ("…, " / "…: "),
  // never cutting into the last mention.
  const lastEnd = menciones.at(-1)?.fin ?? 0;
  const trimmed = out.replace(/[\s,:]+$/, "");
  const mensaje = codePointLength(trimmed) >= lastEnd ? trimmed : out;

  return {
    mensaje,
    ...(comando ? { comando } : {}),
    ...(menciones.length ? { menciones } : {}),
  };
};

const withoutSpaces = (value: string) => Array.from(value.replace(/\s+/g, ""));

/** Whether `part` can be read in `whole` by only deleting characters. */
const isSubsequence = (part: string[], whole: string[]) => {
  let index = 0;
  for (const char of whole) {
    if (char === part[index]) index++;
  }
  return index === part.length;
};

/**
 * Whether the person wrote or chose anything. A command's template left as
 * it is (or only trimmed) is not something to send: its text is all
 * connectors ("Vendí a", "de").
 */
export const hasUserContent = (doc: JSONContent): boolean => {
  const { mensaje, comando, menciones } = serializeMessage(doc);
  if (menciones) return true;
  const fixed = comando
    ? buildTemplate(comando)
        .map((node) => (node.type === "text" ? (node.text ?? "") : ""))
        .join("")
    : "";
  return !isSubsequence(withoutSpaces(mensaje), withoutSpaces(fixed));
};
