# AGENTS.md

App para gestionar clases particulares de pádel. Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui + Drizzle ORM + Postgres. Ver `README.md` para detalle funcional y modelo de datos completo.

## Convenciones clave

- **UI en español, base de datos en inglés.** Nombres de columnas y valores de enums en `lib/db/schema.ts` van en inglés; las etiquetas visibles se mapean en `lib/labels.ts`. Al añadir un valor de enum, actualiza **ambos** archivos.
- **Gestor de paquetes: Bun**, no npm/yarn/pnpm (hay `bun.lock`).
- No hay suite de tests ni test runner configurado en este repo.

## Comandos

```
bun install
bun run dev            # servidor de desarrollo
bun run build
bun run lint           # eslint
bun run db:push        # aplica schema directo a la BD (sin migración)
bun run db:generate    # genera SQL en ./drizzle desde lib/db/schema.ts
bun run db:migrate     # aplica migraciones generadas
bun run db:studio      # Drizzle Studio
bun run import:notion  # importa CSVs desde ./notion-export/
```

## Base de datos

- Schema fuente de verdad: `lib/db/schema.ts`.
- `drizzle.config.ts` carga variables desde **`.env.local`** (no `.env`) para `DATABASE_URL`.
- Dos flujos posibles para cambios de schema: `db:push` (directo, útil en dev) o `db:generate` + `db:migrate` (versionado, escribe en `./drizzle`). No mezclar ambos sin revisar el historial de migraciones.

## Auth

- Auth propia de un solo usuario basada en cookie firmada HMAC-SHA256 (`lib/auth.ts`), no NextAuth ni librería externa.
- La protección de rutas está en **`proxy.ts`** (no `middleware.ts`; es el reemplazo de middleware en este proyecto).
- Variables requeridas: `DATABASE_URL`, `AUTH_USERNAME`, `AUTH_PASSWORD`, `AUTH_SECRET` (ver `.env.example`).

## Estructura

- `app/(app)/` — rutas protegidas con navbar (dashboard, students, classes, calendar, payments).
- `app/api/auth/` — login/logout.
- `components/ui/` — componentes shadcn/ui.
- `lib/db/` — conexión, schema y queries Drizzle.
- `scripts/import-notion.ts` — importador CSV de Notion; espera archivos en `./notion-export/alumnos.csv`, `clases.csv`, `pagos.csv`; alias de encabezados hardcodeados en las constantes `pick(...)`; es idempotente (se puede re-ejecutar sin duplicar).

## Skills instaladas

`.agents/skills/` incluye `web-design-guidelines`, `vercel-react-best-practices` y `vercel-composition-patterns` — consultarlas al escribir UI/componentes React.

## Despliegue

Objetivo principal: Vercel (mismas env vars que en local). `docker-compose.yml` referencia un setup self-hosted separado con nombres (`work-from-home-*`, `SESSION_SECRET`) inconsistentes con la app actual — verificar antes de asumir que está actualizado.
