# Vennet rebuild blueprint

## Decision

Vennet is not being rebuilt as a generic e-commerce clone. Its single job is to help people **discover, buy, and sell useful digital work**: templates, code, AI tools, bots, automations, education, design assets, services, and memberships.

The current repository already contains much of the marketplace data model: listings, carts, saved offers, follows, verified-purchase reviews, messages, coupons, bundles, referrals, notifications, disputes, verification requests, Stripe accounts, and fraud signals. The correct move is to surface and complete these features through one coherent product system—not duplicate them.

> Never display trust claims that are not true. “Verified” must map to a completed review process; “buyer protection” must map to an actual documented support/refund process; “escrow” must not be advertised unless a qualified payments/legal review has approved the exact funds flow.

---

## 1. Product experience

### The primary journeys

```text
Visitor
  -> Marketplace -> Listing -> Sign in -> Checkout -> Library -> Review / support

New creator
  -> Sign in -> Seller onboarding -> Connect Stripe -> Create listing
  -> Add preview + delivery -> Publish -> Seller dashboard -> Repeat sale

Returning buyer
  -> Home -> Continue browsing / saved offers / library -> Checkout

Support issue
  -> Order -> Buyer/seller message -> Open dispute -> Admin review -> Resolution
```

### Navigation

Keep buyer navigation simple and persistent:

| Area | Links |
|---|---|
| Primary header | Marketplace, Categories, Discover, My library, Saved, Help |
| Header actions | Search, cart, profile |
| Seller tools drawer | Seller overview, create listing, listings, orders & delivery, promotions, payouts, Vennet AI |
| Footer | About, Trust & safety, Refund policy, Terms, Privacy, Legal notices, Contact |

Seller functions must remain in the drawer; buyers should never have to scan a seller dashboard to browse products.

### Mobile rules

- Mobile header: brand, search, cart, menu only.
- Filter button opens a bottom sheet; never render a permanent narrow filter column.
- Listing cards use two columns above 390px and one column below it.
- Touch controls are at least 44x44px.
- The checkout CTA remains visible at the bottom of a listing page on mobile.

---

## 2. Design system

### Brand palette (no blue)

| Token | Light | Dark | Use |
|---|---:|---:|---|
| Ink | `#0B1020` | `#F7FAF8` | Primary text / dark surfaces |
| Canvas | `#F6FAF7` | `#08130F` | Page background |
| Surface | `#FFFFFF` | `#101C17` | Cards |
| Muted | `#637168` | `#A7B5AC` | Secondary copy |
| Line | `#DCE8E0` | `#24352D` | Borders |
| Vennet green | `#26C98B` | `#4DE0A2` | Main action / focus |
| Deep green | `#0E6048` | `#78E5B6` | Links / positive status |
| Mint | `#DDF8EA` | `#133B2B` | Soft highlights |
| Warm sand | `#F8E4B8` | `#4D3A1D` | Secondary editorial area |
| Coral | `#E77A67` | `#F19581` | Critical/destructive only |
| Gold | `#D89B1D` | `#F0BE55` | Warning / earned reputation |

Do not use random cyan, bright purple, or blue accents. Green should signal action and success, not fill every card.

### Type and spacing

- Typeface: existing Geist Sans; Geist Mono only for codes, IDs, and data.
- H1: 56/60 desktop, 40/44 tablet, 34/38 mobile; weight 800–900.
- H2: 36/42 desktop, 28/34 mobile; weight 800.
- H3: 20/28; weight 750–800.
- Body: 16/25; weight 450–500.
- Small: 14/20. Caption: 12/16.
- Spacing: `4, 8, 12, 16, 24, 32, 48, 64, 96` only.
- Radius: 12px controls, 16px cards, 24px major sections.
- Shadows: one soft elevation system only. Do not stack strong glow + heavy shadow + border.

### Motion

- 160ms hover/focus, 240ms panels, 320ms modals.
- Use opacity, translateY (4–8px), and subtle scale (1.01–1.02).
- Respect `prefers-reduced-motion`; no autoplay video and no moving backgrounds required to read content.

---

## 3. Component library

Create a single component folder and remove repeated hand-written card/button styles.

```text
src/components/ui/
  Button.tsx        Badge.tsx         Card.tsx
  Input.tsx         Select.tsx        Checkbox.tsx
  Dialog.tsx        Drawer.tsx        EmptyState.tsx
  Skeleton.tsx      SectionHeader.tsx Toast.tsx
src/components/marketplace/
  ListingCard.tsx   ListingGrid.tsx   FilterSheet.tsx
  Price.tsx         Rating.tsx        SellerChip.tsx
src/components/seller/
  SellerDrawer.tsx  OnboardingCard.tsx MetricsCard.tsx
```

Example button API:

```tsx
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  intent?: "primary" | "secondary" | "quiet" | "danger";
  loading?: boolean;
};

export function Button({
  intent = "primary", loading, className = "", children, ...props
}: ButtonProps) {
  const styles = {
    primary: "bg-[var(--green)] text-[var(--ink)] hover:bg-[#4de0a2]",
    secondary: "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]",
    quiet: "text-[var(--deep-green)] hover:bg-[var(--mint)]",
    danger: "bg-[var(--danger)] text-white hover:brightness-95",
  };
  return <button className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 font-bold transition motion-reduce:transition-none disabled:opacity-50 ${styles[intent]} ${className}`} disabled={loading || props.disabled} {...props}>
    {loading ? "Working…" : children}
  </button>;
}
```

---

## 4. Page blueprints

### Homepage

1. **Hero** — one message: “Buy and sell digital work that gets things done.” Two actions: Browse marketplace and Start selling.
2. **Credibility row** — actual figures only: active offers, verified sellers, successful purchases. If data is sparse, omit numbers rather than invent them.
3. **Popular categories** — Design, Templates, Code, Bots & Automations, AI tools, Education, Music & Audio, Services.
4. **Featured this week** — four real listings, staff-selected only when selection policy exists.
5. **How it works** — Buy: discover -> checkout -> access. Sell: set up -> publish -> get paid.
6. **Creator spotlight** — one real creator with real listing and reviews.
7. **Trust/support block** — Stripe checkout, verified-purchase reviews, clear delivery and dispute paths.
8. **Footer** — full legal and support links.

### Marketplace

```text
Breadcrumb
Title + result count + sort
Mobile filter trigger / Desktop left filter rail
  - Category, price, offer type, verified creator, rating,
    file type, compatibility, delivery, updates
Listing grid
  - image/preview
  - category + verified seller state
  - title + concise value statement
  - price, rating/count, saves
  - delivery information
Empty state with clear reset filters action
```

Do not show sponsored listings until they are labeled, ranked by a disclosed rule, reviewable by admins, and limited so organic discovery remains useful.

### Listing detail

- Gallery/preview first.
- Title, creator chip, verified-purchase rating, price, availability.
- “What you receive,” file format, compatibility, license, updates, delivery, and support response expectation.
- Add to cart + Buy now, with terms acceptance at the point of purchase.
- Related offers from the same category and “more from this creator.”
- Verified-purchase reviews and seller responses.
- Report listing action, not just a generic contact link.

### Seller dashboard

Show one onboarding checklist above analytics until completed:

```text
Create profile -> Connect Stripe -> Add listing -> Add preview -> Publish -> Share link
```

After that, show:
- Gross sales, net earned, conversion, views, saves, refunds, response time.
- Chart with a date selector.
- Listing health checklist: image, clear title, delivery, support, price, tags.
- A single recommended next action, calculated from real data.

---

## 5. Feature plan

| Stage | Ship | Do not claim yet |
|---|---|---|
| Foundation | Design system, responsive navigation, reusable UI, full homepage/marketplace/listing redesign, analytics events | “Professional marketplace” based on design alone |
| Conversion | Search/filter/sort, reviews, wishlists, bundles, coupons, recently viewed, abandoned cart emails only after consent | Personalised ads without consent |
| Creator growth | Public profiles, onboarding, analytics, follow notifications, referral attribution | Earnings projections |
| Support & safety | Order chat, dispute workflow, report abuse, moderator queue, verified seller levels | Guaranteed refunds/escrow |
| Advanced | Recommendations, AI listing assistant, price guidance, editorial content | AI fraud “detection” as a sole decision maker |

### Existing-schema mapping

Already present in the database:
- Follows, saved listings, reviews/replies, purchase messages, coupons, bundles, referrals, price alerts, notifications, view events, disputes, verification requests, fraud signals, Stripe accounts.
- Complete these first with UI, authorization checks, indexes, event logging, and empty states.

Add only when the product needs them:
- `listing_questions`: public Q&A, moderation state.
- `listing_sponsorships`: listing, campaign window, spend/bid, state, label.
- `recently_viewed`: user/session hash, listing, viewedAt.
- `cart_recovery`: cart key, email consent snapshot, sentAt, conversion transaction.
- `seller_metrics_daily`: seller/listing/date aggregation; do not calculate large dashboard queries on every request.
- `moderation_cases`: target entity, reason, status, assignee, decision notes.
- `recommendation_events`: anonymous/consented signals only.

Example migration pattern:

```sql
CREATE TABLE listing_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  answer text NOT NULL DEFAULT '',
  answered_at timestamptz,
  status text NOT NULL DEFAULT 'visible',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX listing_questions_listing_idx
  ON listing_questions(listing_id, created_at DESC);
```

---

## 6. Trust, safety, payments, and legal

### What Vennet can safely ship now

- Verified-purchase-only reviews.
- Report listing/profile/review controls.
- Order-scoped buyer/seller messages, with rate limits and moderation.
- Clear digital-goods refund and dispute policy.
- A human moderator queue using existing dispute and fraud-signal data.
- Optional identity verification only through an established provider; retain only the minimum status/metadata required.

### What requires decisions outside code

- **Escrow:** this changes how funds are held and may create regulatory responsibilities. Do not ship or advertise it without legal and payments-provider approval.
- **KYC:** let Stripe or an identity provider collect documents. Vennet must not store raw IDs unless there is a documented legal reason, retention period, access control, and incident plan.
- **Fraud:** start with rules that flag events for review (self-purchase attempt, rapid purchases/listings, repeated dispute losses). Do not automatically ban users or deny payments purely from an AI score.
- **Guarantees:** write policies after deciding the real support process, timelines, exclusions, and operator.

---

## 7. AI that helps rather than makes false promises

| Feature | Input | Output | Guardrail |
|---|---|---|---|
| Listing helper | seller title, category, notes | title, description, tags | seller reviews before publishing |
| Listing health | listing completeness + events | missing-field tips | no invented performance claims |
| Price guidance | comparable Vennet listings | range and explanation | label as guidance, not valuation |
| Discovery | category, saves, legitimate clicks | related listings | no sensitive profile inference |
| Fraud triage | auditable rules + evidence | moderator priority | human decision required |
| Seller assistant | dashboard facts | next action | cite the user’s real metric in its copy |

AI endpoints must authenticate first, rate-limit per user, log prompt class not private content where possible, validate all output, and never expose API keys to the browser.

---

## 8. SEO and content architecture

Make public indexable routes only for active, safe content:

```text
/marketplace
/collections/[slug]
/creators/[handle]
/offers/[slug]-[id]
/learn/[slug]
/sitemap.xml
/robots.txt
```

Use server-rendered metadata per listing:
- title: `{listing title} by {creator} | Vennet`
- description: real concise listing summary
- canonical URL
- Open Graph image from listing image
- JSON-LD Product/Offer only with real price, availability, seller, and verified review totals

Google states that Product structured data can make price, availability, ratings, and shipping information eligible for richer results, but it does not guarantee display. See the [official Product structured-data guide](https://developers.google.com/search/docs/appearance/structured-data/product).

Do not create thin pages for every tag or empty creator profile. Editorial pages should be genuinely useful: “Best Discord bots for community moderation,” “Creator spotlight,” or “How to evaluate an automation tool.”

---

## 9. API design and authorization

Use server actions for forms that remain internal and route handlers for integrations/webhooks/public APIs.

```text
GET    /api/marketplace                 public filtered search
GET    /api/listings/:id                public active listing
POST   /api/listings/:id/save           authenticated buyer
POST   /api/listings/:id/questions      authenticated, rate limited
POST   /api/orders/:id/messages         buyer or seller only
POST   /api/disputes                    buyer of that transaction only
POST   /api/stripe/webhook              Stripe signature verified
POST   /api/admin/moderation/:id        admin role only
```

Every mutation must:
1. Read session server-side.
2. Validate input with Zod.
3. Confirm ownership/role in the database.
4. Use a transaction when creating coupled records.
5. Return a generic safe error message.
6. Log a minimal audit event for security-sensitive changes.

---

## 10. Technical quality

- Upgrade Next.js only as a focused compatibility project; do not mix it into UI work.
- Add error boundaries, loading states, and empty states.
- Use Next Image for listing/media previews and define remote image rules.
- Lazy-load below-the-fold gallery/video and avoid large client bundles.
- Run build, lint, typecheck, and accessibility checks before every production deploy.
- Add Playwright smoke tests: sign in, browse, filter, add cart, checkout test mode, create draft listing, publish, dispute.
- Remove any committed secret files from Git history and rotate every exposed key before public marketing. Never keep a real `.env` in the repository.
- Add a custom domain only after its DNS and Vercel configuration are complete; set the canonical metadata URL to it.

---

## 11. First release order

### Sprint 1 — visible quality
1. Design tokens + UI primitives.
2. Navbar/drawer and footer cleanup.
3. Homepage, marketplace, listing card/detail redesign.
4. Mobile and accessibility pass.
5. Real empty/loading/error states.

### Sprint 2 — conversion
1. Search/filter/sort and listings discovery.
2. Saved, recently viewed, price alerts.
3. Cart and purchase clarity.
4. Reviews and seller responses.
5. Public creator/listing pages + metadata.

### Sprint 3 — seller quality
1. Onboarding checklist.
2. Listing quality checks.
3. Seller analytics aggregation.
4. Coupons/bundles/referrals.
5. Follow and release notifications.

### Sprint 4 — operations
1. Order messages and disputes.
2. Reports/moderation.
3. Verification workflow.
4. Fraud triage rules and admin screens.
5. Policy review and support playbooks.

## Definition of done

A feature is done only when it has: responsive UI, permission checks, validation, empty/loading/error state, event/audit logging where appropriate, database migration, tests, accessibility review, and copy that does not promise more than Vennet can deliver.
