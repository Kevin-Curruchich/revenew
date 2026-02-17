# Estructura del Proyecto Revenew

## 📁 Organización por Módulos

El proyecto está organizado por módulos funcionales bajo `src/modules/`:

```
src/
├── modules/
│   ├── auth/              # Autenticación
│   │   ├── pages/
│   │   │   └── LoginPage.tsx
│   │   └── index.ts
│   │
│   ├── dashboard/         # Panel principal
│   │   ├── pages/
│   │   │   └── DashboardPage.tsx
│   │   └── index.ts
│   │
│   ├── customers/         # Gestión de clientes
│   │   ├── pages/
│   │   │   ├── CustomerListPage.tsx
│   │   │   └── CustomerFormPage.tsx
│   │   └── index.ts
│   │
│   ├── sales/            # Gestión de ventas
│   │   ├── pages/
│   │   │   ├── SalesListPage.tsx
│   │   │   └── SaleFormPage.tsx
│   │   └── index.ts
│   │
│   ├── follow-up/        # Seguimiento de clientes
│   │   ├── pages/
│   │   │   └── FollowUpListPage.tsx
│   │   └── index.ts
│   │
│   └── calendar/         # Vista de calendario
│       ├── pages/
│       │   └── CalendarPage.tsx
│       └── index.ts
│
├── components/
│   ├── ui/               # Componentes de shadcn/ui
│   └── layout/
│       └── AppLayout.tsx # Layout principal con navegación
│
└── router/
    └── app.router.tsx    # Configuración de rutas
```

## 🎯 Páginas Creadas

### 1. **Auth Module** (`/login`)

- **LoginPage**: Página de inicio de sesión con formulario simple

### 2. **Dashboard Module** (`/dashboard`)

- **DashboardPage**: Panel principal con métricas clave:
  - Total de clientes
  - Ventas del mes
  - Seguimiento pendiente
  - Compras próximas (7 días)
  - Últimas ventas
  - Clientes prioritarios

### 3. **Customers Module**

- **CustomerListPage** (`/customers`): Lista de clientes con:
  - Tabla con información completa
  - Búsqueda de clientes
  - Estados (Activo/Inactivo)
  - Botón para crear nuevo cliente
- **CustomerFormPage** (`/customers/new`, `/customers/:id`): Formulario para:
  - Crear nuevo cliente
  - Editar cliente existente
  - Campos: nombre, empresa, email, teléfono, dirección, notas

### 4. **Sales Module**

- **SalesListPage** (`/sales`): Lista de ventas con:
  - Tabla con todas las ventas
  - Filtros por fecha y cliente
  - Vista de items por venta
  - Fecha de próxima compra estimada
- **SaleFormPage** (`/sales/new`, `/sales/:id`): Formulario para:
  - Registrar nueva venta
  - Editar venta existente
  - Múltiples items por venta (SKU, cantidad, precio, subtotal)
  - Selección de cliente
  - Cálculo automático de total
  - Campo de próxima compra estimada (calculado en backend)

### 5. **Follow-up Module** (`/follow-up`)

- **FollowUpListPage**: Lista de seguimiento con:
  - Métricas: Atrasados, 7 días, 14 días, 30 días
  - Filtros por período
  - Estados: Atrasado, Urgente, Próximo, Normal
  - Ordenado por fecha de próxima compra
  - Acciones rápidas: Ver cliente, Registrar venta

### 6. **Calendar Module** (`/calendar`)

- **CalendarPage**: Vista de calendario con:
  - Calendario visual interactivo
  - Eventos de próximas compras estimadas
  - Panel de eventos del día seleccionado
  - Lista de próximos eventos
  - Leyenda de colores

## 🎨 Componentes UI (shadcn)

Componentes instalados y utilizados:

- `Button` - Botones de acción
- `Card` - Contenedores de contenido
- `Input` - Campos de texto
- `Label` - Etiquetas de formularios
- `Table` - Tablas de datos
- `Badge` - Indicadores de estado
- `Calendar` - Selector de fechas
- `Select` - Listas desplegables
- `Dialog` - Modales (preparado para uso futuro)
- `Form` - Formularios (preparado para uso futuro)

## 🛣️ Rutas Configuradas

```typescript
/ → Redirige a /dashboard
/login → LoginPage (sin layout)

// Rutas con AppLayout (navegación lateral)
/dashboard → DashboardPage
/customers → CustomerListPage
/customers/new → CustomerFormPage (crear)
/customers/:id → CustomerFormPage (editar)
/sales → SalesListPage
/sales/new → SaleFormPage (crear)
/sales/:id → SaleFormPage (editar)
/follow-up → FollowUpListPage
/calendar → CalendarPage
```

## 🧩 AppLayout

Componente de layout que envuelve todas las páginas autenticadas:

- **Header**: Logo, nombre de usuario, botón de cerrar sesión
- **Sidebar**: Navegación lateral con iconos
- **Main**: Contenido principal de cada página

Navegación disponible:

- 📊 Dashboard
- 👥 Clientes
- 💰 Ventas
- 📋 Seguimiento
- 📅 Calendario

## 📊 Mock Data

Todas las páginas contienen datos de prueba (mock data) para visualización:

- Clientes de ejemplo
- Ventas de ejemplo
- Eventos de calendario
- Métricas del dashboard

## 🚀 Próximos Pasos

Para agregar funcionalidad real:

1. Implementar servicios/API para comunicación con backend
2. Agregar gestión de estado (Context API, Zustand, Redux, etc.)
3. Implementar validación de formularios (React Hook Form + Zod)
4. Agregar autenticación real
5. Conectar con backend para cálculo de próxima compra estimada
6. Implementar filtros y búsquedas funcionales
7. Agregar paginación en listas
8. Implementar notificaciones/toasts

## 🏗️ Cómo Extender

### Agregar un nuevo módulo:

1. Crear carpeta en `src/modules/nuevo-modulo/`
2. Crear subcarpeta `pages/`
3. Crear componentes de página
4. Crear `index.ts` para exports
5. Agregar ruta en `app.router.tsx`
6. Agregar item en navegación de `AppLayout.tsx`

### Agregar una nueva página a un módulo existente:

1. Crear componente en `src/modules/[modulo]/pages/`
2. Exportar en `index.ts` del módulo
3. Agregar ruta en `app.router.tsx`
