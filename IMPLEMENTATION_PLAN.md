# Schloss Elmau AI Course Website Implementation Plan

## Goal

Build a fast, modern website for the Schloss Elmau AI course where families can log in and see the outcomes from each of the five days.

The site must:

- Present a polished landing page in the TUM.ai CI.
- Explain the 5-day AI program in a warm, non-corporate way.
- Provide one login flow for all accounts.
- Use exactly two account roles: `admin` and `participant`.
- Give parents and children the same permissions through the `participant` role.
- Show five fixed day sections for each participant account.
- Let the admin upload outcomes for each day as images, HTML, PDFs, Word documents, or other simple downloadable files.
- Render uploaded HTML live in a sandboxed preview.
- Let participants download uploaded files and source code.
- Provide an admin area for account creation, credential generation, QR code generation, and day uploads.
- Deploy the frontend on Vercel.
- Use Supabase for Auth, Postgres, private Storage, and Row Level Security.
- Be built step by step with focused tests, using red-green-refactor for security-critical and domain-critical behavior.

## Non-Negotiable Product Rules

- There are exactly two account roles:
  - `admin`
  - `participant`
- `parent`, `child`, `student`, and `family` are not roles.
- Parents and children both use the `participant` role.
- A participant account owns five fixed day buckets: Day 1 through Day 5.
- There is no course database structure in v1.
- There is no enrollment database structure in v1.
- There is no day publishing workflow in v1.
- There is no audit-log table in v1.
- Admin uploads are visible to that participant account after upload.
- Keep the data model intentionally small until there is a real product need for more structure.

## Technical Constraints

- Use English for all code, comments, technical docs, commit messages, and UI implementation identifiers.
- Do not read, print, stage, or modify `.env*`, secrets, SSH keys, private keys, or ignored secret files.
- Do not use `git push` unless explicitly permitted.
- Run relevant checks before handoff.
- Do not expose Supabase secret keys, service-role keys, password values, or admin APIs to the browser.
- Do not store generated plaintext passwords outside the initial creation/reset result.
- Do not place uploaded HTML directly into the app DOM. Always use a sandboxed iframe.
- Keep the participant experience simple enough for non-technical users.

## Why Supabase Is Easier Here

Supabase is easier than Vercel Postgres plus Vercel Blob for this specific app because it removes custom security work:

- Supabase Auth handles sessions and password auth.
- Supabase Postgres stores the tiny app model.
- Supabase RLS protects rows at the database layer.
- Supabase Storage uses RLS policies for private file access.
- Admin account creation can use Supabase Auth Admin APIs from server-only code.

The tradeoff is that you must create and manage one Supabase project in addition to the Vercel deployment.

## User Setup Handoffs

Codex must not assume external services are already configured. When a phase needs user-owned setup, Codex must pause and ask for exactly the missing item with clear instructions for where to enter it.

Codex must ask the user to do these things when they become necessary:

1. Create a Supabase project.
   - Where: Supabase dashboard.
   - Needed for: Auth, database, Storage, and RLS tests.
   - Codex should ask only when Supabase integration starts, not during early UI-only phases.

2. Create or connect a Vercel project.
   - Where: Vercel dashboard.
   - Needed for: preview and production deployment.
   - Codex should ask during deployment setup, not before local development is working.

3. Add environment variables locally and in Vercel.
   - Where locally: `.env.local`, created by the user or generated from `.env.example` without real secrets committed.
   - Where in Vercel: Project Settings -> Environment Variables.
   - Required values:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_SITE_URL`
   - Codex may create `.env.example`.
   - Codex must not ask the user to paste secret values into chat.

4. Configure Supabase Auth redirect URLs.
   - Where: Supabase dashboard -> Authentication -> URL Configuration.
   - Required URLs:
     - local development URL, usually `http://localhost:3000`
     - Vercel preview URL when available
     - production domain when available
   - Codex should provide the exact URLs once the local or deployed URLs are known.

5. Create the first admin account.
   - Where: through the app's seed script or one-time admin creation command.
   - Codex can write the script and tell the user what command to run.
   - The user must choose/store the first admin credentials.
   - Codex must not print or persist generated temporary passwords beyond the intended one-time output.

6. Choose product settings.
   - Account strategy: one `participant` account per child, family, or workshop group.
   - Upload limit: for example 25 MB or 50 MB per file.
   - Delete behavior: whether admin upload deletion is needed in v1.
   - Final 5-day program text and images.

If a needed value is missing, Codex must say:

- what is missing
- why it is needed now
- where the user enters it
- whether it is secret
- the next command Codex will run after it is configured

Codex must keep building local/testable parts while external setup is not yet required. It should block only when the missing setup is necessary for the current phase.

## Build Strategy And Test Rule

The full product scope remains required. The implementation should still include Supabase Auth, RLS, private Storage, admin account management, QR credential generation, uploads, protected downloads, HTML sandbox previews, Playwright, Vitest, deployment, and production readiness.

To keep the build maintainable, implement the product as thin vertical slices instead of isolated subsystems:

1. Establish the real Supabase data/security foundation early.
2. Build one complete admin-to-participant upload loop before expanding file rendering and admin polish.
3. Add reusable UI only when there is a concrete second use.
4. Keep fixture data only where it speeds local UI development; do not let fake repositories delay real authorization/storage integration.
5. Prefer boring server actions, route handlers, and Server Components over custom client-side state machinery.

Use red-green-refactor for behavior where bugs would be expensive or unsafe:

- Role rules.
- Username normalization and internal email mapping.
- Route protection and redirects.
- Supabase RLS and Storage authorization.
- File validation, safe filenames, and protected downloads.
- HTML iframe sandboxing.
- Credential generation and QR payload safety.

Use lighter tests for presentational UI:

- Component tests for reusable form controls and upload/rendering components.
- Playwright tests for critical end-to-end flows, not every visual state.
- Manual screenshot checks for responsive polish.

Codex must not implement broad untested security or data-access features in one pass.

## Recommended Tech Stack

- Framework: Next.js App Router with TypeScript.
- Deployment: Vercel.
- Backend: Supabase Auth, Postgres, private Storage, and RLS.
- Supabase client: `@supabase/supabase-js` and `@supabase/ssr`.
- Package manager: pnpm.
- Styling: CSS Modules plus global CSS variables.
- Unit/component tests: Vitest and React Testing Library.
- E2E tests: Playwright.
- Validation: zod.
- Icons: lucide-react.
- QR generation: a proven QR code package such as `qrcode`.

Reasoning:

- Next.js App Router fits protected pages, server actions, route handlers, and Vercel deployment.
- Supabase Auth avoids custom password hashing and session code.
- Supabase RLS gives defense in depth for account-owned data.
- Supabase Storage keeps uploaded files under the same authorization model.

## TUM.ai UI Direction

Use the provided TUM.ai CI colors:

- White: `#FFFFFF`
- Minimal Grey: `#EFEFEF`
- Lavender Tint: `#F5EFFF`
- Electric Lavender: `#9A64D9`
- Dark Purple: `#523573`
- Dark Indigo: `#1B0049`
- Electric Fade: `linear-gradient(135deg, #9A64D9 0%, #523573 100%)`

Design rules:

- Use mostly white, minimal grey, and lavender tint as surfaces.
- Use electric lavender and dark purple for CTAs, focus states, selected states, and small highlights.
- Use dark indigo for strong headings and readable text.
- Avoid a one-color purple UI. Balance the palette with neutral surfaces.
- Avoid corporate/LinkedIn-style copy and layout.
- The first screen must show the AI course, a visible login button, and a hint of the 5-day program.
- Use cards with `8px` radius or less unless a specific component needs otherwise.
- Use icons for admin controls and action buttons where helpful.
- Include clear loading, empty, error, disabled, and success states.
- Text must fit on mobile and desktop without overlap.

## Routes

Public:

- `/` landing page
- `/login` shared login page for `admin` and `participant`

Participant:

- `/portal` five day cards for the logged-in participant account
- `/portal/day/[dayNumber]` uploaded outcomes for Day 1 through Day 5

Admin:

- `/admin` admin dashboard
- `/admin/accounts` create accounts, reset credentials, and generate QR credential cards
- `/admin/uploads` upload files for a selected participant account and day

API/route handlers:

- `/api/download/[uploadId]` protected file download if direct Supabase Storage download from server route is preferred
- `/api/preview/[uploadId]` protected HTML preview source if iframe `src` is preferred over `srcDoc`

## Project Structure

```text
app/
  (public)/
    page.tsx
    login/
      page.tsx
  (portal)/
    portal/
      page.tsx
      day/
        [dayNumber]/
          page.tsx
  (admin)/
    admin/
      page.tsx
      accounts/
        page.tsx
      uploads/
        page.tsx
  api/
    download/
      [uploadId]/
        route.ts
    preview/
      [uploadId]/
        route.ts
components/
  admin/
  auth/
  layout/
  portal/
  preview/
  ui/
lib/
  auth/
  data/
  domain/
  files/
  storage/
  supabase/
  validation/
styles/
  globals.css
tests/
  unit/
  component/
  e2e/
supabase/
  migrations/
  seed.sql
```

Boundaries:

- `app/` owns routing, layouts, server-side data loading, and page composition.
- `components/` owns reusable presentational UI.
- `lib/domain/` owns types and pure business rules.
- `lib/data/` owns repository interfaces and implementations.
- `lib/auth/` owns login, session lookup, and authorization helpers.
- `lib/supabase/` owns browser, server, and admin Supabase clients.
- `lib/storage/` owns Supabase Storage path, upload, download, and preview helpers.
- `lib/files/` owns file type detection, safe filenames, and download metadata.
- `tests/` owns helpers, fixtures, and E2E specs.

## Core Domain Model

Use this model before Supabase integration:

```ts
export type UserRole = "admin" | "participant";

export type DayNumber = 1 | 2 | 3 | 4 | 5;

export type Account = {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
};

export type UploadFileType = "image" | "html" | "pdf" | "document" | "other";

export type DayUpload = {
  id: string;
  accountId: string;
  dayNumber: DayNumber;
  title: string;
  fileType: UploadFileType;
  storagePath: string;
  originalFilename: string;
  contentType: string;
  fileSizeBytes: number;
  createdAt: string;
};
```

Rules:

- There is no `parent` role.
- There is no `child` role.
- There is no `student` role.
- There is no `course` type in v1.
- There is no `enrollment` type in v1.
- There is no visibility flag in v1.
- A `participant` can read only their own `DayUpload` records.
- An `admin` can create accounts and manage uploads for all participant accounts.

## Minimal Supabase Data Model

Use only these public tables for v1.

### `accounts`

```sql
id uuid primary key references auth.users(id) on delete cascade,
username text unique not null,
display_name text not null,
role text not null check (role in ('admin', 'participant')),
created_at timestamptz not null default now()
```

Notes:

- `id` is the same UUID as the Supabase Auth user.
- Passwords are stored by Supabase Auth, not in app tables.
- `username` is the human-facing login name.
- The internal Auth email is generated from username and must not be shown in the UI.

### `day_uploads`

```sql
id uuid primary key default gen_random_uuid(),
account_id uuid not null references accounts(id) on delete cascade,
day_number int not null check (day_number between 1 and 5),
title text not null,
file_type text not null check (file_type in ('image', 'html', 'pdf', 'document', 'other')),
storage_path text not null,
original_filename text not null,
content_type text not null,
file_size_bytes int not null,
created_at timestamptz not null default now()
```

Recommended indexes:

```sql
create unique index accounts_username_lower_idx on public.accounts (lower(username));
create index day_uploads_account_day_idx on public.day_uploads (account_id, day_number, created_at);
```

## Supabase Storage

Use one private bucket:

- `participant-uploads`

Recommended storage path:

```text
accounts/{accountId}/day-{dayNumber}/{uploadId}-{safeFilename}
```

Rules:

- The bucket must not be public.
- Store file metadata in `day_uploads`.
- Store only the storage path in the database, not public URLs.
- Use protected server routes or signed URLs only after authorization.
- Admin uploads should happen through server-only code or admin-verified server actions.
- Participants may read only files linked to their own `day_uploads`.

## Supabase Security Model

RLS is required for all exposed public tables.

Table rules:

- Enable RLS on `accounts`.
- Enable RLS on `day_uploads`.
- `participant` can select only their own `accounts` row.
- `participant` can select only `day_uploads` where `account_id = auth.uid()`.
- `participant` cannot insert, update, or delete `day_uploads`.
- `admin` can select all accounts and uploads.
- `admin` can insert, update, and delete uploads.
- `admin` can create and reset accounts only through server-only Auth Admin code.

Storage rules:

- Storage RLS must protect `storage.objects`.
- Anonymous users cannot read the private bucket.
- Participants can read objects only when the object belongs to their account path or has a matching `day_uploads` row.
- Participants cannot upload to the bucket.
- Admins can upload/read/delete objects in the bucket through server-verified actions.
- Secret/service-role keys bypass RLS and must stay server-only.

Admin detection:

- The app table `accounts.role` is the source of truth.
- Helper SQL functions for RLS may be used, for example `public.current_user_is_admin()`.
- RLS helper functions that read `accounts` must use `security definer` with a fixed `search_path`.
- Avoid recursive RLS policies that query the same table unsafely.
- Add SQL tests for participant isolation and admin access.

## Authentication Model

All accounts log in with username and password.

Supabase password auth expects an email or phone identity, so the app uses an internal generated email.

Implementation:

- Store the visible username in `accounts.username`.
- Generate an internal Auth email from username, for example `<username>@internal.education-taskforce.local`.
- Username normalization must allow only safe email-local-part characters before generating the internal email.
- Never show the internal email in the UI.
- Login form accepts username and password.
- The login server action maps username to the internal email and calls Supabase password sign-in.
- The login action must not expose an anonymous username lookup endpoint.
- Server-side route protection uses Supabase SSR clients and validated Auth claims, not untrusted cookie content.
- Admin account creation creates:
  - Supabase Auth user
  - `accounts` row
  - temporary password
- Show the temporary password only once after creation or reset.
- Resetting a password uses Supabase Auth Admin APIs from server-only code.
- QR code encodes a login URL with the username prefilled, for example `/login?u=<username>`.
- QR code must not contain the password.

Redirect rules:

- `admin` logs in and goes to `/admin`.
- `participant` logs in and goes to `/portal`.
- Anonymous users trying to open `/portal` or `/admin` go to `/login`.
- `participant` trying to open `/admin` is denied.

Initial admin bootstrap:

- Add a SQL seed or server-only script for the first admin account.
- The script must create a Supabase Auth user and matching `accounts` row.
- The script must never print secret keys or password hashes.
- Do not commit credentials.

## File Handling Rules

Supported uploads:

- Images: preview inline.
- HTML: preview in sandboxed iframe and allow source download.
- PDF: show a preview/download card. Inline preview can be added if simple and reliable.
- Word/documents: show a download card.
- Other files: show a download card.

Validation:

- Require `accountId`.
- Require `dayNumber` between 1 and 5.
- Require title.
- Require exactly one file per upload action.
- Detect file type from MIME type and extension.
- Reject unsupported or dangerous file extensions.
- Enforce a practical file size limit.
- Sanitize download filenames.

## HTML Preview Security

HTML uploads must render in a sandboxed iframe.

Baseline:

```tsx
<iframe
  title={title}
  sandbox="allow-scripts"
  srcDoc={html}
/>
```

Rules:

- Do not use `allow-same-origin` unless there is a tested, explicit need.
- Do not use `allow-top-navigation`.
- Do not use `dangerouslySetInnerHTML` for uploaded HTML.
- Provide a download button for the HTML source.
- Provide loading and error states.
- Add tests proving the iframe is sandboxed.

## Performance Targets

- Landing page should feel instant on normal hotel Wi-Fi.
- Keep initial JavaScript small.
- Avoid heavy animation libraries unless a clear need appears.
- Use optimized images.
- Prefer Server Components for data loading.
- Use client components only for real interactivity.
- Avoid global client state unless necessary.
- Use local state for forms, previews, upload progress, and small UI interactions.

## Accessibility And UX Targets

- All buttons and links must have accessible names.
- Keyboard users must be able to log in, open day cards, preview files, download files, and operate admin forms.
- Form errors must be visible and associated with fields.
- Use real `button`, `a`, `input`, `select`, and `textarea` elements.
- Mobile layout must be first-class.
- Participant screens must avoid technical language.
- Admin pages can be denser, but still predictable and clear.

## Implementation Phases

This phase plan keeps the full scope but raises buildability by reducing isolated workstreams and moving Supabase integration earlier. The target is one thin, real product loop first, then controlled expansion.

### Phase 0: Repository Setup And App Skeleton

Goal:

- Create the Next.js App Router project, basic route shells, test runners, and verification scripts.
- Keep the scaffold minimal enough that later phases can change structure without churn.

Focused tests:

- `/` renders a visible login link.
- `/login` renders username and password fields.
- `/portal` redirects anonymous users to `/login`.
- `/admin` redirects anonymous users to `/login`.

Build:

- Scaffold Next.js App Router with TypeScript.
- Add pnpm scripts:
  - `dev`
  - `build`
  - `lint`
  - `test`
  - `test:watch`
  - `test:e2e`
  - `typecheck`
  - `supabase:migration`
  - `supabase:test`
  - `seed:admin`
- Configure Vitest, React Testing Library, and Playwright.
- Add basic public, portal, and admin route shells.

Verify:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

### Phase 1: Domain, Minimal UI, And Landing Page

Goal:

- Establish the small product model and the visual baseline before introducing external services.
- Build only the UI primitives needed by the landing and login routes.

Focused tests:

- `UserRole` accepts only `admin` and `participant`.
- Day number accepts only `1`, `2`, `3`, `4`, and `5`.
- File type detection maps images, HTML, PDFs, documents, and unknown files correctly.
- Upload validation rejects missing account, missing day, missing title, missing file, and oversized files.
- `/` shows the Schloss Elmau AI course title, a prominent login button, and exactly five day previews.
- Mobile viewport has no horizontal overflow.

Build:

- Add domain types in `lib/domain`.
- Add zod schemas in `lib/validation`.
- Add file helpers in `lib/files`.
- Add global CSS variables for the TUM.ai palette, spacing, typography, focus rings, and radii.
- Build minimal UI components only as needed:
  - `Button`
  - `TextInput`
  - `Select`
  - `EmptyState`
  - `ErrorMessage`
- Build the landing page with warm copy, a login CTA, and the five-day program preview.

Verify:

- `pnpm test -- domain`
- `pnpm test:e2e -- landing`
- `pnpm lint`
- Manual mobile screenshot check.

### Phase 2: Supabase Foundation, Schema, RLS, And Storage

Goal:

- Put the real auth/data/storage security foundation in place before building the main product flows.
- Avoid late rework from building too much on fixture-only assumptions.

User handoff before build:

- Ask the user to create or confirm the Supabase project.
- Ask the user to configure local Supabase environment variables in `.env.local`; do not request secret values in chat.
- Tell the user where to find each value in the Supabase dashboard.
- Ask the user whether they want Codex to run Supabase CLI commands locally if CLI access is needed.

Focused tests:

- `accounts` table exists.
- `day_uploads` table exists.
- Role check constraint allows only `admin` and `participant`.
- Day check constraint allows only 1 through 5.
- RLS is enabled on `accounts` and `day_uploads`.
- Anonymous reads fail.
- Participants can read only their own account and upload rows.
- Participants cannot insert, update, or delete uploads.
- Admins can read and manage participant accounts and uploads.
- `participant-uploads` bucket exists and is private.
- Anonymous storage reads fail.
- Cross-participant storage reads fail.
- Admin storage writes pass.

Build:

- Add `.env.example` with placeholder keys only.
- Add Supabase browser, server, and server-only admin clients.
- Add migrations for `accounts` and `day_uploads`.
- Add indexes.
- Add RLS helper functions if needed.
- Add table policies.
- Add private Storage bucket setup and Storage policies.
- Add repository interfaces with Supabase implementations:
  - `AccountRepository`
  - `UploadRepository`
- Keep lightweight fixture data only for component tests and local UI fallback states.

Verify:

- `pnpm test -- repository`
- `pnpm test -- storage`
- `pnpm supabase:test` if local Supabase is configured
- `pnpm typecheck`

### Phase 3: Auth, Login, Route Protection, And First Admin

Goal:

- Make real login and role-based navigation work against Supabase.
- Create the minimum admin bootstrap path needed to use the app.

Focused tests:

- Username normalization trims, lowercases, and rejects unsafe values.
- Username maps to the expected internal email.
- Empty username/password returns validation errors.
- Invalid credentials return a safe generic error.
- `admin` logs in and redirects to `/admin`.
- `participant` logs in and redirects to `/portal`.
- Anonymous users trying to open `/portal` or `/admin` go to `/login`.
- `participant` trying to open `/admin` is denied.
- Secret/service-role keys are imported only from server-only modules.

Build:

- Implement:
  - `signInWithUsername(username, password)`
  - `signOut()`
  - `getCurrentAccount()`
  - `requireUser()`
  - `requireAdmin()`
  - `requireParticipant()`
- Build `/login`.
- Add middleware/session refresh if required by Supabase SSR.
- Add server-side route guards.
- Add a one-time first admin creation script or documented command.

Verify:

- `pnpm test -- auth`
- `pnpm test:e2e -- auth`
- `pnpm build`

### Phase 4: First Complete Admin-To-Participant Upload Loop

Goal:

- Build the smallest real vertical slice: admin creates a participant, uploads a file to a day, participant logs in, sees the correct five-day portal, and downloads the file through authorization checks.

Focused tests:

- Generated usernames avoid collisions.
- Generated passwords meet length and complexity rules.
- Created non-admin accounts always use role `participant`.
- Temporary passwords are returned only in the creation/reset result.
- Admin can create a participant account.
- Repository returns exactly five day buckets for a participant account.
- Empty days return an empty upload list.
- Upload requires selected participant account, day number from 1 to 5, title, and one file.
- Admin can upload one supported file to a participant day.
- Participant sees the uploaded file on the matching day.
- Participant cannot see or download another participant's upload.
- Anonymous users cannot download protected uploads.
- Admin can download uploads.
- Download filename is safe.

Build:

- Build `/admin` layout and navigation.
- Build `/admin/accounts` with:
  - account table
  - create participant form
  - one-time credential result
- Build `/admin/uploads` with:
  - participant selector
  - Day 1 to Day 5 selector
  - title input
  - file input
  - upload progress/result states
- Upload files to Supabase Storage.
- Insert metadata into `day_uploads`.
- Build `/portal` with exactly five day cards.
- Build `/portal/day/[dayNumber]`.
- Implement protected `/api/download/[uploadId]` if direct signed URL access is not preferred.
- Render all uploaded files as simple download cards in this phase.

Verify:

- `pnpm test -- accounts`
- `pnpm test -- uploads`
- `pnpm test -- downloads`
- `pnpm test:e2e -- core-flow`
- Manual mobile check for portal and admin forms.

### Phase 5: File Rendering And HTML Sandbox Preview

Goal:

- Expand the already-working upload loop to support the required file experiences.

Focused tests:

- HTML upload is classified as `html`.
- PDF upload is classified as `pdf`.
- Word upload is classified as `document`.
- Unsupported or dangerous extensions are rejected.
- Images render inline.
- HTML upload renders inside an iframe.
- iframe has a `sandbox` attribute.
- iframe does not include `allow-same-origin`.
- iframe does not include `allow-top-navigation`.
- HTML source download is visible.
- PDF, Word/document, and other files show clear download cards.
- Empty or invalid HTML shows a safe error state.

Build:

- Add `UploadRenderer`.
- Add image preview.
- Add `HtmlPreviewer`.
- Add protected `/api/preview/[uploadId]` if iframe `src` is preferred over `srcDoc`.
- Add PDF/document/other download cards.
- Add source download action for HTML.
- Keep iframe behavior centralized in one component.

Verify:

- `pnpm test -- files`
- `pnpm test -- HtmlPreviewer`
- `pnpm test:e2e -- html-preview`
- `pnpm build`

### Phase 6: Admin Management, QR Credentials, And Operational States

Goal:

- Complete the required admin tooling after the core product loop works.

Focused tests:

- Reset password uses Supabase Auth Admin APIs from server-only code.
- Reset password result shows the temporary password once.
- QR payload includes login URL with username only.
- QR payload does not include password.
- Account creation form validates display name.
- Credential result can be dismissed.
- Admin can print or download a QR credential card.
- Admin upload form shows useful empty, loading, error, disabled, and success states.

Build:

- Add reset password action.
- Add QR credential card component.
- Add printable credential view.
- Add existing uploads list grouped by selected participant and day.
- Add delete upload only if explicitly needed during implementation; otherwise leave it out of v1.
- Add admin dashboard summary:
  - participant accounts
  - uploads today
  - empty day buckets
- Add accessible loading, empty, error, disabled, and success states across admin and participant routes.

Verify:

- `pnpm test -- accounts`
- `pnpm test -- qr`
- `pnpm test:e2e -- admin-accounts`
- `pnpm test:e2e -- admin-uploads`

### Phase 7: Vercel Deployment, Final QA, And Production Readiness

Goal:

- Deploy the complete product and verify the critical flows in a production-like environment.

User handoff before build:

- Ask the user to create or connect the Vercel project.
- Tell the user to add environment variables in Vercel Project Settings -> Environment Variables.
- Tell the user which values are public and which are secret.
- Ask the user for the Vercel preview URL only after deployment exists, so Codex can provide the exact Supabase Auth redirect URL list.

Focused tests:

- Required environment variables are documented.
- Build fails clearly when required Supabase env vars are missing in production.
- Protected routes still deny anonymous users in production mode.
- Supabase secret key imports are server-only.
- Playwright regression suite covers:
  - landing
  - login
  - participant portal
  - day detail
  - image upload rendering
  - HTML preview
  - PDF/document download
  - admin account creation
  - admin QR generation
  - admin upload flow

Build:

- Add Vercel project configuration only if needed.
- Configure `NEXT_PUBLIC_SITE_URL`.
- Configure Supabase Auth redirect URLs for local, preview, and production URLs.
- Add not-found pages.
- Add error boundaries.
- Add metadata.
- Add responsive image handling.
- Add deployment notes and final setup checklist.
- Remove unused fixture data from production code paths where possible.
- Review server-only imports so browser bundles do not include secret Supabase admin code.

Verify:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`
- Vercel preview deployment smoke test when credentials are configured.
- Manual mobile and desktop QA.

## Test Matrix

Unit tests:

- Domain rules.
- Validation schemas.
- Username/password generation.
- Username-to-internal-email mapping.
- Authorization helpers.
- Repository ownership behavior.
- QR payload generation.
- Safe filenames.
- File type detection.

Component tests:

- Landing program cards.
- Login form.
- Day cards.
- Upload cards.
- HTML previewer.
- Admin forms.
- Credential card.
- Upload form.

E2E tests:

- Public visitor views landing page.
- Participant login.
- Participant sees five day cards.
- Participant opens each day.
- Participant previews HTML and downloads code.
- Participant downloads PDF/document/image files.
- Admin login.
- Admin creates participant account and QR credential card.
- Admin uploads files to a participant day.
- Unauthorized users cannot access admin pages.

Supabase/RLS/storage tests:

- Anonymous users cannot read protected data.
- Participant can read only their own uploads.
- Participant cannot write uploads.
- Participant cannot read another participant's Storage files.
- Admin can manage accounts and uploads.
- Storage policies match table ownership rules.
- Secret/service-role usage exists only in server-only modules.

## Environment Variables

Expected later, but do not create or read `.env*` files without explicit need.

Codex may create `.env.example` with placeholder keys. The user fills real values in `.env.local` and in Vercel. Real secret values must not be pasted into chat.

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=
```

Legacy Supabase projects may use this instead of `SUPABASE_SECRET_KEY`:

```text
SUPABASE_SERVICE_ROLE_KEY=
```

Rules:

- `NEXT_PUBLIC_*` values may be used in browser code.
- `SUPABASE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must be server-only.
- Never print secrets, password values, generated temporary passwords, or auth tokens in logs or test output.

Where the user enters values:

- Local development: `.env.local` in the project root.
- Vercel deployment: Vercel Project Settings -> Environment Variables.
- Supabase keys: Supabase Project Settings -> API.
- Supabase Auth redirects: Supabase Authentication -> URL Configuration.

What Codex should tell the user when values are needed:

- `NEXT_PUBLIC_SUPABASE_URL`: public project URL from Supabase Project Settings -> API.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public browser-safe key from Supabase Project Settings -> API.
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`: secret server-only key from Supabase Project Settings -> API.
- `NEXT_PUBLIC_SITE_URL`: local URL during development, then the Vercel preview/production URL for deployed environments.

## 5-Day Program Placeholders

Until the exact 5-day program details are provided, use placeholders that are easy to replace:

1. Day 1: Discover AI
2. Day 2: Prompting And Ideas
3. Day 3: Build With Images And Stories
4. Day 4: Create A Small Web Project
5. Day 5: Present And Share

Tone:

- Warm.
- Curious.
- Clear.
- Not overhyped.
- Not corporate.
- Avoid technical jargon for participant screens.

## Definition Of Done

The implementation is done when:

- Landing page is polished and responsive.
- Login is visible and works.
- There are exactly two roles in code, tests, and database checks: `admin` and `participant`.
- Participant portal shows exactly five day cards.
- Each day can show uploaded outcomes for that participant account.
- Images render as images.
- HTML projects render in a sandboxed live preview.
- PDFs, Word documents, and other files are downloadable.
- Admin can create participant accounts, reset passwords, generate QR credential cards, and upload day outcomes.
- The frontend deploys on Vercel.
- Supabase handles Auth, Postgres, private Storage, and RLS.
- There is no custom password hashing or custom session implementation.
- Tests cover core domain, UI components, Supabase auth, preview, downloads, admin flows, uploads, RLS, and Storage access.
- All required checks pass:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm test:e2e`
  - `pnpm build`

## Codex Execution Rule

When Codex starts implementation, it must follow this sequence for each phase:

1. State the current phase and the thin vertical outcome for that phase.
2. Add failing focused tests first for security-critical, domain-critical, or data-access behavior.
3. For presentational UI, add component or E2E tests only where they protect real behavior or important regressions.
4. Run the focused test and confirm it fails for the expected reason when a red step is used.
5. Implement the smallest correct code change that moves the phase outcome forward.
6. Run the focused test and confirm it passes.
7. Refactor only with relevant tests green.
8. Run the phase verification commands.
9. If external setup is required, ask the user with exact dashboard paths and exact variable names; do not ask for secrets to be pasted into chat.
10. After the user confirms setup, continue with the next verification command.
11. Do not commit unless explicitly asked.
12. If committing is requested, use `~/.codex/scripts/safe_commit.sh` when it exists.
