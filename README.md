# Cloudflare Workers React Template

[cloudflarebutton]

A production-ready full-stack template for Cloudflare Workers with React frontend, Durable Objects for stateful entities, and a shared type-safe API. This template includes a demo chat application with users, chat boards, and messages, demonstrating scalable entity storage and indexing.

## Features

- **Durable Objects Entities**: One DO instance per User/ChatBoard with automatic indexing for efficient listing and pagination.
- **Type-Safe API**: Shared TypeScript types between worker and frontend; Hono routes with full request/response validation.
- **Modern React Frontend**: Vite + React 18 + Router + Tanstack Query + shadcn/ui + Tailwind CSS.
- **Real-time Chat Demo**: Create users/chats, send messages, CRUD operations with concurrency-safe mutations.
- **Hot Reload**: Full-stack local development with Vite dev server proxying to Workers.
- **Production Deploy**: Single `wrangler deploy` command; SPA asset handling.
- **Theme Support**: Dark/light mode with `next-themes`.
- **Error Handling**: Client/server error reporting, React Error Boundaries.

## Tech Stack

- **Backend**: Cloudflare Workers, Hono, Durable Objects, TypeScript
- **Frontend**: React 18, Vite, React Router, Tanstack Query, shadcn/ui, Tailwind CSS, Lucide Icons
- **State**: Immer, Zustand (ready for use)
- **Utils**: clsx, tailwind-merge, date-fns, UUID
- **Dev Tools**: Bun, ESLint, TypeScript 5, PostCSS

## Quick Start

1. **Prerequisites**:
   - [Bun](https://bun.sh/) installed
   - [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) installed and logged in (`wrangler login`)

2. **Install Dependencies**:
   ```bash
   bun install
   ```

3. **Run Locally**:
   ```bash
   bun dev
   ```
   Opens at `http://localhost:3000` (or `$PORT`). Frontend proxies API calls to Worker.

## Local Development

- **Frontend**: `bun dev` (Vite HMR)
- **Types**: `bun run cf-typegen` (generates `@cloudflare/workers-types`)
- **Lint**: `bun lint`
- **Build**: `bun build` (produces `dist/` for preview/deploy)
- **Preview**: `bun preview`

**Customize**:
- Add routes: `worker/user-routes.ts`
- Add entities: `worker/entities.ts` (extends `IndexedEntity`)
- Frontend pages: `src/pages/*` + update `src/main.tsx` router
- UI Components: shadcn/ui ready (`npx shadcn-ui@latest add <component>`)

**API Endpoints** (demo):
```
GET    /api/users        # List users (paginated)
POST   /api/users        # { name }
GET    /api/chats        # List chats
POST   /api/chats        # { title }
POST   /api/chats/:id/messages  # { userId, text }
DELETE /api/users/:id
```

## Deployment

1. **Build Assets**:
   ```bash
   bun build
   ```

2. **Deploy**:
   ```bash
   bun deploy
   ```
   Deploys Worker + static assets to Cloudflare Pages/Assets. Config in `wrangler.jsonc`.

3. **Custom Domain**: Update `wrangler.jsonc` or use Cloudflare dashboard.

[cloudflarebutton]

**Migrations**: Durable Objects use SQLite; new classes auto-migrate.

## Project Structure

```
├── shared/          # Shared types + mocks
├── src/             # React app (Vite)
├── worker/          # Cloudflare Worker (Hono + DOs)
├── tsconfig*.json   # TypeScript configs
├── wrangler.jsonc   # Worker deploy config
└── package.json     # Bun + deps
```

## Extending Entities

See `worker/core-utils.ts` + `entities.ts`:

```typescript
// worker/entities.ts
export class NewEntity extends IndexedEntity<NewEntityState> {
  static readonly entityName = "new";
  static readonly indexName = "news";
  static readonly initialState = { id: "", ... };
}

// worker/user-routes.ts
app.get('/api/news', async (c) => {
  const page = await NewEntity.list(c.env, cursor, limit);
  return ok(c, page);
});
```

Seed data: `static seedData = [...]`; auto-created on first list.

## License

MIT. See [LICENSE](LICENSE) for details.