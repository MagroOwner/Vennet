# Vennet

Full-stack identity, reputation, marketplace, and verification platform built on Firebase.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS (`web/`)
- **Backend**: Firebase Cloud Functions v2, Node 20, TypeScript (`functions/`)
- **Data**: Firestore (`firestore.rules`, `firestore.indexes.json`)
- **Files**: Firebase Storage (`storage.rules`)
- **Payments**: Stripe Connect Standard (onboarding, destination charges, webhooks)
- **Auth**: Firebase Authentication (email/password + Google)

## Modules

| Module | Backend | Frontend |
| --- | --- | --- |
| Identity | `createIdentity`, `updateIdentity`, `upgradeToPro` | `/dashboard`, `/identity/[uid]`, `/settings`, `/pro` |
| Reputation | `calculateReputation`, `logReputationEvent`, `adjustReputation` | `/reputation` |
| Marketplace | `createListing`, `purchaseListing` | `/marketplace`, `/marketplace/[id]`, `/marketplace/new` |
| Stripe Connect | `stripeOnboard`, `stripeWebhook` | `/stripe/onboarding` |
| Verification | `submitVerification`, `approveVerification` | `/verification` |
| Disputes | `createDispute`, `resolveDispute` | `/disputes` |
| Fraud detection | `detectFraud` (Firestore trigger) + inline rule checks | `/admin` (fraud tab) |
| Admin | role-gated callables | `/admin` |

## Firestore collections

`users`, `identities`, `reputationScores`, `reputationLogs`, `listings`,
`listingImages`, `transactions`, `disputes`, `verificationRequests`,
`stripeAccounts`, `adPackages`, `activityLogs`, `fraudSignals`, `roles`

Client writes are locked down: all state transitions flow through Cloud
Functions; security rules only allow safe, owner-scoped reads/edits.

## Setup

1. Create a Firebase project, enable Auth (Email/Password + Google), Firestore,
   Storage, and Functions. Update `.firebaserc` with your project ID.
2. Copy `web/.env.example` to `web/.env.local` and fill in the web app config.
3. Set function secrets:
   ```sh
   firebase functions:secrets:set STRIPE_SECRET_KEY
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   ```
4. Install and build:
   ```sh
   (cd functions && npm install)
   (cd web && npm install)
   npm run build
   ```
5. Local development:
   ```sh
   npm run emulators   # Firebase emulator suite
   npm run dev         # Next.js dev server
   ```
6. Deploy: `firebase deploy`

### Bootstrapping an admin

Create a document in the `roles` collection with the admin's UID as the doc ID:

```json
{ "role": "admin", "grantedBy": "bootstrap", "updatedAt": <timestamp> }
```

### Stripe webhook

Point a Stripe webhook at the deployed `stripeWebhook` function URL and
subscribe to `payment_intent.succeeded`, `payment_intent.payment_failed`,
`account.updated`, and `charge.refunded`.
