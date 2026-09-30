# Panel del agente de ventas

Chat en `/agent` para conversar con el agente del backend
(`ai-sales-assistant`, `/api/v1/agent`). La autoridad sobre el contrato es
`docs/agente.md` en ese repo; este archivo explica cómo lo implementa el panel.

## Dónde está cada cosa

```
src/modules/agent/
├── domain/
│   ├── agent.ts          # Tipos del contrato (hilos, eventos SSE, confirmaciones)
│   ├── sse-parser.ts     # Parser incremental de text/event-stream (+ tests)
│   ├── decisions.ts      # aprobar / cancelar / corregir (+ tests)
│   ├── conversation.ts   # Reducer del chat (+ tests)
│   └── labels.ts         # Textos de herramientas, tipos de caja, etc.
├── actions/
│   ├── threads.ts        # CRUD de hilos y GET /state (axios)
│   └── stream-agent.ts   # POST /stream con fetch + lector del body
├── hooks/
│   ├── useAgentThreads.ts       # React Query: hilos y estado
│   └── useAgentConversation.ts  # Orquesta turnos, errores HTTP y resync
├── components/
│   ├── confirmation/     # Tarjeta única + cuerpos de venta, compra y caja
│   └── ...               # Mensajes, compositor, lista de hilos
└── pages/                # /agent y /agent/:threadId
```

## Reglas del contrato y dónde se cumplen

| Regla | Implementación |
| --- | --- |
| La huella se devuelve tal cual, nunca recalculada | `buildApproveDecision` reenvía el mismo valor recibido; test que verifica la misma referencia y el mismo JSON |
| No toda confirmación trae huella | `confirmar_movimiento_caja` se aprueba con `{"accion": "aprobar"}` |
| `interrupt_id` es hermano de `decision` | `AgentStreamRequest` en `stream-agent.ts` |
| Sin `EventSource` | `fetch` + `getReader()` + `createSseParser` |
| Una corrida por hilo | Input deshabilitado mientras hay un turno en vuelo; un 409 "corrida en curso" nunca se reintenta |
| Con una tarjeta abierta solo se acepta responderla | Input deshabilitado con aviso; "Cancelar" es la salida (decisión de producto) |
| Refresh o stream cortado | Se recarga `GET /state` (única fuente de la huella) |
| Dos confirmaciones | Se responden de a una; al responder se descartan las copias locales y se usan las que re-anuncia el stream |
| Salir de la conversación | `AbortController` cancela el turno (el backend deja de gastar modelo) |

### Códigos HTTP

- **401**: se fuerza la renovación del token de Firebase y se reintenta una
  vez; si vuelve a fallar, se cierra la sesión.
- **404**: vuelve a la lista de conversaciones.
- **409**: "corrida en curso" → aviso, sin reintento. Cualquier otro 409
  (confirmación abierta o ya respondida) → se recarga `/state`.
- **422**: bug del panel; se loguea y se muestra un error genérico.
- **503**: "el asistente no está disponible", sin reintentos.

## Decisiones de producto tomadas

- Con una tarjeta abierta el input queda bloqueado; para cambiar de tema hay
  que cancelarla.
- Las confirmaciones no expiran (el servidor recalcula al aprobar).
- La tarjeta de venta muestra resumen, ganancia y advertencias; los lotes FIFO
  van en una sección plegable.
- "Corregir" permite editar cantidad y precio (venta), cantidad y costo
  (compra), y monto, fecha, medio de pago y nota (caja).

## Hallazgos sobre el contrato del backend

1. **El ejemplo de `corregir` de la documentación no coincide con el código.**
   `docs/agente.md` muestra `{"valores": {"cantidad": "3", "precio_unitario": "45.00"}}`,
   pero `valores` se mezcla sobre los **argumentos de la herramienta**
   (`_build_sale_create(**valores)` en `app/agent/tools/write.py`). Para una
   venta o una compra, `cantidad` no es un argumento: el panel tiene que mandar
   la lista completa de `items` (`producto_id`, `cantidad`,
   `precio_unitario`/`costo_unitario`). Con el ejemplo literal, la herramienta
   recibiría un argumento inesperado. El panel usa la forma del código.
2. **El 409 tiene tres significados, no dos**: también "Hay una confirmación
   abierta en este hilo", cuando llega un `mensaje` con una pausa pendiente.
3. **El preview de venta no trae el medio de pago ni si el pago queda
   pendiente**, así que la tarjeta no puede mostrarlos aunque se aprueben.
4. Que el evento `herramienta` no se repita al reanudar está documentado como
   lectura del código, sin test. El panel no depende de ese comportamiento.
