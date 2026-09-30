# Estructura del Proyecto Revenew

## 📁 Organización

El código está organizado por **módulos de negocio** (feature folders). Cada
módulo es dueño de sus tipos, llamadas a la API, hooks de datos y UI.

```
src/
├── api/revenewApi.ts        # Cliente axios: token de Firebase + manejo de 401
├── components/
│   ├── ui/                  # Primitivos de shadcn/ui (no se editan a mano)
│   ├── shared/              # Componentes reutilizables propios de la app
│   │   ├── PageHeader, FormField, FormErrorAlert, StatusBadge
│   │   ├── QueryStates (Loading/Error/Empty), Pagination, SearchInput
│   │   └── ConfirmDialog
│   └── layout/AppLayout.tsx # Header + navegación (desktop y móvil)
├── hooks/
│   └── useListSearchParams  # Filtros y paginación sincronizados con la URL
├── lib/
│   ├── query-client.ts      # QueryClient con defaults (retry, staleTime)
│   ├── errors.ts            # getErrorMessage(): errores de API → texto para el usuario
│   ├── dates.ts             # Fechas YYYY-MM-DD en zona horaria local
│   ├── formatters.ts        # Moneda (GTQ), fechas largas, plurales
│   ├── api-types.ts         # PaginatedResponse / PaginationParams
│   └── firebase.ts, theme.ts, utils.ts
├── modules/
│   ├── auth/ dashboard/ products/ purchases/
│   ├── customers/ sales/ follow-up/ calendar/
│   ├── agent/               # Chat con el agente de ventas (ver docs/agente-panel.md)
│   └── <módulo>/
│       ├── actions/         # Una función por endpoint (sin React)
│       ├── domain/          # Tipos del dominio + helpers puros (labels, reglas)
│       ├── hooks/           # useQuery / useMutation + query-keys.ts
│       ├── components/      # Piezas de UI del módulo (formularios, tarjetas)
│       ├── pages/           # Pantallas (solo orquestan hooks y componentes)
│       └── index.ts         # API pública del módulo (páginas)
└── router/                  # Rutas con lazy loading, 404 y error boundary
```

## 🧭 Convenciones

### Datos del servidor (TanStack Query)

- Cada módulo define una **fábrica de query keys** (`productKeys`, `saleKeys`, ...).
  Todas las keys de un módulo cuelgan de una raíz (`["products"]`), así una
  sola invalidación refresca listas, detalle y sub-recursos.
- Un hook por query y **un hook por mutación** (`useCreateSale`,
  `useUpdateSale`, ...). Las mutaciones invalidan lo que afectan: una venta
  refresca ventas, productos (stock), clientes, dashboard, seguimiento y calendario.
- Al cerrar sesión se limpia la caché (`queryClient.clear()`).

### Estado de cliente

- **Zustand** solo para la sesión (`auth.store.ts`). Leer siempre con
  selectores: `useAuthStore((s) => s.user)`.
- Filtros y paginación de las listas viven en la **URL**
  (`useListSearchParams`), no en `useState`.

### Formularios (react-hook-form + zod)

- El esquema zod y los mapeos `toFormValues` / `toPayload` viven junto al
  formulario (`components/*-form-schema.ts`).
- Patrón **"cargar y luego montar"**: la página espera los datos y monta el
  formulario con `key={entidad.id}` y `defaultValues`. No se usa `reset()`
  dentro de `useEffect`.
- Las filas de arrays (`useFieldArray`) usan `useFormContext` en lugar de
  recibir `control`, `register`, `errors`... por props.
- Los errores de la API se muestran con `setError("root", ...)` +
  `<FormErrorAlert />`.

### UI

- Navegación con `<Button asChild><Link /></Button>` (nunca `<Link><Button/></Link>`,
  que genera HTML inválido `<a><button>`).
- Colores semánticos (`text-muted-foreground`, `text-destructive`...) para que
  el modo oscuro funcione; evitar `text-gray-*`.
- Acciones destructivas o irreversibles pasan por `<ConfirmDialog />`.
- Montos siempre con `formatCurrency` (GTQ).

### Tests

- `yarn test` corre Vitest. Se testea la lógica pura (parsers, reducers,
  construcción de payloads) junto al archivo: `archivo.test.ts`.

## 🗺️ Rutas

| Ruta                                      | Página                              |
| ----------------------------------------- | ----------------------------------- |
| `/login`                                  | Inicio de sesión                    |
| `/dashboard`                              | Métricas y clientes prioritarios    |
| `/products`, `/products/new`, `/products/:id`    | Inventario                   |
| `/purchases`, `/purchases/new`, `/purchases/:id` | Compras (borrador → confirmada) |
| `/customers`, `/customers/new`, `/customers/:id` | Clientes                     |
| `/sales`, `/sales/new`, `/sales/:id`      | Ventas (`/sales/new?customerId=`)   |
| `/follow-up`                              | Seguimiento (`?filter=`)            |
| `/calendar`                               | Calendario (`?date=YYYY-MM-DD`)     |
| `/agent`, `/agent/:threadId`              | Asistente de ventas (chat)          |
