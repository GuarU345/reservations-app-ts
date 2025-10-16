# Reservations App (Frontend)

Aplicación React + TypeScript que consume la API de reservaciones. Incluye configuración base con React Router, React Query, contextos de autenticación y componentes de la librería shadcn/ui.

## Configuración inicial

1. Copia el archivo de variables de entorno y ajusta la URL de la API según tu entorno local o remoto.

```bash
cp .env.example .env
```

2. Instala las dependencias con pnpm (recomendado por el proyecto).

```bash
pnpm install
```

3. Ejecuta el entorno de desarrollo.

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173/` por defecto.

## Scripts disponibles

- `pnpm dev`: servidor de desarrollo con Vite.
- `pnpm build`: compila la aplicación.
- `pnpm preview`: vista previa de la build resultante.
- `pnpm lint`: ejecuta ESLint.

## Estructura relevante

- `src/providers/`: proveedores globales (tema, React Query, autenticación).
- `src/context/`: contexto y proveedor de autenticación.
- `src/lib/`: utilidades compartidas (cliente HTTP, query client, almacenamiento).
- `src/routes/`: configuración de rutas protegidas y públicas.
- `src/layouts/`: layouts base para la app y la zona de autenticación.
- `src/pages/`: páginas que se irán completando en siguientes iteraciones.

## Próximos pasos

- Implementar formularios de autenticación con react-hook-form + Zod.
- Conectar las vistas de negocios y reservaciones con la API REST.
- Añadir pruebas y casos de uso detallados para ambos roles (`CUSTOMER` y `BUSINESS_OWNER`).
