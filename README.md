# Vennet

Identity, reputation, marketplace, verification, dispute, and fraud-detection platform built as a
single Next.js 14 App Router app that deploys to Vercel.

> Production deployment trigger: the main branch is the source of the Vercel Production deployment.
> Latest production deployment trigger: August 25, 2026.
> Latest deployment attempt: August 25, 2026, 11:50 PM Eastern.

## Stack

| Concern     | Implementation                                        |
| ----------- | ----------------------------------------------------- |
| Runtime     | Next.js 14 (App Router), React 18, TypeScript, Tailwind |
| Database    | Postgres (Vercel Postgres / Neon) + Drizzle ORM        |
| Auth        | Auth.js (NextAuth v4): credentials + optional Google   |
| Files       | Vercel Blob (public listing images, private KYC docs)  |
| Backend     | Server Actions (`src/lib/actions`) + API route handlers (`src/app/api`) |
| Payments    | Stripe Connect Standard (destination charges, 5% platform fee) |

## Environment variables

Copy `.env.example` to `.env.local` for local development, and set the same values in the Vercel
project settings for production.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `NEXTAUTH_URL` | Public base URL (e.g. `https://vennet.vercel.app`) |
| `NEXTAUTH_SECRET` | Session/JWT secret (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google sign-in; the provider is enabled only when both are set |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the `/api/stripe/webhook` endpoint |
| `SENDGRID_API_KEY` | Secret API key used to send email-verification codes |
| `SENDGRID_FROM_EMAIL` | Verified SendGrid sender email address |
| `SENDGRID_FROM_NAME` | Display name for verification emails |

Google OAuth redirect URI: `<NEXTAUTH_URL>/api/auth/callback/google`.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and NEXTAUTH_SECRET at minimum
npm run db:migrate           # apply SQL migrations in ./drizzle
npm run dev                  # http://localhost:3000
```

Schema changes: edit `src/lib/db/schema.ts`, then `npm run db:generate` to emit a new migration and
`npm run db:migrate` to apply it. `npm run db:push` is available for throwaway dev databases.

Checks: `npm run lint`, `npm run typecheck`, `npm run build`.

## Deploying to Vercel

1. Import the repository into Vercel (framework preset: Next.js, no custom build command needed).
2. Create a Postgres database (Vercel Postgres or Neon) and a Blob store; set the env vars above.
3. Run `npm run db:migrate` against the production `DATABASE_URL` (locally or from CI) before the
   first real traffic.
4. Add a Stripe webhook endpoint pointing at `https://<domain>/api/stripe/webhook` subscribed to
   `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, and
   `account.updated`, then set `STRIPE_WEBHOOK_SECRET`.
5. Bootstrap the first admin:

   ```sql
   insert into roles (user_id, role) values ('<user uuid>', 'admin')
   on conflict (user_id) do update set role = 'admin';
   ```

## Architecture

```
src/app                     pages (server components) + route handlers
  api/auth/[...nextauth]    Auth.js handler
  api/stripe/webhook        Stripe events -> transaction/listing/reputation updates
  api/uploads/*             Blob uploads (listing images public, KYC docs private)
  api/verification/document moderator-only streaming of private KYC docs
src/lib/actions             Server Actions: identity, reputation, marketplace, disputes,
                            verification, stripe, auth (registration)
src/lib/services            shared server logic: reputation, fraud, activity, transactions
src/lib/db                  Drizzle schema + lazy Postgres client
src/lib/queries.ts          read-side database queries used by server components
src/lib/auth.ts             Auth.js config + requireAuth/requireAdmin/requireModerator
```

### Domain rules

- **Identity** — one identity per user, reputation starts at 100, upgradable to Vennet Pro.
- **Reputation** — every change is written to `reputation_logs` and mirrored on `identities`;
  reviews require a buyer/seller transaction, self-reviews are rejected and flagged, and the daily
  influence of one actor on one target is capped at 20 points.
- **Marketplace** — sellers need an identity and completed Stripe onboarding; purchases create a
  pending transaction plus a destination-charge PaymentIntent with a 5% application fee; the
  webhook marks the transaction paid, the listing sold, and awards reputation to both sides.
- **Verification** — documents are uploaded to private Blob paths scoped to the uploading user
  (`verificationDocs/{userId}/...`) and are only readable by moderators/admins through
  `/api/verification/document`.
- **Disputes** — buyers only, one per transaction; moderators resolve to `resolved_buyer`,
  `resolved_seller`, or `dismissed`, adjusting transaction status and reputation.
- **Fraud** — activity writes trigger server-side scans producing `fraud_signals` for rapid listing
  creation, rapid purchases, excessive disputes, self-purchase attempts, and reputation
  manipulation. Signals are visible on the admin dashboard.
- **Roles** — stored in the `roles` table, resolved server-side into the session token; all
  privileged actions re-check the role on the server.
