# Brutal Burger — Sistema de Hamburgueria

## Overview

Sistema web completo para hamburgueria com cardápio digital, painel administrativo e integração com WhatsApp.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (dark theme)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Estrutura

- `artifacts/brutal-burger/` — Frontend React (cardápio público + admin)
- `artifacts/api-server/` — Backend Express
- `lib/db/` — Schema PostgreSQL (categorias, produtos, admins)
- `lib/api-spec/` — OpenAPI spec
- `lib/api-client-react/` — Hooks React Query gerados
- `lib/api-zod/` — Schemas Zod gerados

## Credenciais Admin

- **URL**: `/admin`
- **Email**: `admin@brutalburger.com`
- **Senha**: `senha123`

## Pages

### Público (`/`)
- Cardápio com tema dark
- Tabs: Todos / Comidas / Bebidas
- Filtro por categoria
- Badges: PROMOÇÃO e ESGOTADO
- Botão "Pedir no WhatsApp"
- Atualização automática a cada 30s

### Admin (`/admin/*`)
- `/admin` — Login
- `/admin/dashboard` — Estatísticas
- `/admin/products` — CRUD de produtos
- `/admin/categories` — CRUD de categorias

## Key Commands

- `pnpm run typecheck` — full typecheck
- `pnpm run build` — typecheck + build
- `pnpm --filter @workspace/api-spec run codegen` — regenerar hooks e schemas
- `pnpm --filter @workspace/db run push` — push DB schema
- `pnpm --filter @workspace/api-server run dev` — rodar API server
