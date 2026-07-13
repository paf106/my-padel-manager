# My Padel Manager

Aplicación web para gestionar clases particulares de pádel: **alumnos**, **clases**, **calendario** y **pagos/ingresos**. Sustituye a un sistema basado en Notion.

Construida con **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, **Drizzle ORM** y **Postgres (Supabase)**.

- Interfaz en español.
- Columnas y valores de la base de datos en inglés.
- Login básico de un solo usuario.

## Requisitos

- [Bun](https://bun.sh) (gestor de paquetes y runtime de scripts)
- Una base de datos Postgres (recomendado: [Supabase](https://supabase.com))

## Puesta en marcha

1. **Instala dependencias**

   ```bash
   bun install
   ```

2. **Configura las variables de entorno**

   Copia `.env.example` a `.env.local` y rellena los valores:

   ```bash
   cp .env.example .env.local
   ```

   - `DATABASE_URL`: cadena de conexión de Supabase. Usa el **Transaction pooler** (Dashboard > Project Settings > Database > Connection string).
   - `AUTH_USERNAME` / `AUTH_PASSWORD`: credenciales de acceso.
   - `AUTH_SECRET`: secreto aleatorio para firmar la cookie de sesión. Genéralo, por ejemplo, con `openssl rand -hex 32`.

3. **Crea las tablas en la base de datos**

   ```bash
   bun run db:push       # aplica el esquema directamente
   # o bien, con migraciones:
   bun run db:generate   # genera SQL en ./drizzle
   bun run db:migrate    # aplica las migraciones
   ```

4. **Arranca en desarrollo**

   ```bash
   bun run dev
   ```

   Abre http://localhost:3000 e inicia sesión con tus credenciales.

## Importar datos desde Notion

1. En Notion, exporta cada base de datos como CSV: `···` > **Export** > *Markdown & CSV*.
2. Coloca los archivos en `./notion-export/` con estos nombres:
   - `notion-export/alumnos.csv`
   - `notion-export/clases.csv`
   - `notion-export/pagos.csv`
3. Ejecuta el importador:

   ```bash
   bun run import:notion
   ```

El script detecta automáticamente encabezados habituales en español, mapea los
valores a los enums en inglés y resuelve las relaciones de clases/pagos por el
nombre del alumno. Al iniciar imprime los encabezados detectados; si tus columnas
tienen nombres distintos, ajusta los alias en `scripts/import-notion.ts`
(constantes `pick(...)`). Es idempotente: puedes re-ejecutarlo sin duplicar.

## Scripts

| Script | Descripción |
| --- | --- |
| `bun run dev` | Servidor de desarrollo |
| `bun run build` | Build de producción |
| `bun run start` | Servir el build |
| `bun run lint` | ESLint |
| `bun run db:generate` | Genera migraciones SQL desde el esquema |
| `bun run db:migrate` | Aplica migraciones |
| `bun run db:push` | Aplica el esquema directamente (sin migraciones) |
| `bun run db:studio` | Abre Drizzle Studio |
| `bun run import:notion` | Importa los CSV de Notion |

## Estructura

```
app/
  (app)/            # Rutas protegidas (con navbar)
    page.tsx        # Dashboard
    students/       # CRUD de alumnos + ficha
    classes/        # CRUD de clases + ficha
    calendar/       # Vista de calendario mensual
    payments/       # Pagos mensuales e ingresos
  api/auth/         # Login / logout
  login/            # Página de acceso
components/
  ui/               # Componentes shadcn/ui
lib/
  db/               # Conexión, esquema y consultas Drizzle
  auth.ts           # Sesión (cookie firmada) y credenciales
  labels.ts         # Mapeo valor (EN) -> etiqueta (ES)
  format.ts         # Formato de moneda, fechas y helpers
proxy.ts            # Protección de rutas (antes middleware)
scripts/
  import-notion.ts  # Importador de CSV
drizzle/            # Migraciones generadas
```

## Modelo de datos

- **students**: `first_name`, `last_name`, `birth_date`, `level` (`beginner_intro` | `beginner` | `intermediate` | `advanced`), `gender` (`male` | `female` | `other`), `phone`.
- **classes**: `type` (`individual` | `pair` | `group`), `status` (`pending` | `cancelled` | `completed`), `starts_at`, `duration_min`, `court_price`, `class_price`, `notes`.
- **class_students**: relación N:M entre clases y alumnos.
- **payments**: `student_id`, `year`, `month`, `amount`, `paid`, `paid_at` (único por alumno + periodo).

## Despliegue

Preparada para desplegar en **Vercel**. Configura las mismas variables de entorno
(`DATABASE_URL`, `AUTH_USERNAME`, `AUTH_PASSWORD`, `AUTH_SECRET`) en el proyecto.
