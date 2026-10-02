/**
 * Mentions and commands of the rich composer. They travel next to `mensaje`
 * in `POST /stream` and come back in `/state`. See
 * `docs/superpowers/specs/2026-10-02-composer-enriquecido-design.md`.
 */

export const COMMANDS = ["venta", "compra", "cobro", "caja"] as const;
export type Comando = (typeof COMMANDS)[number];

export type MentionTipo = "cliente" | "producto" | "venta";

/** `[inicio, fin)` inside `mensaje`, in Unicode code points (as Python counts). */
export interface Mencion {
  tipo: MentionTipo;
  id: string;
  nombre: string;
  inicio: number;
  fin: number;
}

/** What the composer sends. Empty `comando`/`menciones` are left out. */
export interface OutgoingMessage {
  mensaje: string;
  comando?: Comando;
  menciones?: Mencion[];
}

export type MessageSegment =
  | { kind: "text"; text: string }
  | { kind: "mention"; text: string; mencion: Mencion };

/** JS strings count UTF-16 units; the contract counts code points. */
export const codePointLength = (value: string) => Array.from(value).length;

const isValidLayout = (length: number, sorted: Mencion[]) => {
  let previousEnd = 0;
  for (const { inicio, fin } of sorted) {
    if (!Number.isInteger(inicio) || !Number.isInteger(fin)) return false;
    if (inicio < previousEnd || fin <= inicio || fin > length) return false;
    previousEnd = fin;
  }
  return true;
};

/**
 * Splits a stored message into text and mentions. Anything inconsistent
 * (out of range, overlapping) shows the whole text plain instead of
 * breaking the bubble.
 */
export const splitMentions = (
  texto: string,
  menciones: Mencion[] = [],
): MessageSegment[] => {
  if (menciones.length === 0) return [{ kind: "text", text: texto }];

  const chars = Array.from(texto);
  const sorted = [...menciones].sort((a, b) => a.inicio - b.inicio);
  if (!isValidLayout(chars.length, sorted)) {
    return [{ kind: "text", text: texto }];
  }

  const segments: MessageSegment[] = [];
  let cursor = 0;
  for (const mencion of sorted) {
    if (mencion.inicio > cursor) {
      segments.push({ kind: "text", text: chars.slice(cursor, mencion.inicio).join("") });
    }
    segments.push({
      kind: "mention",
      text: chars.slice(mencion.inicio, mencion.fin).join(""),
      mencion,
    });
    cursor = mencion.fin;
  }
  if (cursor < chars.length) {
    segments.push({ kind: "text", text: chars.slice(cursor).join("") });
  }
  return segments;
};
