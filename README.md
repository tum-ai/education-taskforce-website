# AI Edutainment Course Portal

Private Next.js App Router site for the Schloss Elmau five-day AI course.

## Stack

- Next.js App Router with TypeScript
- CSS Modules and global TUM.ai design tokens
- Supabase Auth, Postgres, private Storage, and RLS
- Vitest, React Testing Library, and Playwright
- Vercel deployment target

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create `.env.local` from `.env.example` and fill the values locally. Do not commit real secrets.

Required values:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Legacy Supabase projects may use `SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_SECRET_KEY`.

## Supabase

Create a Supabase project, then run:

```bash
pnpm supabase:migration
pnpm supabase:test
```

The migration creates:

- `accounts`
- `day_uploads`
- private `participant-uploads` bucket
- RLS policies for admin and participant access

Configure Supabase Auth redirect URLs:

- `http://localhost:3000`
- Vercel preview URL when available
- production URL when available

## First Admin

After `.env.local` is configured, create the first admin with credentials chosen and stored by the project owner:

```bash
export ADMIN_USERNAME=admin-user
export ADMIN_DISPLAY_NAME="Course Admin"
read -s ADMIN_PASSWORD
export ADMIN_PASSWORD
pnpm seed:admin
unset ADMIN_PASSWORD
```

The script does not print the password.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

E2E tests start the local Next.js dev server automatically.
