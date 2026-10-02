# Composer enriquecido (menciones y comandos) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el `Textarea` del chat del agente por un editor Tiptap con menciones `@` (cliente, producto, venta pendiente), comandos `/` con plantillas de huecos, y etiquetas en el historial; el mensaje viaja como `{ mensaje, comando?, menciones? }`.

**Architecture:** La lógica vive en funciones puras testeables en Node (`domain/mentions.ts`, `composer/templates.ts`, `composer/serialize.ts`, `composer/doc-helpers.ts`, `composer/menu-controller.ts`, `src/lib/debounce.ts`). Los nodos de Tiptap y el cableado del editor (`composer/extensions.ts`, `composer/useComposerEditor.ts`) son delgados y se verifican a mano en el navegador. La lista de sugerencias es un componente React anclado encima del composer (no al caret), alimentado por un `MenuController` externo vía `useSyncExternalStore`.

**Tech Stack:** React 19, TypeScript, Tiptap 3 (`@tiptap/react`, `@tiptap/pm`, `@tiptap/core`, `@tiptap/suggestion`, `@tiptap/extensions`, document/paragraph/text/hard-break), React Query 5, Vitest 3 (entorno Node, sin DOM), Tailwind 4, yarn.

**Spec:** `docs/superpowers/specs/2026-10-02-composer-enriquecido-design.md`

## Global Constraints

- `inicio`/`fin` de cada mención: rango `[inicio, fin)` en **code points de Unicode** (usar `Array.from`), incluida la `@`.
- `comando` ∈ `venta` | `compra` | `cobro` | `caja`. `tipo` de mención ∈ `cliente` | `producto` | `venta`.
- `mensaje` sigue siendo string; `comando` y `menciones` se omiten del body cuando no hay (un mensaje sin ellos debe ser idéntico al de hoy).
- Nombre de una mención de venta: `Venta DD/MM · <formatCurrency(total)>` (p. ej. "Venta 24/09 · Q33.33").
- Búsquedas: debounce 200 ms, `limit: 8`, endpoints existentes (`/customers`, `/products/for-sale`, `/sales?customer_id&is_payment_pending=true`).
- Enter envía salvo con la lista abierta; Shift+Enter salto de línea; Escape cierra la lista.
- Tiptap solo se importa desde `src/modules/agent` (el módulo ya se carga con lazy load en `src/router/app.router.tsx`); ningún otro módulo puede importarlo.
- Textos de UI en español; comentarios de código en inglés, al estilo del módulo.
- El backend (ai-sales-assistant PR #13) se despliega antes que este panel: el viejo ignora los campos nuevos y el agente no recibiría los ids.

## Review Focus

- Mención cuyo nombre o texto previo tiene emoji: los rangos deben contar code points, no UTF-16 (test en Task 1 y Task 5).
- Enter con la lista abierta mostrando solo un aviso ("Sin resultados", "No se pudo buscar"): no debe enviar el mensaje (test en Task 6).
- HTML pegado con un `span[data-mention]` sin id: no debe producir una mención con `id` nulo; se envía como texto (test en Task 5).
- Respuestas de búsqueda que llegan fuera de orden: la lista no debe mostrar resultados de una consulta vieja (test en Task 4).
- Rangos inválidos o superpuestos que vengan de `/state`: la burbuja muestra texto plano en vez de romper (test en Task 1).

---

## File Structure

```
src/lib/debounce.ts (+ .test.ts)                     debounceLatest
src/modules/agent/
├── domain/
│   ├── mentions.ts (+ .test.ts)                     tipos Comando/Mencion/OutgoingMessage, splitMentions
│   ├── agent.ts                                     StoredMessage usuario + comando/menciones
│   ├── conversation.ts (+ .test.ts)                 ChatItem usuario + turn-open con message
│   └── labels.ts                                    commandLabels, mentionGroupLabels
├── actions/
│   ├── stream-agent.ts                              AgentStreamRequest con campos nuevos
│   └── search-mentions.ts (+ .test.ts)              búsqueda y mapeo a MentionOption
├── hooks/useAgentConversation.ts                    sendMessage(OutgoingMessage)
└── components/
    ├── ChatMessages.tsx                             usa UserMessageContent
    ├── UserMessageContent.tsx (+ .test.tsx)         etiquetas y enlaces en la burbuja
    ├── ChatComposer.tsx                             editor Tiptap en lugar del Textarea
    └── composer/
        ├── schema.ts                                nombres de nodos, SlotTipo, opciones de huecos
        ├── templates.ts (+ .test.ts)                buildTemplate, itemRow
        ├── serialize.ts (+ .test.ts)                serializeMessage
        ├── doc-helpers.ts (+ .test.ts)              findSlotPos, getCommand, findCustomerMention, productBefore
        ├── extensions.ts                            MentionNode, CommandChipNode, SlotNode, ComposerKeys, ComposerSuggestions, SlotBehavior
        ├── menu-controller.ts (+ .test.ts)          estado de la lista y teclado
        ├── ComposerMenu.tsx                         lista agrupada encima del composer
        └── useComposerEditor.ts                     arma el editor con sus extensiones
```

---

### Task 1: Tipos de menciones y `splitMentions`

**Files:**
- Create: `src/modules/agent/domain/mentions.ts`
- Test: `src/modules/agent/domain/mentions.test.ts`

**Interfaces:**
- Produces: `COMMANDS`, `type Comando`, `type MentionTipo`, `interface Mencion`, `interface OutgoingMessage`, `type MessageSegment`, `codePointLength(s: string): number`, `splitMentions(texto: string, menciones?: Mencion[]): MessageSegment[]`.

- [ ] **Step 1: Write the failing test**

```ts
// src/modules/agent/domain/mentions.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run src/modules/agent/domain/mentions.test.ts`
Expected: FAIL, "Failed to resolve import ./mentions".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/modules/agent/domain/mentions.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest run src/modules/agent/domain/mentions.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/agent/domain/mentions.ts src/modules/agent/domain/mentions.test.ts
git commit -m "feat(agent): mention types and splitMentions"
```

---

### Task 2: Contrato del stream, reducer y hook

**Files:**
- Modify: `src/modules/agent/domain/agent.ts` (tipo `StoredMessage`)
- Modify: `src/modules/agent/actions/stream-agent.ts` (tipo `AgentStreamRequest`)
- Modify: `src/modules/agent/domain/conversation.ts` (`ChatItem`, `fromThreadState`, acción `turn-open`)
- Modify: `src/modules/agent/hooks/useAgentConversation.ts` (`sendMessage`)
- Modify: `src/modules/agent/components/ChatComposer.tsx` (solo la firma de `onSend`, el editor llega en Task 7)
- Test: `src/modules/agent/domain/conversation.test.ts`

**Interfaces:**
- Consumes: `Comando`, `Mencion`, `OutgoingMessage` (Task 1).
- Produces: `ChatItem` usuario `{ id; kind: "user"; text; comando?: Comando; menciones?: Mencion[] }`; acción `{ type: "turn-open"; message?: OutgoingMessage; clearPending?: boolean }`; `sendMessage(message: OutgoingMessage): Promise<boolean>`; `ChatComposerProps.onSend: (message: OutgoingMessage) => Promise<boolean>`.

- [ ] **Step 1: Write the failing test** (agregar al final del `describe` existente en `conversation.test.ts`)

```ts
  it("shows the sent message with its command and mentions", () => {
    const menciones = [
      { tipo: "cliente" as const, id: "c1", nombre: "Aurita", inicio: 9, fin: 16 },
    ];
    const state = conversationReducer(empty, {
      type: "turn-open",
      message: { mensaje: "Vendí a @Aurita", comando: "venta", menciones },
    });
    expect(state.items).toMatchObject([
      { kind: "user", text: "Vendí a @Aurita", comando: "venta", menciones },
    ]);
  });

  it("restores command and mentions from the saved state", () => {
    const menciones = [
      { tipo: "producto" as const, id: "p1", nombre: "Cartón", inicio: 0, fin: 7 },
    ];
    const state = fromThreadState({
      mensajes: [{ rol: "usuario", texto: "@Cartón", comando: "compra", menciones }],
      confirmaciones_pendientes: [],
    });
    expect(state.items).toMatchObject([
      { kind: "user", text: "@Cartón", comando: "compra", menciones },
    ]);
  });

  it("keeps old messages without mentions as plain text", () => {
    const state = fromThreadState({
      mensajes: [{ rol: "usuario", texto: "hola" }],
      confirmaciones_pendientes: [],
    });
    expect(state.items[0]).toEqual({ id: "saved-0", kind: "user", text: "hola" });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run src/modules/agent/domain/conversation.test.ts`
Expected: FAIL (el primer test no encuentra `comando` en el item; TypeScript de Vitest no bloquea, la aserción sí).

- [ ] **Step 3: Write minimal implementation**

`agent.ts`, reemplazar `StoredMessage`:

```ts
import type { Comando, Mencion } from "./mentions";

/** A message as returned by `GET /threads/{id}/state`. */
export type StoredMessage =
  | { rol: "usuario"; texto: string; comando?: Comando; menciones?: Mencion[] }
  | { rol: "asistente"; texto: string }
  | { rol: "herramienta"; nombre: string };
```

`stream-agent.ts`, reemplazar `AgentStreamRequest`:

```ts
import type { Comando, Mencion } from "../domain/mentions";

export type AgentStreamRequest =
  | {
      thread_id: string;
      mensaje: string;
      comando?: Comando;
      menciones?: Mencion[];
    }
  // `interrupt_id` is a SIBLING of `decision`, never nested inside it.
  | { thread_id: string; interrupt_id: string; decision: Decision };
```

`conversation.ts`:

```ts
import type { AgentEvent, AnyConfirmation, ThreadState } from "./agent";
import type { Comando, Mencion, OutgoingMessage } from "./mentions";

export type ChatItem =
  | {
      id: string;
      kind: "user";
      text: string;
      comando?: Comando;
      menciones?: Mencion[];
    }
  | { id: string; kind: "assistant"; text: string; streaming: boolean }
  | { id: string; kind: "tool"; name: string };
```

En `ConversationAction`, reemplazar la variante `turn-open`:

```ts
  /** The server accepted the request: the stream is open. */
  | { type: "turn-open"; message?: OutgoingMessage; clearPending?: boolean }
```

En `fromThreadState`, reemplazar la rama de usuario (los campos solo se agregan si vienen, para que los mensajes viejos queden iguales):

```ts
    if (message.rol === "usuario")
      return {
        id,
        kind: "user",
        text: message.texto,
        ...(message.comando ? { comando: message.comando } : {}),
        ...(message.menciones?.length ? { menciones: message.menciones } : {}),
      };
```

En el reducer, reemplazar el caso `turn-open`:

```ts
    case "turn-open":
      return {
        ...state,
        items: action.message
          ? [
              ...state.items,
              {
                id: newId(),
                kind: "user",
                text: action.message.mensaje,
                ...(action.message.comando
                  ? { comando: action.message.comando }
                  : {}),
                ...(action.message.menciones?.length
                  ? { menciones: action.message.menciones }
                  : {}),
              },
            ]
          : state.items,
        // Answering one confirmation re-announces the others in this same
        // stream, so the local copies are dropped instead of cached.
        pending: action.clearPending ? [] : state.pending,
      };
```

`useAgentConversation.ts`, reemplazar `sendMessage` (e importar `OutgoingMessage` de `../domain/mentions`):

```ts
  const sendMessage = (message: OutgoingMessage) =>
    runTurn(
      {
        thread_id: threadId,
        mensaje: message.mensaje,
        // Without mentions the body is exactly what the server got before.
        ...(message.comando ? { comando: message.comando } : {}),
        ...(message.menciones?.length ? { menciones: message.menciones } : {}),
      },
      () => dispatch({ type: "turn-open", message }),
    );
```

`ChatComposer.tsx` (provisional hasta Task 7): cambiar la prop y la llamada.

```ts
import type { OutgoingMessage } from "../domain/mentions";

interface ChatComposerProps {
  onSend: (message: OutgoingMessage) => Promise<boolean>;
  /** Why the input is blocked, or `null` when the person can write. */
  disabledReason: string | null;
}
// ...dentro de submit:
    const accepted = await onSend({ mensaje: message });
```

- [ ] **Step 4: Run tests, typecheck and lint**

Run: `yarn vitest run src/modules/agent && yarn tsc -b && yarn lint`
Expected: todo PASS, sin errores de tipos.

- [ ] **Step 5: Commit**

```bash
git add src/modules/agent
git commit -m "feat(agent): send and restore command and mentions with user messages"
```

---

### Task 3: Etiquetas en el historial

**Files:**
- Create: `src/modules/agent/components/UserMessageContent.tsx`
- Modify: `src/modules/agent/components/ChatMessages.tsx` (burbuja de usuario)
- Modify: `src/modules/agent/domain/labels.ts` (agregar `commandLabels`)
- Test: `src/modules/agent/components/UserMessageContent.test.tsx`

**Interfaces:**
- Consumes: `splitMentions`, `Comando`, `Mencion`, `MentionTipo` (Task 1); `ChatItem` usuario (Task 2).
- Produces: `UserMessageContent({ text, comando?, menciones? })`; `commandLabels: Record<Comando, { label: string; description: string }>`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/agent/components/UserMessageContent.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { Mencion } from "../domain/mentions";
import { UserMessageContent } from "./UserMessageContent";

const render = (text: string, menciones?: Mencion[], comando?: "venta") =>
  renderToStaticMarkup(
    <MemoryRouter>
      <UserMessageContent text={text} menciones={menciones} comando={comando} />
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run src/modules/agent/components/UserMessageContent.test.tsx`
Expected: FAIL, "Failed to resolve import ./UserMessageContent".

- [ ] **Step 3: Write minimal implementation**

`labels.ts`, agregar (importando `Comando` de `./mentions`):

```ts
export const commandLabels: Record<Comando, { label: string; description: string }> = {
  venta: { label: "Venta", description: "Registrar una venta" },
  compra: { label: "Compra", description: "Registrar una compra" },
  cobro: { label: "Cobro", description: "Cobrar una venta a crédito" },
  caja: { label: "Caja", description: "Entrada, salida, aporte o retiro" },
};
```

```tsx
// src/modules/agent/components/UserMessageContent.tsx
import { Link } from "react-router";

import { commandLabels } from "../domain/labels";
import {
  splitMentions,
  type Comando,
  type Mencion,
  type MentionTipo,
} from "../domain/mentions";

const mentionHref: Record<MentionTipo, (id: string) => string> = {
  cliente: (id) => `/customers/${id}`,
  producto: (id) => `/products/${id}`,
  venta: (id) => `/sales/${id}`,
};

interface UserMessageContentProps {
  text: string;
  comando?: Comando;
  menciones?: Mencion[];
}

/** What the person typed, verbatim, with mentions as links. */
export const UserMessageContent = ({
  text,
  comando,
  menciones,
}: UserMessageContentProps) => {
  const segments = splitMentions(text, menciones);
  if (!comando && segments.length === 1 && segments[0].kind === "text") {
    return text;
  }
  return (
    <>
      {comando ? (
        <span className="mb-1 block text-xs font-semibold tracking-wide uppercase opacity-80">
          {commandLabels[comando].label}
        </span>
      ) : null}
      {segments.map((segment, index) =>
        segment.kind === "text" ? (
          segment.text
        ) : (
          <Link
            key={index}
            to={mentionHref[segment.mencion.tipo](segment.mencion.id)}
            className="rounded bg-primary-foreground/20 px-1 font-medium underline-offset-2 hover:underline"
          >
            {segment.text}
          </Link>
        ),
      )}
    </>
  );
};
```

`ChatMessages.tsx`: importar `UserMessageContent` y reemplazar la línea `{isUser ? item.text : <AgentMarkdown text={item.text} />}` por:

```tsx
        {item.kind === "user" ? (
          <UserMessageContent
            text={item.text}
            comando={item.comando}
            menciones={item.menciones}
          />
        ) : (
          <AgentMarkdown text={item.text} />
        )}
```

- [ ] **Step 4: Run tests, typecheck and lint**

Run: `yarn vitest run src/modules/agent && yarn tsc -b && yarn lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/agent
git commit -m "feat(agent): show mentions and command in user messages"
```

---

### Task 4: Búsquedas para las menciones

**Files:**
- Create: `src/lib/debounce.ts`, `src/lib/debounce.test.ts`
- Create: `src/modules/agent/actions/search-mentions.ts`, `src/modules/agent/actions/search-mentions.test.ts`

**Interfaces:**
- Produces:
  - `debounceLatest<A extends unknown[], R>(fn: (...args: A) => Promise<R>, ms: number): (...args: A) => Promise<R>`
  - `type MentionFilter = { kind: "any" } | { kind: "cliente" } | { kind: "producto" } | { kind: "venta"; customerId: string | null }`
  - `interface MentionOption { tipo: MentionTipo; id: string; nombre: string; detalle: string | null; sinStock: boolean }`
  - `toCustomerOption(c: Customer): MentionOption`, `toProductOption(p: ProductForSale): MentionOption`, `toSaleOption(s: Sale): MentionOption`
  - `searchMentions(queryClient: QueryClient, filter: MentionFilter, query: string): Promise<MentionOption[]>`

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/debounce.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounceLatest } from "./debounce";

describe("debounceLatest", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("runs once with the last arguments and resolves every caller with it", async () => {
    const fn = vi.fn(async (query: string) => query.toUpperCase());
    const search = debounceLatest(fn, 200);
    const first = search("a");
    const second = search("ab");
    await vi.advanceTimersByTimeAsync(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(await first).toBe("AB");
    expect(await second).toBe("AB");
  });

  it("never resolves an old call with a slower, older response", async () => {
    let release: (value: string) => void = () => {};
    const fn = vi
      .fn<(query: string) => Promise<string>>()
      .mockImplementationOnce(() => new Promise((resolve) => (release = resolve)))
      .mockImplementationOnce(async () => "new");
    const search = debounceLatest(fn, 200);
    const old = search("old");
    await vi.advanceTimersByTimeAsync(200);
    const fresh = search("new");
    await vi.advanceTimersByTimeAsync(200);
    release("old");
    expect(await fresh).toBe("new");
    // The superseded call follows the newest answer, not its own.
    expect(await old).toBe("new");
  });
});
```

```ts
// src/modules/agent/actions/search-mentions.test.ts
import { describe, expect, it } from "vitest";
import type { Customer } from "@/modules/customers/domain/customer";
import type { ProductForSale } from "@/modules/products/domain/product";
import type { Sale } from "@/modules/sales/domain/sale";
import { toCustomerOption, toProductOption, toSaleOption } from "./search-mentions";

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn vitest run src/lib/debounce.test.ts src/modules/agent/actions/search-mentions.test.ts`
Expected: FAIL, imports sin resolver.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/debounce.ts
/**
 * Debounces an async function. Every call made while waiting resolves with
 * the result of the LAST call, and a response that arrives after a newer
 * call started is ignored: suggestion lists never show stale results.
 */
export const debounceLatest = <A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  ms: number,
) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  let waiting: Array<{ resolve: (value: R) => void; reject: (error: unknown) => void }> = [];

  return (...args: A): Promise<R> =>
    new Promise<R>((resolve, reject) => {
      waiting.push({ resolve, reject });
      clearTimeout(timer);
      const current = ++generation;
      timer = setTimeout(() => {
        fn(...args).then(
          (value) => {
            if (current !== generation) return;
            const batch = waiting;
            waiting = [];
            batch.forEach((caller) => caller.resolve(value));
          },
          (error) => {
            if (current !== generation) return;
            const batch = waiting;
            waiting = [];
            batch.forEach((caller) => caller.reject(error));
          },
        );
      }, ms);
    });
};
```

```ts
// src/modules/agent/actions/search-mentions.ts
import dayjs from "dayjs";
import type { QueryClient } from "@tanstack/react-query";

import { formatCurrency } from "@/lib/formatters";
import { getCustomers } from "@/modules/customers/actions/get-customers";
import { customerKeys } from "@/modules/customers/hooks/query-keys";
import type { Customer } from "@/modules/customers/domain/customer";
import { getProductsForSale } from "@/modules/products/actions/get-products-for-sale";
import { productKeys } from "@/modules/products/hooks/query-keys";
import type { ProductForSale } from "@/modules/products/domain/product";
import { getSales } from "@/modules/sales/actions/get-sales";
import { saleKeys } from "@/modules/sales/hooks/query-keys";
import type { Sale } from "@/modules/sales/domain/sale";
import { formatQuantity } from "../domain/labels";
import type { MentionTipo } from "../domain/mentions";

const LIMIT = 8;
const STALE_TIME = 30_000;

export type MentionFilter =
  | { kind: "any" }
  | { kind: "cliente" }
  | { kind: "producto" }
  /** Pending sales of the customer already mentioned (`null`: none yet). */
  | { kind: "venta"; customerId: string | null };

export interface MentionOption {
  tipo: MentionTipo;
  id: string;
  nombre: string;
  detalle: string | null;
  sinStock: boolean;
}

export const toCustomerOption = (customer: Customer): MentionOption => ({
  tipo: "cliente",
  id: customer.id,
  nombre: customer.name,
  detalle: customer.company,
  sinStock: false,
});

export const toProductOption = (product: ProductForSale): MentionOption => {
  const sinStock = product.stock <= 0;
  const price = product.first_available_lot?.suggested_unit_price;
  return {
    tipo: "producto",
    id: product.id,
    nombre: product.name,
    detalle: sinStock
      ? "Sin stock"
      : `Stock ${formatQuantity(product.stock)} · ${formatCurrency(price)}`,
    sinStock,
  };
};

export const toSaleOption = (sale: Sale): MentionOption => ({
  tipo: "venta",
  id: sale.id,
  nombre: `Venta ${dayjs(sale.date).format("DD/MM")} · ${formatCurrency(sale.total)}`,
  detalle: null,
  sinStock: false,
});

const searchCustomers = async (queryClient: QueryClient, search: string) => {
  const params = { search, limit: LIMIT };
  const response = await queryClient.fetchQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => getCustomers(params),
    staleTime: STALE_TIME,
  });
  return response.data.map(toCustomerOption);
};

const searchProducts = async (queryClient: QueryClient, search: string) => {
  const params = { search, limit: LIMIT };
  const products = await queryClient.fetchQuery({
    queryKey: productKeys.forSale(params),
    queryFn: () => getProductsForSale(params),
    staleTime: STALE_TIME,
  });
  return products.map(toProductOption);
};

const searchPendingSales = async (queryClient: QueryClient, customerId: string) => {
  const params = { customer_id: customerId, is_payment_pending: "true", limit: LIMIT };
  const response = await queryClient.fetchQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => getSales(params),
    staleTime: STALE_TIME,
  });
  return response.data.map(toSaleOption);
};

export const searchMentions = async (
  queryClient: QueryClient,
  filter: MentionFilter,
  query: string,
): Promise<MentionOption[]> => {
  switch (filter.kind) {
    case "cliente":
      return searchCustomers(queryClient, query);
    case "producto":
      return searchProducts(queryClient, query);
    case "venta":
      return filter.customerId ? searchPendingSales(queryClient, filter.customerId) : [];
    case "any": {
      const [customers, products] = await Promise.all([
        searchCustomers(queryClient, query),
        searchProducts(queryClient, query),
      ]);
      return [...customers, ...products];
    }
  }
};
```

Nota: `getSales` (`src/modules/sales/actions/get-sales.ts`) y `saleKeys.list` ya existen; la búsqueda de ventas no filtra por texto (un cliente tiene pocas ventas pendientes).

- [ ] **Step 4: Run tests, typecheck and lint**

Run: `yarn vitest run src/lib src/modules/agent && yarn tsc -b && yarn lint`
Expected: PASS. Si el test de `toSaleOption` falla solo por el espacio que `Intl` pone entre "Q" y el número, el regex ya lo tolera; no cambiar `formatCurrency`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/debounce.ts src/lib/debounce.test.ts src/modules/agent/actions
git commit -m "feat(agent): search customers, products and pending sales for mentions"
```

---

### Task 5: Dependencias de Tiptap, plantillas y `serializeMessage`

**Files:**
- Modify: `package.json`, `yarn.lock` (dependencias)
- Create: `src/modules/agent/components/composer/schema.ts`
- Create: `src/modules/agent/components/composer/templates.ts`, `templates.test.ts`
- Create: `src/modules/agent/components/composer/serialize.ts`, `serialize.test.ts`

**Interfaces:**
- Consumes: `Comando`, `Mencion`, `MentionTipo`, `OutgoingMessage`, `codePointLength` (Task 1).
- Produces:
  - `schema.ts`: `NODE = { mention: "mention", commandChip: "commandChip", slot: "slot" } as const`; `type SlotTipo = "cantidad" | "producto" | "cliente" | "venta" | "pagado" | "medio" | "monto" | "costo" | "tipo_caja" | "nota"`; `SLOT_PLACEHOLDERS: Record<SlotTipo, string>`; `SLOT_CHOICES: Partial<Record<SlotTipo, string[]>>`; `PICKER_SLOTS: Partial<Record<SlotTipo, MentionTipo>>`.
  - `templates.ts`: `buildTemplate(comando: Comando): JSONContent[]`; `itemRow(): JSONContent[]`.
  - `serialize.ts`: `serializeMessage(doc: JSONContent): OutgoingMessage`.

- [ ] **Step 1: Install dependencies**

Run:
```bash
yarn add @tiptap/core@^3.31.4 @tiptap/react@^3.31.4 @tiptap/pm@^3.31.4 @tiptap/suggestion@^3.31.4 @tiptap/extensions@^3.31.4 @tiptap/extension-document@^3.31.4 @tiptap/extension-paragraph@^3.31.4 @tiptap/extension-text@^3.31.4 @tiptap/extension-hard-break@^3.31.4
```
Expected: se agregan a `dependencies`, `yarn.lock` actualizado.

- [ ] **Step 2: Write the failing tests**

```ts
// src/modules/agent/components/composer/templates.test.ts
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
```

```ts
// src/modules/agent/components/composer/serialize.test.ts
import { describe, expect, it } from "vitest";
import type { JSONContent } from "@tiptap/core";
import { serializeMessage } from "./serialize";

const doc = (...content: JSONContent[]): JSONContent => ({
  type: "doc",
  content: [{ type: "paragraph", content }],
});
const text = (value: string): JSONContent => ({ type: "text", text: value });
const mention = (tipo: string, id: string | null, nombre: string): JSONContent => ({
  type: "mention",
  attrs: { tipo, id, nombre },
});
const slot = (tipo: string): JSONContent => ({ type: "slot", attrs: { tipo, placeholder: tipo } });
const chip = (comando: string): JSONContent => ({ type: "commandChip", attrs: { comando } });

describe("serializeMessage", () => {
  it("builds text, command and code-point ranges", () => {
    const result = serializeMessage(
      doc(chip("venta"), text(" Vendí 2 "), mention("producto", "p1", "Cartón de huevos"),
        text(" a "), mention("cliente", "c1", "Aurita"), text(", no pagado")),
    );
    expect(result).toEqual({
      mensaje: "Vendí 2 @Cartón de huevos a @Aurita, no pagado",
      comando: "venta",
      menciones: [
        { tipo: "producto", id: "p1", nombre: "Cartón de huevos", inicio: 8, fin: 25 },
        { tipo: "cliente", id: "c1", nombre: "Aurita", inicio: 28, fin: 35 },
      ],
    });
  });

  it("drops empty slots, extra spaces and dangling separators", () => {
    const result = serializeMessage(
      doc(chip("venta"), text(" Vendí "), slot("cantidad"), text(" "), mention("producto", "p1", "Cartón"),
        text(" a "), mention("cliente", "c1", "Aurita"), text(", "), slot("pagado")),
    );
    expect(result.mensaje).toBe("Vendí @Cartón a @Aurita");
    expect(result.menciones?.map((m) => [m.inicio, m.fin])).toEqual([[6, 13], [16, 23]]);
  });

  it("supports several product rows", () => {
    const result = serializeMessage(
      doc(chip("venta"), text(" Vendí 2 "), mention("producto", "p1", "Cartón"), text(", 1 "),
        mention("producto", "p2", "Media docena"), text(" a "), mention("cliente", "c1", "Aurita")),
    );
    expect(result.mensaje).toBe("Vendí 2 @Cartón, 1 @Media docena a @Aurita");
    expect(result.menciones).toHaveLength(3);
  });

  it("counts an emoji before a mention as one code point", () => {
    const result = serializeMessage(doc(text("🥚 "), mention("cliente", "c1", "Aurita")));
    expect(result.menciones?.[0]).toMatchObject({ inicio: 2, fin: 9 });
  });

  it("leaves out comando and menciones when there are none", () => {
    expect(serializeMessage(doc(text("¿cuánto hay en caja?")))).toEqual({
      mensaje: "¿cuánto hay en caja?",
    });
  });

  it("keeps line breaks", () => {
    expect(serializeMessage(doc(text("uno"), { type: "hardBreak" }, text("dos"))).mensaje).toBe("uno\ndos");
  });

  it("sends a mention without id (pasted HTML) as plain text", () => {
    const result = serializeMessage(doc(text("a "), mention("cliente", null, "Aurita")));
    expect(result).toEqual({ mensaje: "a @Aurita" });
  });

  it("returns an empty message for a template with nothing filled", () => {
    expect(serializeMessage(doc(chip("caja"), text(" "), slot("tipo_caja"), text(" de "), slot("monto")))).toMatchObject({
      mensaje: "de",
    });
  });
});
```

Nota sobre el último test: una plantilla sin completar deja solo los conectores ("de"). El botón de enviar se habilita igual, y el agente pregunta lo que falte; es el comportamiento acordado ("los huecos vacíos no se envían").

- [ ] **Step 3: Run tests to verify they fail**

Run: `yarn vitest run src/modules/agent/components/composer`
Expected: FAIL, imports sin resolver.

- [ ] **Step 4: Write minimal implementation**

```ts
// src/modules/agent/components/composer/schema.ts
import type { MentionTipo } from "../../domain/mentions";

/** Names of the custom Tiptap nodes, shared by the editor and the pure helpers. */
export const NODE = {
  mention: "mention",
  commandChip: "commandChip",
  slot: "slot",
} as const;

export type SlotTipo =
  | "cantidad"
  | "producto"
  | "cliente"
  | "venta"
  | "pagado"
  | "medio"
  | "monto"
  | "costo"
  | "tipo_caja"
  | "nota";

export const SLOT_PLACEHOLDERS: Record<SlotTipo, string> = {
  cantidad: "cantidad",
  producto: "@producto",
  cliente: "@cliente",
  venta: "@venta pendiente",
  pagado: "pagado/no pagado",
  medio: "efectivo/transferencia",
  monto: "monto",
  costo: "costo",
  tipo_caja: "entrada/salida/aporte/retiro",
  nota: "nota",
};

/** Slots answered by picking one fixed option. */
export const SLOT_CHOICES: Partial<Record<SlotTipo, string[]>> = {
  pagado: ["pagado", "no pagado"],
  medio: ["efectivo", "transferencia"],
  tipo_caja: ["entrada", "salida", "aporte", "retiro"],
};

/** Slots answered with a mention of this type. */
export const PICKER_SLOTS: Partial<Record<SlotTipo, MentionTipo>> = {
  cliente: "cliente",
  producto: "producto",
  venta: "venta",
};
```

```ts
// src/modules/agent/components/composer/templates.ts
import type { JSONContent } from "@tiptap/core";

import type { Comando } from "../../domain/mentions";
import { NODE, SLOT_PLACEHOLDERS, type SlotTipo } from "./schema";

const text = (value: string): JSONContent => ({ type: "text", text: value });
const slot = (tipo: SlotTipo): JSONContent => ({
  type: NODE.slot,
  attrs: { tipo, placeholder: SLOT_PLACEHOLDERS[tipo] },
});

const bodies: Record<Comando, JSONContent[]> = {
  venta: [text("Vendí "), slot("cantidad"), text(" "), slot("producto"), text(" a "), slot("cliente"), text(", "), slot("pagado")],
  compra: [text("Compré "), slot("cantidad"), text(" "), slot("producto"), text(" a "), slot("costo"), text(" c/u")],
  cobro: [slot("cliente"), text(" pagó "), slot("venta"), text(" en "), slot("medio")],
  caja: [slot("tipo_caja"), text(" de "), slot("monto"), text(": "), slot("nota")],
};

/** Command chip + the command's sentence with slots to fill. */
export const buildTemplate = (comando: Comando): JSONContent[] => [
  { type: NODE.commandChip, attrs: { comando } },
  text(" "),
  ...bodies[comando],
];

/** One more `[cantidad] [@producto]` pair for sales and purchases. */
export const itemRow = (): JSONContent[] => [text(", "), slot("cantidad"), text(" "), slot("producto")];
```

```ts
// src/modules/agent/components/composer/serialize.ts
import type { JSONContent } from "@tiptap/core";

import {
  codePointLength,
  COMMANDS,
  type Comando,
  type Mencion,
  type OutgoingMessage,
} from "../../domain/mentions";
import { NODE } from "./schema";

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
```

Nota: el `append` limpia espacios al inicio solo cuando lo anterior termina en espacio o salto de línea, por eso `" Vendí "` después del chip queda `"Vendí "`. Si un test de espacios falla, ajustar solo `append`, no los tests.

- [ ] **Step 5: Run tests, typecheck and lint**

Run: `yarn vitest run src/modules/agent && yarn tsc -b && yarn lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json yarn.lock src/modules/agent/components/composer
git commit -m "feat(agent): composer templates and message serialization"
```

---

### Task 6: Ayudas sobre el documento y controlador de la lista

**Files:**
- Create: `src/modules/agent/components/composer/extensions.ts` (solo los tres nodos en esta task)
- Create: `src/modules/agent/components/composer/doc-helpers.ts`, `doc-helpers.test.ts`
- Create: `src/modules/agent/components/composer/menu-controller.ts`, `menu-controller.test.ts`

**Interfaces:**
- Consumes: `NODE`, `SlotTipo` (Task 5); `Comando` (Task 1); `MentionOption` (Task 4).
- Produces:
  - `extensions.ts`: `MentionNode`, `CommandChipNode`, `SlotNode` (Tiptap `Node`s), `composerNodes` (array con Document, Paragraph, Text, HardBreak y los tres nodos).
  - `doc-helpers.ts`: `findSlotPos(doc: PMNode, from: number, direction: "next" | "prev" | "first"): number | null`; `getCommand(doc: PMNode): Comando | null`; `findCustomerMention(doc: PMNode): string | null`; `productBefore($from: ResolvedPos): { from: number } | null`.
  - `menu-controller.ts`: `type MenuItem`, `interface MenuSnapshot`, `class MenuController` con `subscribe`, `getSnapshot`, `open(title, items, choose)`, `close()`, `handleKey(key: string): boolean`, `chooseAt(index: number)`.

- [ ] **Step 1: Write the nodes** (sin test propio: se ejercitan desde `doc-helpers.test.ts` a través del schema)

```ts
// src/modules/agent/components/composer/extensions.ts
import { Node } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

import { commandLabels } from "../../domain/labels";
import type { Comando } from "../../domain/mentions";
import { NODE } from "./schema";

/** A customer, product or sale. Atomic: Backspace removes it whole. */
export const MentionNode = Node.create({
  name: NODE.mention,
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  addAttributes() {
    return {
      tipo: { default: null, parseHTML: (el) => el.getAttribute("data-mention") },
      id: { default: null, parseHTML: (el) => el.getAttribute("data-id") },
      nombre: { default: "", parseHTML: (el) => el.getAttribute("data-nombre") ?? "" },
    };
  },
  parseHTML() {
    return [{ tag: "span[data-mention]" }];
  },
  renderHTML({ node }) {
    return [
      "span",
      {
        "data-mention": node.attrs.tipo,
        "data-id": node.attrs.id,
        "data-nombre": node.attrs.nombre,
        class: "rounded bg-primary/10 px-1 font-medium text-primary",
      },
      `@${node.attrs.nombre}`,
    ];
  },
  renderText({ node }) {
    return `@${node.attrs.nombre}`;
  },
});

/** The command of the message, always its first node. */
export const CommandChipNode = Node.create({
  name: NODE.commandChip,
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  addAttributes() {
    return { comando: { default: null } };
  },
  renderHTML({ node }) {
    const label = commandLabels[node.attrs.comando as Comando]?.label ?? node.attrs.comando;
    return [
      "span",
      { "data-command": node.attrs.comando, class: "rounded bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground" },
      label,
    ];
  },
  renderText() {
    return "";
  },
});

/** An empty template slot. Filling it replaces the node. */
export const SlotNode = Node.create({
  name: NODE.slot,
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return { tipo: { default: null }, placeholder: { default: "" } };
  },
  renderHTML({ node }) {
    return [
      "span",
      {
        "data-slot-tipo": node.attrs.tipo,
        class:
          "rounded border border-dashed border-muted-foreground/50 px-1 text-muted-foreground [&.ProseMirror-selectednode]:border-primary [&.ProseMirror-selectednode]:ring-2 [&.ProseMirror-selectednode]:ring-primary/30",
      },
      node.attrs.placeholder,
    ];
  },
  renderText() {
    return "";
  },
});

/** Nodes of the composer document. Mentions, chips and slots only. */
export const composerNodes = [Document, Paragraph, Text, HardBreak, MentionNode, CommandChipNode, SlotNode];
```

- [ ] **Step 2: Write the failing tests**

```ts
// src/modules/agent/components/composer/doc-helpers.test.ts
import { describe, expect, it } from "vitest";
import { getSchema, type JSONContent } from "@tiptap/core";
import { composerNodes } from "./extensions";
import { findCustomerMention, findSlotPos, getCommand, productBefore } from "./doc-helpers";
import { buildTemplate } from "./templates";

const schema = getSchema(composerNodes);
const toDoc = (content: JSONContent[]) =>
  schema.nodeFromJSON({ type: "doc", content: [{ type: "paragraph", content }] });
const slotPositions = (doc: ReturnType<typeof toDoc>) => {
  const positions: number[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name === "slot") positions.push(pos);
  });
  return positions;
};

describe("findSlotPos", () => {
  const doc = toDoc(buildTemplate("venta"));
  const [first, second, , last] = slotPositions(doc);

  it("finds the first, next and previous slot", () => {
    expect(findSlotPos(doc, 0, "first")).toBe(first);
    expect(findSlotPos(doc, first, "next")).toBe(second);
    expect(findSlotPos(doc, second, "prev")).toBe(first);
  });

  it("returns null past the last slot (Tab leaves the editor)", () => {
    expect(findSlotPos(doc, last, "next")).toBeNull();
    expect(findSlotPos(doc, first, "prev")).toBeNull();
  });
});

describe("getCommand / findCustomerMention", () => {
  it("reads the command chip and the first customer", () => {
    const doc = toDoc([
      ...buildTemplate("cobro").slice(0, 2),
      { type: "mention", attrs: { tipo: "cliente", id: "c1", nombre: "Aurita" } },
    ]);
    expect(getCommand(doc)).toBe("cobro");
    expect(findCustomerMention(doc)).toBe("c1");
  });

  it("returns null without them", () => {
    const doc = toDoc([{ type: "text", text: "hola" }]);
    expect(getCommand(doc)).toBeNull();
    expect(findCustomerMention(doc)).toBeNull();
  });
});

describe("productBefore", () => {
  const product = { type: "mention", attrs: { tipo: "producto", id: "p1", nombre: "Cartón" } };

  it("detects a product right before the cursor", () => {
    const doc = toDoc([{ type: "text", text: "2 " }, product]);
    expect(productBefore(doc.resolve(doc.content.size - 1))).toEqual({ from: doc.content.size - 1 });
  });

  it("skips the space inserted after the mention", () => {
    const doc = toDoc([{ type: "text", text: "2 " }, product, { type: "text", text: "  a " }]);
    // Cursor right after the first space following the mention.
    const mentionEnd = 1 + 2 + 1;
    expect(productBefore(doc.resolve(mentionEnd + 1))).toEqual({ from: mentionEnd });
  });

  it("ignores customers and plain text", () => {
    const doc = toDoc([{ type: "mention", attrs: { tipo: "cliente", id: "c1", nombre: "A" } }, { type: "text", text: "x" }]);
    expect(productBefore(doc.resolve(doc.content.size - 1))).toBeNull();
  });
});
```

```ts
// src/modules/agent/components/composer/menu-controller.test.ts
import { describe, expect, it, vi } from "vitest";
import { MenuController, type MenuItem } from "./menu-controller";

const choice = (value: string): MenuItem => ({ kind: "choice", value });
const notice: MenuItem = { kind: "notice", text: "Sin resultados" };

describe("MenuController", () => {
  it("opens on the first selectable item and moves with the arrows, wrapping", () => {
    const menu = new MenuController();
    menu.open("Opciones", [notice, choice("a"), choice("b")], vi.fn());
    expect(menu.getSnapshot()?.selected).toBe(1);
    menu.handleKey("ArrowDown");
    expect(menu.getSnapshot()?.selected).toBe(2);
    menu.handleKey("ArrowDown");
    expect(menu.getSnapshot()?.selected).toBe(1);
    menu.handleKey("ArrowUp");
    expect(menu.getSnapshot()?.selected).toBe(2);
  });

  it("chooses the selected item with Enter or Tab", () => {
    const choose = vi.fn();
    const menu = new MenuController();
    menu.open("Opciones", [choice("a"), choice("b")], choose);
    menu.handleKey("ArrowDown");
    expect(menu.handleKey("Enter")).toBe(true);
    expect(choose).toHaveBeenCalledWith(choice("b"));
  });

  it("swallows Enter when only notices are shown, so the message is not sent", () => {
    const choose = vi.fn();
    const menu = new MenuController();
    menu.open("Clientes", [notice], choose);
    expect(menu.handleKey("Enter")).toBe(true);
    expect(choose).not.toHaveBeenCalled();
  });

  it("closes with Escape and then lets keys through", () => {
    const menu = new MenuController();
    menu.open("Opciones", [choice("a")], vi.fn());
    expect(menu.handleKey("Escape")).toBe(true);
    expect(menu.getSnapshot()).toBeNull();
    expect(menu.handleKey("Enter")).toBe(false);
  });

  it("notifies subscribers", () => {
    const menu = new MenuController();
    const listener = vi.fn();
    menu.subscribe(listener);
    menu.open("x", [choice("a")], vi.fn());
    menu.close();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `yarn vitest run src/modules/agent/components/composer`
Expected: FAIL, `doc-helpers` y `menu-controller` sin resolver.

- [ ] **Step 4: Write minimal implementation**

```ts
// src/modules/agent/components/composer/doc-helpers.ts
import type { Node as PMNode, ResolvedPos } from "@tiptap/pm/model";

import { COMMANDS, type Comando } from "../../domain/mentions";
import { NODE } from "./schema";

/** Position of the slot to jump to with Tab / Shift+Tab, or `null`. */
export const findSlotPos = (
  doc: PMNode,
  from: number,
  direction: "next" | "prev" | "first",
): number | null => {
  const positions: number[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name === NODE.slot) positions.push(pos);
  });
  if (direction === "first") return positions[0] ?? null;
  if (direction === "next") return positions.find((pos) => pos > from) ?? null;
  return positions.filter((pos) => pos < from).at(-1) ?? null;
};

export const getCommand = (doc: PMNode): Comando | null => {
  const first = doc.firstChild?.firstChild;
  const comando = first?.type.name === NODE.commandChip ? first.attrs.comando : null;
  return (COMMANDS as readonly unknown[]).includes(comando) ? (comando as Comando) : null;
};

/** Id of the first customer mentioned: `/cobro` lists that customer's sales. */
export const findCustomerMention = (doc: PMNode): string | null => {
  let id: string | null = null;
  doc.descendants((node) => {
    if (id) return false;
    if (node.type.name === NODE.mention && node.attrs.tipo === "cliente") id = node.attrs.id;
  });
  return id;
};

const isProduct = (node: PMNode | null | undefined) =>
  node?.type.name === NODE.mention && node.attrs.tipo === "producto";

/**
 * When the cursor sits right after a product mention (or after the spaces
 * that follow it), returns where a new item row should start.
 */
export const productBefore = ($from: ResolvedPos): { from: number } | null => {
  const before = $from.nodeBefore;
  if (isProduct(before)) return { from: $from.pos };
  if (before?.isText && before.text?.trim() === "") {
    // Index of the text node that holds `before`.
    const index = $from.textOffset > 0 ? $from.index() : $from.index() - 1;
    if (isProduct($from.parent.maybeChild(index - 1))) {
      return { from: $from.pos - before.nodeSize };
    }
  }
  return null;
};
```

```ts
// src/modules/agent/components/composer/menu-controller.ts
import type { MentionOption } from "../../actions/search-mentions";
import type { Comando } from "../../domain/mentions";

export type MenuItem =
  | { kind: "command"; comando: Comando }
  | { kind: "mention"; option: MentionOption }
  | { kind: "choice"; value: string }
  /** Not selectable: "Sin resultados", "No se pudo buscar", … */
  | { kind: "notice"; text: string };

export interface MenuSnapshot {
  title: string;
  items: MenuItem[];
  selected: number;
  choose: (item: MenuItem) => void;
}

const isSelectable = (item: MenuItem) => item.kind !== "notice";

/**
 * State of the suggestion list, outside React so Tiptap's key handlers
 * can drive it synchronously. React reads it with `useSyncExternalStore`.
 */
export class MenuController {
  private snapshot: MenuSnapshot | null = null;
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  private set(snapshot: MenuSnapshot | null) {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }

  open(title: string, items: MenuItem[], choose: (item: MenuItem) => void) {
    this.set({ title, items, choose, selected: items.findIndex(isSelectable) });
  }

  close() {
    if (this.snapshot) this.set(null);
  }

  chooseAt(index: number) {
    const item = this.snapshot?.items[index];
    if (!this.snapshot || !item || !isSelectable(item)) return;
    this.snapshot.choose(item);
  }

  private move(delta: number) {
    if (!this.snapshot) return;
    const { items, selected } = this.snapshot;
    for (let step = 1; step <= items.length; step++) {
      const index = (((selected + delta * step) % items.length) + items.length) % items.length;
      if (isSelectable(items[index])) {
        this.set({ ...this.snapshot, selected: index });
        return;
      }
    }
  }

  /** Returns `true` when the key was used by the list. */
  handleKey(key: string): boolean {
    if (!this.snapshot) return false;
    switch (key) {
      case "ArrowDown":
        this.move(1);
        return true;
      case "ArrowUp":
        this.move(-1);
        return true;
      case "Enter":
      case "Tab":
        this.chooseAt(this.snapshot.selected);
        return true;
      case "Escape":
        this.close();
        return true;
      default:
        return false;
    }
  }
}
```

- [ ] **Step 5: Run tests, typecheck and lint**

Run: `yarn vitest run src/modules/agent && yarn tsc -b && yarn lint`
Expected: PASS. Si `productBefore` falla en "skips the space…", revisar el cálculo de posiciones del test (`1` es el inicio del párrafo, `"2 "` ocupa 2, la mención 1) antes de tocar la función.

- [ ] **Step 6: Commit**

```bash
git add src/modules/agent/components/composer
git commit -m "feat(agent): composer nodes, document helpers and menu controller"
```

---

### Task 7: Editor en el composer (texto, envío, menús `@` y `/`)

**Files:**
- Modify: `src/modules/agent/components/composer/extensions.ts` (agregar `ComposerKeys` y `ComposerSuggestions`)
- Create: `src/modules/agent/components/composer/ComposerMenu.tsx`
- Create: `src/modules/agent/components/composer/useComposerEditor.ts`
- Modify: `src/modules/agent/components/ChatComposer.tsx`
- Modify: `src/index.css` (placeholder del editor)

**Interfaces:**
- Consumes: `MenuController`, `MenuItem` (Task 6); `searchMentions`, `MentionFilter`, `MentionOption` (Task 4); `debounceLatest` (Task 4); `buildTemplate` (Task 5); `serializeMessage` (Task 5); `findSlotPos`, `findCustomerMention` (Task 6); `commandLabels` (Task 3); `COMMANDS` (Task 1).
- Produces: `useComposerEditor({ onSubmit, menu, search }): Editor | null`; `selectSlot(editor: Editor, from: number, direction): boolean` (exportada de `extensions.ts`, la usa Task 8); `ComposerSuggestions` con `storage.slotFilter: MentionFilter | null` y `storage.slotOrigin: SlotTipo | null` (Task 8 los escribe).

- [ ] **Step 1: Add keyboard and suggestion extensions** (agregar a `extensions.ts`)

```ts
import { Extension, type Editor } from "@tiptap/core";
import { NodeSelection, PluginKey } from "@tiptap/pm/state";
import Suggestion from "@tiptap/suggestion";

import type { MentionFilter, MentionOption } from "../../actions/search-mentions";
import { COMMANDS } from "../../domain/mentions";
import { findCustomerMention, findSlotPos } from "./doc-helpers";
import type { MenuController, MenuItem } from "./menu-controller";
import { NODE, SLOT_PLACEHOLDERS, type SlotTipo } from "./schema";
import { buildTemplate } from "./templates";

/** Selects the slot to jump to; `false` when there is none. */
export const selectSlot = (
  editor: Editor,
  from: number,
  direction: "next" | "prev" | "first",
): boolean => {
  const pos = findSlotPos(editor.state.doc, from, direction);
  if (pos === null) return false;
  editor.chain().focus().setNodeSelection(pos).scrollIntoView().run();
  return true;
};

interface ComposerKeysOptions {
  onSubmit: () => void;
}

/** Enter sends, Shift+Enter breaks the line, Tab walks the slots. */
export const ComposerKeys = Extension.create<ComposerKeysOptions>({
  name: "composerKeys",
  addOptions() {
    return { onSubmit: () => {} };
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        this.options.onSubmit();
        return true;
      },
      "Shift-Enter": ({ editor }) => editor.commands.setHardBreak(),
      Tab: ({ editor }) => {
        const { selection } = editor.state;
        const from = selection instanceof NodeSelection ? selection.from : selection.from - 1;
        return selectSlot(editor, from, "next");
      },
      "Shift-Tab": ({ editor }) => selectSlot(editor, editor.state.selection.from, "prev"),
    };
  },
});

interface ComposerSuggestionsOptions {
  menu: MenuController | null;
  search: (filter: MentionFilter, query: string) => Promise<MentionOption[]>;
}

interface ComposerSuggestionsStorage {
  /** Set while a picker slot is being answered: narrows the `@` list. */
  slotFilter: MentionFilter | null;
  /** The slot the `@` replaced, to put it back if nothing is chosen. */
  slotOrigin: SlotTipo | null;
}

const MENTION_TITLES: Record<MentionFilter["kind"], string> = {
  any: "Mencionar",
  cliente: "Clientes",
  producto: "Productos",
  venta: "Ventas pendientes",
};

/**
 * `@` and `/` lists. They run before the keyboard shortcuts (higher
 * priority), so Enter picks an option while a list is open.
 */
export const ComposerSuggestions = Extension.create<ComposerSuggestionsOptions, ComposerSuggestionsStorage>({
  name: "composerSuggestions",
  priority: 200,
  addOptions() {
    return { menu: null, search: async () => [] };
  },
  addStorage() {
    return { slotFilter: null, slotOrigin: null };
  },
  addProseMirrorPlugins() {
    const { menu, search } = this.options;
    const storage = this.storage;
    const editor = this.editor;

    const render = (title: () => string) => () => ({
      onStart: (props: { items: MenuItem[]; command: (item: MenuItem) => void }) =>
        menu?.open(title(), props.items, props.command),
      onUpdate: (props: { items: MenuItem[]; command: (item: MenuItem) => void }) =>
        menu?.open(title(), props.items, props.command),
      onKeyDown: ({ event }: { event: KeyboardEvent }) => menu?.handleKey(event.key) ?? false,
      onExit: () => menu?.close(),
    });

    const currentFilter = (): MentionFilter => {
      const filter = storage.slotFilter ?? { kind: "any" };
      return filter.kind === "venta" ? { kind: "venta", customerId: findCustomerMention(editor.state.doc) } : filter;
    };

    const mentionItems = async ({ query }: { query: string }): Promise<MenuItem[]> => {
      const filter = currentFilter();
      if (filter.kind === "venta" && !filter.customerId) {
        return [{ kind: "notice", text: "Elige primero el cliente" }];
      }
      try {
        const options = await search(filter, query);
        return options.length
          ? options.map((option) => ({ kind: "mention", option }))
          : [{ kind: "notice", text: "Sin resultados" }];
      } catch {
        return [{ kind: "notice", text: "No se pudo buscar" }];
      }
    };

    return [
      Suggestion<MenuItem, MenuItem>({
        editor,
        pluginKey: new PluginKey("mentionSuggestion"),
        char: "@",
        items: mentionItems,
        command: ({ editor, range, props }) => {
          if (props.kind !== "mention") return;
          const { tipo, id, nombre } = props.option;
          const fromSlot = storage.slotOrigin !== null;
          storage.slotFilter = null;
          storage.slotOrigin = null;
          editor
            .chain()
            .focus()
            .insertContentAt(range, [{ type: NODE.mention, attrs: { tipo, id, nombre } }, { type: "text", text: " " }])
            .run();
          if (fromSlot) selectSlot(editor, range.from, "next");
        },
        render: render(() => MENTION_TITLES[currentFilter().kind]),
      }),
      Suggestion<MenuItem, MenuItem>({
        editor,
        pluginKey: new PluginKey("commandSuggestion"),
        char: "/",
        startOfLine: true,
        // Only on an otherwise empty message.
        allow: ({ state, range }) =>
          state.doc.childCount === 1 &&
          state.doc.textContent === state.doc.textBetween(range.from, range.to) &&
          findSlotPos(state.doc, 0, "first") === null,
        items: ({ query }) => {
          const matches = COMMANDS.filter((comando) => comando.startsWith(query.toLowerCase()));
          return matches.length
            ? matches.map((comando) => ({ kind: "command", comando }))
            : [{ kind: "notice", text: "Sin comandos" }];
        },
        command: ({ editor, range, props }) => {
          if (props.kind !== "command") return;
          editor.chain().focus().insertContentAt(range, buildTemplate(props.comando)).run();
          selectSlot(editor, 0, "first");
        },
        render: render(() => "Comandos"),
      }),
    ];
  },
});

export { SLOT_PLACEHOLDERS };
```

Nota: si el tipo genérico de `Suggestion<I, TSelected>` en la versión instalada no acepta estos parámetros, quitar los genéricos y tipar `props` dentro de `command`; la lógica no cambia. `allow` usa `findSlotPos(..., "first") === null` para no abrir `/` dentro de una plantilla.

- [ ] **Step 2: Add the menu component**

```tsx
// src/modules/agent/components/composer/ComposerMenu.tsx
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";
import { commandLabels } from "../../domain/labels";
import type { MentionTipo } from "../../domain/mentions";
import type { MenuController, MenuItem } from "./menu-controller";

const groupLabels: Record<MentionTipo, string> = {
  cliente: "Clientes",
  producto: "Productos",
  venta: "Ventas pendientes",
};

const itemKey = (item: MenuItem, index: number) =>
  item.kind === "mention" ? `${item.option.tipo}-${item.option.id}` : `${item.kind}-${index}`;

/** The open list, anchored above the composer (not to the caret). */
export const ComposerMenu = ({ menu }: { menu: MenuController }) => {
  const snapshot = useSyncExternalStore(menu.subscribe, menu.getSnapshot);
  if (!snapshot) return null;

  return (
    <div
      role="listbox"
      aria-label={snapshot.title}
      className="absolute right-0 bottom-full left-0 z-10 mb-2 max-h-64 overflow-y-auto rounded-md border bg-popover p-1 text-sm text-popover-foreground shadow-md"
    >
      {snapshot.items.map((item, index) => {
        const previous = snapshot.items[index - 1];
        const header =
          item.kind === "mention" && (previous?.kind !== "mention" || previous.option.tipo !== item.option.tipo)
            ? groupLabels[item.option.tipo]
            : null;
        return (
          <div key={itemKey(item, index)}>
            {header ? <p className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">{header}</p> : null}
            {item.kind === "notice" ? (
              <p className="px-2 py-1.5 text-muted-foreground">{item.text}</p>
            ) : (
              <button
                type="button"
                role="option"
                aria-selected={index === snapshot.selected}
                // Keep the editor focused: choose on mousedown.
                onMouseDown={(event) => {
                  event.preventDefault();
                  menu.chooseAt(index);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left",
                  index === snapshot.selected && "bg-accent text-accent-foreground",
                )}
              >
                {item.kind === "command" ? (
                  <>
                    <span className="font-medium">/{item.comando}</span>
                    <span className="text-xs text-muted-foreground">{commandLabels[item.comando].description}</span>
                  </>
                ) : item.kind === "mention" ? (
                  <>
                    <span className={cn(item.option.sinStock && "text-muted-foreground")}>{item.option.nombre}</span>
                    {item.option.detalle ? (
                      <span className={cn("text-xs", item.option.sinStock ? "text-destructive" : "text-muted-foreground")}>
                        {item.option.detalle}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span>{item.value}</span>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
```

- [ ] **Step 3: Add the editor hook**

```ts
// src/modules/agent/components/composer/useComposerEditor.ts
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEditor, type Editor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";

import { debounceLatest } from "@/lib/debounce";
import { searchMentions, type MentionFilter } from "../../actions/search-mentions";
import { composerNodes, ComposerKeys, ComposerSuggestions } from "./extensions";
import { MenuController } from "./menu-controller";

const EDITOR_CLASS =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 max-h-40 min-h-10 w-full overflow-y-auto rounded-md border bg-transparent px-3 py-2 text-base whitespace-pre-wrap break-words shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] aria-disabled:cursor-not-allowed aria-disabled:opacity-50 md:text-sm";

interface UseComposerEditorOptions {
  /** Called on Enter (outside a list). Read through a ref by the caller. */
  onSubmit: () => void;
  onChange: (editor: Editor) => void;
}

export const useComposerEditor = ({ onSubmit, onChange }: UseComposerEditorOptions) => {
  const queryClient = useQueryClient();
  const [menu] = useState(() => new MenuController());
  const [search] = useState(() =>
    debounceLatest((filter: MentionFilter, query: string) => searchMentions(queryClient, filter, query), 200),
  );

  const editor = useEditor({
    extensions: [
      ...composerNodes,
      Placeholder.configure({ placeholder: "Ej. vendí dos cartones a Aurita · / comandos · @ mencionar" }),
      ComposerKeys.configure({ onSubmit }),
      ComposerSuggestions.configure({ menu, search }),
    ],
    editorProps: {
      attributes: {
        class: EDITOR_CLASS,
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Mensaje para el asistente",
      },
    },
    onUpdate: ({ editor }) => onChange(editor),
  });

  return { editor, menu };
};
```

- [ ] **Step 4: Use the editor in `ChatComposer`** (reemplazo completo del archivo)

```tsx
// src/modules/agent/components/ChatComposer.tsx
import { useEffect, useRef, useState, type FormEvent } from "react";
import { EditorContent } from "@tiptap/react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { OutgoingMessage } from "../domain/mentions";
import { ComposerMenu } from "./composer/ComposerMenu";
import { serializeMessage } from "./composer/serialize";
import { useComposerEditor } from "./composer/useComposerEditor";

interface ChatComposerProps {
  onSend: (message: OutgoingMessage) => Promise<boolean>;
  /** Why the input is blocked, or `null` when the person can write. */
  disabledReason: string | null;
}

export const ChatComposer = ({ onSend, disabledReason }: ChatComposerProps) => {
  const [isSending, setIsSending] = useState(false);
  const [hasText, setHasText] = useState(false);
  const isDisabled = disabledReason !== null || isSending;
  const submitRef = useRef<() => void>(() => {});

  const { editor, menu } = useComposerEditor({
    onSubmit: () => submitRef.current(),
    onChange: (current) => setHasText(serializeMessage(current.getJSON()).mensaje !== ""),
  });

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!editor || isDisabled) return;
    const message = serializeMessage(editor.getJSON());
    if (!message.mensaje) return;

    setIsSending(true);
    // Clear only once the server accepted it, so a rejected message isn't lost.
    const accepted = await onSend(message);
    if (accepted) editor.commands.clearContent(true);
    setIsSending(false);
  };

  useEffect(() => {
    submitRef.current = () => void submit();
  });

  useEffect(() => {
    editor?.setEditable(disabledReason === null);
  }, [editor, disabledReason]);

  return (
    <form onSubmit={submit} className="space-y-2">
      {disabledReason ? <p className="text-xs text-muted-foreground">{disabledReason}</p> : null}
      <div className="relative flex items-end gap-2">
        <ComposerMenu menu={menu} />
        <EditorContent
          editor={editor}
          className="min-w-0 flex-1"
          aria-disabled={disabledReason !== null || undefined}
        />
        <Button type="submit" size="icon" disabled={isDisabled || !hasText} aria-label="Enviar mensaje">
          <SendHorizontal />
        </Button>
      </div>
    </form>
  );
};
```

Nota: `onChange` recibe el editor desde `onUpdate` en vez de leerlo del closure (en el primer render `editor` todavía es `null`).

`src/index.css`, agregar al final:

```css
/* Placeholder of the agent composer (Tiptap). */
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  color: var(--muted-foreground);
}
```

- [ ] **Step 5: Typecheck, lint and tests**

Run: `yarn tsc -b && yarn lint && yarn test`
Expected: PASS.

- [ ] **Step 6: Verify in the browser**

Run: `yarn dev`, abrir `/agent`, entrar a una conversación. Comprobar:
- Escribir texto y Enter: se envía; Shift+Enter hace salto de línea; el cuadro se vacía solo cuando el servidor acepta.
- Mientras el agente responde o hay una tarjeta abierta, no se puede escribir.
- `@aur` muestra "Clientes" y "Productos" agrupados; flechas + Enter insertan la etiqueta; Backspace la borra entera.
- Un producto sin stock aparece con "Sin stock" en rojo.
- `/` en un mensaje vacío lista los cuatro comandos; `/ve` + Enter inserta la etiqueta "Venta" y la plantilla con el primer hueco seleccionado; `/` en medio de un texto no abre nada.
- Escape cierra la lista sin enviar.

- [ ] **Step 7: Commit**

```bash
git add src/modules/agent src/index.css
git commit -m "feat(agent): rich composer with @ mentions and / commands"
```

---

### Task 8: Comportamiento de los huecos y renglones

**Files:**
- Modify: `src/modules/agent/components/composer/extensions.ts` (agregar `SlotBehavior`)
- Modify: `src/modules/agent/components/composer/useComposerEditor.ts` (registrar `SlotBehavior`)

**Interfaces:**
- Consumes: `selectSlot`, `ComposerSuggestions.storage` (Task 7); `getCommand`, `productBefore` (Task 6); `itemRow` (Task 5); `SLOT_CHOICES`, `PICKER_SLOTS`, `SLOT_PLACEHOLDERS` (Task 5); `MenuController` (Task 6).
- Produces: `SlotBehavior` extension.

- [ ] **Step 1: Add `SlotBehavior`** (agregar a `extensions.ts`)

```ts
import { Plugin } from "@tiptap/pm/state";
import { getCommand, productBefore } from "./doc-helpers";
import { PICKER_SLOTS, SLOT_CHOICES } from "./schema";
import { itemRow } from "./templates";

interface SlotBehaviorOptions {
  menu: MenuController | null;
}

/**
 * What a selected slot does: picker slots turn into a narrowed `@` list,
 * choice slots show their options, free slots are replaced by typing
 * (ProseMirror's default for a selected node). Also adds item rows.
 */
export const SlotBehavior = Extension.create<SlotBehaviorOptions>({
  name: "slotBehavior",
  addOptions() {
    return { menu: null };
  },
  onSelectionUpdate() {
    const { editor } = this;
    const { menu } = this.options;
    const { selection } = editor.state;
    const suggestions = editor.storage.composerSuggestions as {
      slotFilter: MentionFilter | null;
      slotOrigin: SlotTipo | null;
    };
    const node = selection instanceof NodeSelection ? selection.node : null;
    const tipo = node?.type.name === NODE.slot ? (node.attrs.tipo as SlotTipo) : null;

    if (!tipo) {
      // Leaving a choice slot closes its list (the `@` list closes itself).
      if (!suggestions.slotOrigin) menu?.close();
      return;
    }

    const picker = PICKER_SLOTS[tipo];
    if (picker) {
      suggestions.slotFilter = picker === "venta" ? { kind: "venta", customerId: null } : { kind: picker };
      suggestions.slotOrigin = tipo;
      // Typing "@" in place of the slot opens the narrowed list.
      editor.chain().insertContentAt({ from: selection.from, to: selection.to }, "@").run();
      return;
    }

    const choices = SLOT_CHOICES[tipo];
    if (choices) {
      const pos = selection.from;
      menu?.open(
        SLOT_PLACEHOLDERS[tipo],
        choices.map((value) => ({ kind: "choice", value })),
        (item) => {
          if (item.kind !== "choice") return;
          menu.close();
          editor.chain().focus().insertContentAt({ from: pos, to: pos + 1 }, item.value).run();
          selectSlot(editor, pos, "next");
        },
      );
    }
  },
  addProseMirrorPlugins() {
    const { menu } = this.options;
    const editor = this.editor;
    return [
      new Plugin({
        props: {
          // The choice list is not a Suggestion: route its keys here.
          handleKeyDown: (_view, event) => {
            const selection = editor.state.selection;
            const onChoiceSlot =
              selection instanceof NodeSelection &&
              selection.node.type.name === NODE.slot &&
              SLOT_CHOICES[selection.node.attrs.tipo as SlotTipo] !== undefined;
            if (!onChoiceSlot || event.key === "Tab") return false;
            const handled = menu?.handleKey(event.key) ?? false;
            if (handled) event.preventDefault();
            return handled;
          },
          // ", " right after a product in /venta or /compra adds a row.
          handleTextInput: (view, from, to, text) => {
            if (text !== ",") return false;
            const comando = getCommand(view.state.doc);
            if (comando !== "venta" && comando !== "compra") return false;
            const target = productBefore(view.state.doc.resolve(from));
            if (!target || from !== to) return false;
            editor.chain().focus().insertContentAt({ from: target.from, to }, itemRow()).run();
            selectSlot(editor, target.from, "next");
            return true;
          },
        },
      }),
    ];
  },
});
```

En `ComposerSuggestions`, completar `render` para que un `@` de hueco sin elección devuelva el hueco: reemplazar `onExit` por

```ts
      onExit: (props: { range: { from: number; to: number }; editor: Editor }) => {
        menu?.close();
        const origin = storage.slotOrigin;
        storage.slotFilter = null;
        storage.slotOrigin = null;
        // Nothing chosen and only "@" left: put the slot back.
        if (origin && props.editor.state.doc.textBetween(props.range.from, props.range.to) === "@") {
          props.editor
            .chain()
            .insertContentAt(props.range, {
              type: NODE.slot,
              attrs: { tipo: origin, placeholder: SLOT_PLACEHOLDERS[origin] },
            })
            .run();
        }
      },
```

y ajustar los tipos de `render` para pasar `props` a `onExit` (el `command` ya limpia `slotOrigin` antes de cerrar, así que tras elegir una opción `onExit` no restaura nada).

`useComposerEditor.ts`: importar `SlotBehavior` y agregar `SlotBehavior.configure({ menu })` al final de `extensions`.

- [ ] **Step 2: Typecheck, lint and tests**

Run: `yarn tsc -b && yarn lint && yarn test`
Expected: PASS.

- [ ] **Step 3: Verify in the browser** (`yarn dev`, `/agent`)

Escritorio, solo con teclado:
- `/venta` → Tab al hueco cantidad, escribir `2` → Tab al hueco producto: aparece `@` con la lista solo de productos → "car" + Enter → queda la etiqueta y se selecciona el hueco cliente → "aur" + Enter → hueco pagado: lista "pagado / no pagado" → flecha + Enter. Enter envía. La burbuja muestra "VENTA" y dos enlaces.
- En `/venta`, después del producto escribir `,`: aparece `, [cantidad] [@producto]` y se selecciona la cantidad nueva.
- Seleccionar el hueco producto y presionar Escape: vuelve el hueco, no queda un `@` suelto.
- `/cobro` sin cliente: el hueco venta muestra "Elige primero el cliente". Con cliente: lista sus ventas pendientes como "Venta DD/MM · Q…".
- `/caja`: tipo (opciones), monto (escribir), nota (escribir); un mensaje con la nota vacía no termina en ":".
- Tab en el último hueco saca el foco del editor.

Celular (DevTools, 375 px):
- Tocar un hueco lo selecciona y abre su lista; elegir avanza solo al siguiente.
- La lista aparece encima del cuadro, sin scroll horizontal.

- [ ] **Step 4: Commit**

```bash
git add src/modules/agent/components/composer
git commit -m "feat(agent): template slots, item rows and slot pickers"
```

---

### Task 9: Documentación y verificación final

**Files:**
- Modify: `docs/agente-panel.md`

- [ ] **Step 1: Document the composer** (agregar una sección después de "Reglas del contrato y dónde se cumplen")

```markdown
## Composer: menciones y comandos

El composer es un editor Tiptap (`components/composer/`). Spec:
`docs/superpowers/specs/2026-10-02-composer-enriquecido-design.md`.

| Pieza | Dónde |
| --- | --- |
| `@` cliente / producto / venta pendiente | `ComposerSuggestions` + `actions/search-mentions.ts` |
| `/venta`, `/compra`, `/cobro`, `/caja` y sus plantillas | `composer/templates.ts` |
| Huecos (Tab, listas, renglones) | `SlotBehavior` + `composer/doc-helpers.ts` |
| Documento → `{ mensaje, comando, menciones }` | `composer/serialize.ts` (rangos en code points) |
| Etiquetas en el historial | `UserMessageContent` + `splitMentions` |

Los campos `comando` y `menciones` solo se envían cuando hay; un mensaje
sin ellos es idéntico al de antes. El backend debe aceptarlos antes de
desplegar este panel.
```

- [ ] **Step 2: Full verification**

Run: `yarn tsc -b && yarn lint && yarn test && yarn build`
Expected: todo PASS.

Run: `grep -l "tiptap\|ProseMirror" dist/assets/*.js`
Expected: los archivos listados son chunks del módulo del agente, no `index-*.js` (Tiptap no entra al bundle inicial).

- [ ] **Step 3: End-to-end against the backend** (requiere el PR del backend desplegado en el entorno de desarrollo)

- Enviar una `/venta` completa y confirmar que el agente NO usa "Buscó el cliente" (el backend le pasa los ids en un bloque de referencias) y que llega la tarjeta "Confirmar venta" con el cliente y producto mencionados.
- Recargar la página: el mensaje enviado conserva la etiqueta del comando y los enlaces.
- Enviar un mensaje con un emoji antes de una mención: no hay 422.

- [ ] **Step 4: Commit**

```bash
git add docs/agente-panel.md
git commit -m "docs(agent): document the rich composer"
```
