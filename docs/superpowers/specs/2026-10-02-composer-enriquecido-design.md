# Composer enriquecido del agente: menciones y comandos

Fecha: 2026-10-02 · Estado: aprobado · Plan: `docs/superpowers/plans/2026-10-02-composer-enriquecido.md`

## Objetivo

Hoy el chat del agente (`/agent`) es un `Textarea` de texto plano. El agente
tiene que buscar a los clientes por nombre y no puede buscar productos, así que
termina pidiendo UUIDs a la persona. El composer enriquecido permite:

- **Mencionar** clientes, productos y ventas pendientes con `@`, para que el
  agente reciba el id correcto sin buscarlo.
- **Comandos** con `/` (`/venta`, `/compra`, `/cobro`, `/caja`) que marcan la
  intención y escriben una plantilla con huecos para completar rápido.

Éxito: una venta como "2 cartones a Aurita, no pagado" se arma en el composer
con teclado y llega al agente con `comando` e ids, sin llamadas a
`buscar_cliente` ni preguntas por el UUID del producto.

## Fuera de alcance

- Tool `buscar_producto`: ya existe en el backend (ai-sales-assistant PR #9), así que el agente resuelve productos escritos sin `@`.
- Datos extra del cliente en la lista (saldo pendiente): la v1 muestra solo el
  nombre.
- Endpoints nuevos de listado: alcanza con los existentes (ver "Búsquedas").

## 1. Contrato con el backend (ai-sales-assistant)

### Request: `POST /api/v1/agent/stream`

Campos nuevos, **hermanos** de `mensaje` (que sigue siendo un string). Un
request sin ellos se comporta igual que hoy.

```json
{
  "thread_id": "…",
  "mensaje": "Vendí 2 @Cartón de huevos a @Aurita, no pagado",
  "comando": "venta",
  "menciones": [
    { "tipo": "producto", "id": "115e…", "nombre": "Cartón de huevos", "inicio": 8, "fin": 25 },
    { "tipo": "cliente", "id": "9ab…", "nombre": "Aurita", "inicio": 28, "fin": 35 }
  ]
}
```

- `mensaje`: el texto legible; cada mención aparece como `@<nombre>`.
- `comando` (opcional): `venta` | `compra` | `cobro` | `caja`.
- `menciones` (opcional): `tipo` es `cliente` | `producto` | `venta`. Para una
  venta, `nombre` es un resumen legible, por ejemplo "Venta 24/09 · Q33.33".
- `inicio`/`fin`: rango `[inicio, fin)` de la mención dentro de `mensaje`,
  **contado en code points de Unicode** (lo que cuenta Python con `len`), no en
  unidades UTF-16. Incluye la `@`.

### Qué hace el backend

- Valida la forma: 422 si `comando` o `tipo` no son válidos, o si un rango se
  sale del texto o se superpone con otro. No valida que los ids existan; un id
  inexistente termina en `no_encontrada` en la tool, como hoy.
- Le pasa al modelo las referencias junto al texto (p. ej. "cliente Aurita =
  9ab…"). El formato exacto es decisión del backend; el requisito es que el
  agente use esos ids sin llamar a `buscar_cliente`.
- Usa `comando` como pista de intención en el prompt ("quiere registrar una
  venta"), sin restringir las tools disponibles.

### `GET /threads/{id}/state`

El mensaje de usuario guarda y devuelve los campos nuevos:

```ts
{ rol: "usuario"; texto: string; comando?: Comando; menciones?: Mencion[] }
```

### Orden de despliegue

El backend (ai-sales-assistant PR #13) se despliega **antes** que el panel. El
backend viejo ignora los campos desconocidos (`extra="ignore"`): si el panel
llegara primero, los mensajes funcionan pero el agente no recibe los ids.

El backend además responde 422 a un rango vacío, a un `id` que no es UUID y a
`comando`/`menciones` sin `mensaje`; el panel nunca los produce. Devuelve los
`id` normalizados a UUID en minúsculas.

## 2. Editor

### Tecnología

Tiptap (ProseMirror) con las extensiones `Mention` y `Suggestion`, cargado con
lazy load solo en `/agent`. Se descartaron Lexical (habría que construir
menciones y sugerencias) y un `textarea` a mano (no puede mostrar etiquetas ni
huecos; posiciones frágiles, sobre todo en celular).

### Componentes

- `RichComposer`: reemplaza al `Textarea` dentro de `ChatComposer`. Conserva el
  comportamiento actual: deshabilitado con `disabledReason`, y el contenido se
  borra solo si el servidor aceptó el mensaje. `onSend` recibe
  `{ mensaje, comando, menciones }`.
- Nodos de Tiptap:
  - `mention`: inline, atómico. Atributos `tipo`, `id`, `nombre`. Backspace lo
    borra entero.
  - `commandChip`: atómico, solo como primer nodo del mensaje. Atributo
    `comando`.
  - `slot`: hueco de plantilla, inline. Atributos `tipo` (`cantidad`,
    `producto`, `cliente`, `venta`, `pagado`, `medio`, `monto`, `costo`,
    `tipo_caja`, `nota`) y `placeholder`.
- `serializeMessage(doc)`: función pura que recorre el documento y devuelve
  `{ mensaje, comando, menciones }` con rangos en code points. Los huecos vacíos
  no aportan texto.

### Comandos y plantillas

`/` al inicio de un mensaje vacío lista los cuatro comandos. Al elegir uno se
inserta su `commandChip` y su plantilla; el cursor va al primer hueco.

| Comando | Plantilla |
|---|---|
| `/venta` | Vendí `[cantidad]` `[@producto]` a `[@cliente]`, `[pagado/no pagado]` |
| `/compra` | Compré `[cantidad]` `[@producto]` a `[costo]` c/u |
| `/cobro` | `[@cliente]` pagó `[@venta pendiente]` en `[efectivo/transferencia]` |
| `/caja` | `[entrada/salida/aporte/retiro]` de `[monto]`: `[nota]` |

La plantilla es una ayuda: se puede borrar o escribir encima. Lo estructurado
(`comando`, `menciones`) se envía igual.

### Comportamiento

- `@` en cualquier parte busca clientes y productos, en dos grupos.
- Huecos:
  - Tab / Shift+Tab van al siguiente / anterior. En celular se tocan, y al
    completar uno se avanza solo al siguiente.
  - `producto`, `cliente`, `venta`: abren la lista ya filtrada a ese tipo.
  - `pagado`, `medio`, `tipo_caja`: muestran sus opciones fijas.
  - `cantidad`, `costo`, `monto`, `nota`: se reemplazan escribiendo.
- Renglones: en `/venta` y `/compra`, escribir ", " justo después de una
  mención de producto inserta otro par `[cantidad]` `[@producto]`.
- `/cobro`: el hueco `venta` lista las ventas pendientes del cliente elegido en
  el hueco `cliente` (fecha y total). Sin cliente, muestra "Elige primero el
  cliente".
- Teclas: Enter envía, salvo con la lista abierta (elige la opción marcada).
  Shift+Enter hace un salto de línea. Escape cierra la lista.

### Búsquedas

Debounce de 200 ms, hasta 8 resultados, con React Query y los endpoints
existentes:

- Clientes: `GET /customers?search=…&limit=8`. Muestra el nombre.
- Productos: `GET /products/for-sale?search=…&limit=8`. Muestra stock y precio
  sugerido (`first_available_lot.suggested_unit_price`). Los que no tienen
  stock se marcan "sin stock" pero se pueden elegir.
- Ventas pendientes: `GET /sales?customer_id=…&is_payment_pending=true&limit=8`.

## 3. Historial

- `StoredMessage` (usuario) y el `ChatItem` de usuario agregan `comando?` y
  `menciones?`. El mensaje enviado se muestra de inmediato con sus etiquetas
  (acción `turn-open` del reducer).
- La burbuja de usuario muestra la etiqueta del comando ("Venta") y parte el
  texto con `splitMentions(texto, menciones)`. Cada mención es una etiqueta con
  enlace a `/customers/:id`, `/products/:id` o `/sales/:id`.
- `splitMentions` es pura: si algún rango está fuera del texto o se superpone,
  devuelve el texto plano entero.
- Los mensajes sin menciones se ven como hoy.

## 4. Errores

- 422 por los campos nuevos: bug del panel. Se registra y se muestra el error
  genérico (comportamiento actual de `useAgentConversation`).
- Búsqueda fallida: la lista muestra "No se pudo buscar"; el editor sigue
  usable y se puede enviar texto libre.
- Entidad borrada después de mencionarla: el enlace lleva al 404 normal y el
  agente responde `no_encontrada`.

## 5. Pruebas

- Unitarias:
  - `serializeMessage`: rangos, huecos vacíos omitidos, varios renglones,
    emoji antes de una mención (code points), mensaje sin comando.
  - `splitMentions`: caso normal, rango fuera del texto, rangos superpuestos,
    emoji.
  - Reducer de conversación con `comando` y `menciones`.
- Manual en el navegador: los cuatro comandos completos con teclado en
  escritorio, y con toques en tamaño celular.
