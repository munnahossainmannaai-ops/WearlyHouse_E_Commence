# Wearly House — Wear the Near Future

A futuristic commerce platform: dark-ops glassmorphism UI, live admin mission control, and a
persisted data layer that mirrors the exact Mongo schema it was designed against.

Built with **React 18 + Vite + Tailwind CSS v4 + Zustand + Framer Motion**, routed via
`react-router-dom` (HashRouter for static hosting).

---

## Demo accounts

| Role     | Email              | Password     |
| -------- | ------------------ | ------------ |
| Admin    | `admin@wearly.house` | `wearly-admin` |
| Customer | `demo@wearly.house`  | `demo-pass-1`  |

Both have **one-tap login buttons** on the sign-in page. Google OAuth is simulated (creates/joins
`traveler@gmail.com`).

Seed promo codes: `NEON10` (−10%), `WEARLY25` (−25%). Deploy your own from **Admin → Settings**.

---

## Feature map

### Storefront
- **Landing** — scramble-decode headline, parallax + mouse-tilt product showcase, marquee strip,
  asymmetric bento collections, trending carousel, scattered-postcard testimonials, CTA band
- **Catalog** (`/shop`) — grid/list toggle, category filters with live counts, dual-thumb price
  slider, 5 sort modes, in-page instant search + navbar search with thumbnail suggestions
- **Product** (`/product/:slug`) — hover-lens zoom gallery (3 view presets), color variants, live
  stock meter, sell-out countdown chip, spec accordion, review histogram + authenticated review
  submission, related units, **"notify me" restock waitlist** on sold-out units
- **Cart** (`/cart`) + slide-in drawer — quantity steppers, promo codes, free-freight progress bar
  driven by the admin-configurable threshold
- **Wishlist** (`/wishlist`) — pinned units, bulk load-to-cart
- **Checkout** (`/checkout`) — 3-step flow (address → shipping lane → Stripe-style card form with
  input masking), promo redemption tracking, order confirmation with flight-plan timeline
- **Order tracking** (`/track`) — guest lookup by order ID + email, animated status pipeline
- **Account** (`/account`) — order history with expandable tracking timelines, reorder button,
  profile + password management, address CRUD

### Admin — Mission Control (`/admin`)
- **Overview** — KPI band with sparklines, revenue chart (7D/30D/90D, hover crosshair),
  order-flow donut, top movers leaderboard, live activity feed, and a **Signal Intelligence** row:
  most-viewed units with view→order conversion, promo performance bars, 30-day sell-out forecast
- **Inventory** — summary chips, alert-threshold slider (persisted), stock meters, ±1 / +25 restock
- **Products** — full CRUD modal (image picker, tags, featured flag), live search, inline stock
- **Orders** — status filters, expandable rows (manifest, drop point, payment, status stepper,
  cancel-and-refund, event timeline), CSV export
- **Users** — lifetime value, suspend/reinstate switches (audited)
- **Settings** — house rules (free-freight + low-stock thresholds), promo deploy/toggle/revoke,
  bulk promo CSV import/export, **restock waitlist fulfillment**, and the **system audit log**

### Platform
- **Two protocols (themes)** — `VOID` (dark ops, default) and `CLEANROOM` (daylight lab),
  switchable from the navbar, mobile drawer, or ⌘K palette; persisted, pre-hydration applied,
  animated crossfade
- **⌘K Command Console** — fuzzy product search, sector navigation, quick-add, theme switching
- Route transitions, scroll-progress beam, cursor ambient glow, toasts, scroll reveals —
  all honoring `prefers-reduced-motion`

---

## Architecture

```
src/
├─ lib/
│  ├─ types.ts          # data model (mirrors the Mongo collections below)
│  └─ utils.ts          # currency/date helpers, order flow, seeded series, status meta
├─ data/
│  └─ catalog.ts        # 10 seeded products, categories, reviews, testimonials, shipping lanes
├─ store/
│  └─ store.ts          # Zustand store + persistence ("commerce rules engine")
├─ components/
│  ├─ icons.tsx         # ~35 hand-drawn inline SVG icons
│  ├─ ui.tsx            # Reveal, Stars, Counter, useScramble, NeonButton, Modal, ToastHost…
│  ├─ Navbar.tsx        # live search w/ suggestions, counters, theme switch, mobile drawer
│  ├─ Footer.tsx        # newsletter, payment chips, system status, track-a-drop link
│  ├─ CartDrawer.tsx    # slide-in cart with free-freight progress
│  ├─ ProductCard.tsx   # grid + list variants, quick-add, wishlist heart
│  ├─ ThemeSwitch.tsx   # VOID ⇄ CLEANROOM segmented control
│  └─ CommandPalette.tsx# ⌘K console
├─ pages/               # Home, Catalog, Product, Cart, Checkout, Auth, Account,
│                       # Wishlist, Track, Admin (+ 404 in App)
└─ App.tsx              # router, ambient background layers, route transitions
```

### Why a client-side "backend"?
This environment serves a static Vite build — no Node runtime, no database server. The original
spec (Next.js API Routes + MongoDB + NextAuth + Stripe) is therefore **simulated by a single
persisted Zustand store** (`localStorage` key `wearly-house-v1`) whose shape matches the intended
Mongoose collections one-to-one, so porting is a mechanical mapping (see [Porting](#porting-to-the-production-stack)).

---

## Data model

```ts
User       { id, name, email, passHash, role: "customer"|"admin", addresses[], createdAt, active }
Address    { id, label, fullName, line1, line2?, city, region, zip, country }
Product    { id, slug, name, tagline, category, price, compareAt?, stock, rating, ratingCount,
             colors[{name,hex}], image, tags[], featured?, description, specs[{label,value}], createdAt }
Order      { id, userId, userEmail, items[{productId,name,image,color,qty,price}], address,
             shippingMethod, shippingCost, discount, subtotal, total, last4,
             status: "processing"|"shipped"|"delivered"|"cancelled",
             timeline[{status,at,note}], createdAt }
Review     { id, productId, userName, rating, title, body, date }
Promo      { code, pct, active, redemptions }
RestockRequest { id, productId, email, at }
AuditEntry { id, at, actor, action, detail }
// plus: cart[], wishlist[], recentlyViewed[], views{productId→count},
//       freeShipThreshold, lowStockThreshold, auditLog[]
```

Order lifecycle: `placed → processing → shipped → delivered` (or `cancelled`), every transition
appending a timestamped timeline entry that powers both customer tracking and the admin feed.

## Commerce rules engine

Everything admin-configurable lives in the store and re-skins the storefront **live**:

- `freeShipThreshold` — cart freight note, checkout shipping rows, product trust strip
- `lowStockThreshold` — inventory flagging, header alert chip, tab badge
- `promos[]` — validated at deploy (3–12 alphanumeric, 1–90%, unique); redemption counter
  increments on every successful apply in cart or checkout
- `restockRequests[]` — shopper "notify me" emails; fulfilled by +25 restock in Settings
- `auditLog[]` — every rule change, product deploy/update/delete, order status flip, and user
  suspension is recorded with actor + timestamp (last 80 entries)

---

## Theme engine

Colors are CSS variables; Tailwind tokens point at them via `@theme inline`:

```css
:root                 { --void:#07070d; --neon:#2de2ff; … }  /* VOID */
[data-theme=cleanroom]{ --void:#edf0f6; --neon:#0890b4; … }  /* CLEANROOM */
@theme inline { --color-void: var(--void); --color-neon: var(--neon); … }
```

Because `white` is remapped per protocol, headings, hairlines and overlays re-skin without a
single component edit. `index.html` applies the saved protocol **before hydration** (no flash);
toggling adds a 520ms color-only crossfade. **Adding a third theme = one new `[data-theme]` block
+ one option in `ThemeSwitch.tsx`.**

---

## Porting to the production stack

| Simulated here            | Production target                                     |
| ------------------------- | ----------------------------------------------------- |
| `store.ts` actions        | Next.js Route Handlers (`/api/*`)                      |
| `localStorage` persist    | MongoDB via Mongoose — the `lib/types.ts` interfaces are the schemas |
| `hashPass` (djb2, demo)   | bcrypt/argon2 hashing                                  |
| `login/signup/quickLogin` | NextAuth.js (credentials + Google provider)            |
| Simulated card form       | Stripe PaymentIntents (`last4` from `payment_method`)  |
| `views` / `auditLog`      | Analytics collection + server-side audit middleware    |

---

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build → dist/
```

Accessibility: semantic landmarks, aria labels on icon-only controls, focus-visible states,
`prefers-reduced-motion` support. SEO: per-route titles would come from the router in production;
semantic HTML and lazy-loaded images are in place.
