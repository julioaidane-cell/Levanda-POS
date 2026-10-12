# Levanda POS — Mobile Client

React Native (Expo) client for the Levanda POS API: authentication, shop
management, and shop-scoped product inventory, plus the static Expenses,
Suppliers and Customers modules.

---

## Tech stack

| Concern      | Choice                                            |
| ------------ | ------------------------------------------------- |
| Framework    | Expo SDK 57, React Native 0.86                    |
| Language     | TypeScript 6, `strict` + `noUncheckedIndexedAccess` |
| Navigation   | Expo Router (file-based, typed routes)            |
| Server state | Axios client with interceptors + Zustand stores   |
| Forms        | React Hook Form + Zod                             |
| Storage      | `expo-secure-store` (token), AsyncStorage (rest)  |
| Notifications | `expo-notifications` (permission-gated, mock feed) |

Native modules used (`expo-secure-store`, `expo-build-properties`) mean Expo Go
is **not** sufficient — see [Running the app](#running-the-app).

---

## Setup

```bash
npm install
cp .env.example .env      # then set EXPO_PUBLIC_API_BASE_URL
npm start
```

If `npm install` reports an `ERESOLVE` peer conflict, it comes from the optional
web-only `react-dom`/`@expo/metro-runtime` peer range. The app itself has no web
runtime requirement, so install with:

```bash
npm install --legacy-peer-deps
```

The same applies to `npx expo install <package>` for new native packages (e.g.
`expo-notifications` was added with
`npx expo install expo-notifications --legacy-peer-deps`), because it shells out
to npm under the hood.

### Environment variables

| Variable                   | Required | Description                                                     |
| -------------------------- | -------- | --------------------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL` | yes      | API root. The client appends `/api`, so omit that suffix here.   |

Values prefixed with `EXPO_PUBLIC_` are inlined into the JS bundle at build
time — never put a secret in `.env`. `.env` is git-ignored; `.env.example` is
committed.

The dev server refuses to start without the variable
(`src/api/config.ts` throws with an actionable message), so a misconfigured
build fails loudly instead of silently requesting `undefined/api`.

---

## Running the app

```bash
npx expo start              # dev server
npx expo run:android        # local Android build (native modules required)
npx expo run:ios            # local iOS build (macOS only)
eas build --profile development   # cloud development build
```

`expo-secure-store` and `expo-build-properties` are native modules, so Expo Go
will not work. Use a development build.

### Cleartext HTTP

The reference API is served over plain HTTP, so the following is configured in
`app.json`:

- Android: `expo-build-properties` → `android.usesCleartextTraffic: true`
- iOS: `NSAppTransportSecurity.NSExceptionDomains` for the API host

Move to HTTPS for production and both can be removed.

### Checks

```bash
npm run typecheck    # tsc --noEmit
npx expo-doctor      # dependency / config health
```

There is no ESLint configuration in this project, so `npm run lint` is not a
meaningful gate yet; `npm run typecheck` (with `noUnusedLocals` and
`noUnusedParameters` enabled) is the enforced check.

---

## Project structure

```
src/
├─ app/                     # routes only — every file here is a screen
│  ├─ _layout.tsx           # session bootstrap + auth gate
│  ├─ (auth)/               # login, register
│  ├─ (app)/                # authenticated stack
│  │  ├─ _layout.tsx        # auth guard + shop/currency bootstrap
│  │  ├─ (tabs)/            # tab screens + hidden section routes
│  │  │  ├─ _layout.tsx     # bottom tabs (home, products, shops, expenses, more)
│  │  │  ├─ sell/orders/sales-reports.tsx  # hidden section placeholders
│  │  │  └─ customers/suppliers.tsx        # static modules, hidden section routes
│  │  ├─ shops/             # create, [id]/edit
│  │  ├─ products/          # create, [id]
│  │  └─ notifications.tsx  # in-app notification feed (modal)
├─ api/                     # one module per resource + client, types, errors
├─ components/              # reusable UI (the only place styles are defined)
├─ data/mock/               # sample data for modules with no backend
├─ hooks/                   # useAsyncResource, useLocationChain, useToggleNotifications
├─ navigation/              # section-tab definitions shared by the header
├─ store/                   # Zustand: auth, shop, company, notifications
├─ theme/                   # colours, spacing, radius, typography tokens
├─ types/                   # types for mock-backed modules
└─ utils/                   # formatters, storage, currency, form errors, notifications
```

Navigation and non-route code are deliberately separated: `src/app` holds
screens only, so `expo-router` owns routing while `src/components`,
`src/hooks` and `src/store` stay framework-agnostic.

---

## Architecture notes

### API client

`src/api/client.ts` wraps a single Axios instance:

- attaches the bearer token from the in-memory cache on every request;
- normalises every failure into `ApiError` with a `kind`
  (`network` / `timeout` / `validation` / `unauthorized` / `server`), so screens
  can render an appropriate error state instead of string-matching messages;
- unwraps the API's envelope so callers receive the payload directly;
- returns an `ApiError` with `isValidation` set for `422`, which
  `applyServerErrors` maps onto form fields.

A `401` from any request triggers a single logout path that clears the token,
the cached user, the persisted company and the active-shop selection, then
redirects to login. Login itself is expected to fail with `401`, which is why
logout is safe to call before signing in.

### State

Three Zustand stores, split by lifetime:

- `authStore` — token and user, persisted to SecureStore / AsyncStorage.
- `shopStore` — the shop list and the active shop, persisted to AsyncStorage.
  Product requests are always scoped to the active shop.
- `companyStore` — the company record, which carries `currency_id` and
  `has_product_categories`.

Shops and currency are loaded once in `(app)/_layout.tsx` after
authentication rather than per screen, so no screen has to guess whether the
list has arrived.

### Active shop selection

Registration returns both the shop just created *and* pre-existing shops, so the
created shop cannot be identified positionally — its `created_at` is the newest,
which is what `pickNewestAssignedShop` uses.

At that moment the shop list is still empty, so `adoptShop` records the id as
`pendingActiveShopId`; the first `refresh` reconciles it. The active shop always
resolves against the current list, so a deleted shop falls back to another one
rather than leaving product requests pointing at nothing.

### Currency

`formatCurrency` prefixes the company's currency code, resolved from
`/currencies` matched against `company.currency_id` and cached in
`src/utils/currency.ts`. When the code is unknown, amounts are rendered as plain
numbers — the currency is never assumed or hardcoded.

### Categories

Product categories are a per-company feature (`company.has_product_categories`).
When the flag is off the request is skipped entirely; if the backend answers
`403` anyway, the create form drops the category field instead of failing.
Products are always creatable without a category.

### Navigation and section tabs

The main screens share one sticky header, `ScreenHeader`, which stacks the
`AppHeader` (shop switcher, notification bell, account avatar) above a
horizontally scrolling `SectionTabs` pill row. `src/navigation/sections.ts` is
the single source of truth for the pills; `SectionTabs` derives the active pill
from the current route (so `/products/123` still highlights **Products**) and
`router.replace`s between sections.

Sections that are not bottom-bar destinations (**Sell**, **Orders**, **Sales
Reports**, **Customers**, **Suppliers**) live inside `(app)/(tabs)/` with
`href: null`, so they keep the bottom bar and shared header while staying out of
the tab bar itself. Each screen that owns a primary action renders its own
`FAB`; `ScreenScroll withFAB` reserves space so content never hides behind it.

### Notifications

`useNotificationsStore` (Zustand) holds the enabled flag, the feed and the
unread count. The enabled flag persists to AsyncStorage; the feed is seeded from
`src/data/mock/notifications.ts` until a backend endpoint exists.

The bell in `AppHeader` shows a dot whenever the feature is on and there are
unread items, and deep-links to `/notifications`. `NotificationToggle` (used on
**More** and inside the notifications screen) is the only place that turns the
feature on: it haptics, then calls `ensureNotificationPermission`
(`src/utils/notifications.ts`), which requests OS permission via
`expo-notifications`. Push is unavailable in Expo Go, so the helper degrades to
the in-app feed there; a denial reverts the switch and offers an "Open settings"
toast action.

---

## Verified API behaviour

The following was confirmed against the live API and is worth preserving — each
point contradicts the obvious guess:

| Area            | Behaviour                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| Countries       | Expose `dial_code` (**not** `phonecode`). Tanzania is `{ id: 213, dial_code: "255" }`.                        |
| Register        | Returns `company` and `assigned_shops`; there is **no** `shop` key.                                           |
| Shops update    | `PUT /shops/{id}` → `405`. `PATCH /shops/{id}` works and is what the client sends.                              |
| Products        | Flat `/api/products` → `404`. Products are shop-scoped: `/api/shops/{shopId}/products`.                        |
| Product create  | Requires `name`, `buying_price`, `retail_price`, `quantity`. Optional: `barcode`, `wholesale_price`, category, `min_stock_level`, `expire_date`. |
| Product fields  | List uses `name`; detail uses `product_name`. Detail `shop_id` incorrectly contains the product id.             |
| Categories      | `GET /api/products/categories` → `403` when the company feature is disabled.                                     |

Numeric location ids are never hardcoded: every dropdown value is selected by
the user, and the country supplies the phone dialling code.

---

## Known gaps

- **Expenses, Suppliers, Customers** have no documented endpoints. They are
  backed by sample data in `src/data/mock/` and each screen says so. No
  add/edit is offered for them because there is nothing to persist to.
- **Product add-data** (the "extra data" tab of the reference app) has no
  discoverable endpoint; it is intentionally omitted rather than faked.
- **Product editing** is not implemented — the API exposes create, list, show
  and delete for products, and only shop update was in scope.
- **Sales / checkout** is out of scope for this assignment.
- **Notifications** have no backend endpoint yet: the feed is sample data, the
  enabled flag is local, and no remote push token is registered. The permission
  flow is real, so wiring an endpoint later only means replacing
  `src/data/mock/notifications.ts` and the store's `// TODO` fetch.
- **Sell / Orders / Sales Reports** are navigation placeholders only, so the
  section pills mirror the full reference app without faking data.

---

## Design system

Tokens live in `src/theme` and are the single source of colour, spacing, radius,
elevation, motion and typography. Nothing outside `src/theme` hard-codes a
colour or a spacing value.

### Theming

- **Two palettes, one token set.** `lightColors` (the sampled Levanda web
  palette) and `darkColors` share identical keys, so every screen themes at
  runtime. `app.json` sets `userInterfaceStyle: "automatic"`, and
  `ThemeProvider` reads the OS scheme via `useColorScheme`.
- **`makeStyles`** memoises a style sheet per palette and returns a `useStyles()`
  hook. Because the palettes are stable module constants, each sheet is built
  once and reused across light/dark:

  ```ts
  const useStyles = makeStyles((c) => ({ card: { backgroundColor: c.surface } }));
  // inside the component
  const styles = useStyles();
  ```

- `useTheme().colors` is the palette for anything not expressible as a static
  style (icon tints, gradients, inline animated colours). The legacy static
  `colors` export remains only for module-scope constants.
- **Typography** uses Inter (400–800), loaded in the root layout behind the
  native splash so text never flashes the platform font. The `typography`
  variants (`display`/`title`/`heading`/`subheading`/`body`/`label`/`caption`/
  `overline`/`button`) bundle family, size, weight and line height.

### Motion and feedback

- `Touchable` is the single tappable primitive: a springy press-scale plus a
  haptic tap (`src/utils/haptics.ts`), used by every button, row and card.
- All animation honours the OS "Reduce Motion" setting via `useReduceMotion()`.
- `Loader`/`Skeleton`/`SkeletonList`/`SkeletonStats` render shimmering
  placeholders shaped like the real content.
- `ToastProvider` + `useToast()` surface success/error messages after create,
  update and delete actions.

### Component library

Screens compose reusable components from `src/components` rather than
restyling: `Button`, `Touchable`, `Input` (animated focus, password toggle),
`Select` (animated searchable bottom sheet), `SearchBar`, `Card`/`Badge`,
`Avatar`, `Chip`, `Divider`, `ListItem`, `Header` (safe-area aware, detail/form
screens), `ScreenHeader` + `AppHeader` + `SectionTabs` (shared main-screen
header), `NotificationToggle`, `ShopSwitcher`, `FAB`, `Screen`/`ScreenScroll`,
`Section`/`SectionHeader`, `StatTile`, `Loader`/`Skeleton`, `EmptyState`,
`ErrorView`, `ConfirmDialog`, `ShopForm`, `ProductForm`.

Every screen provides loading (skeleton), empty and error-with-retry states;
empty states are only shown once a load has actually succeeded, so they never
flash while a request is in flight.
