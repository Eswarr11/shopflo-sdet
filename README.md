# Automation Suite — SauceDemo + FakeStoreAPI

End-to-end UI automation for [Swag Labs](https://www.saucedemo.com/) and API test suite for [Fake Store API](https://fakestoreapi.com/), built for the SDET assessment (Assignments 1 & 2).

## Quick Start

```bash
npm install
npx playwright install chromium
npm run test:api          # FakeStoreAPI
npm run test:ui           # SauceDemo UI
npm run test:all          # API + UI (full suite)
npm run test:smoke        # @smoke tagged tests
npm run test:regression   # @regression tagged tests (full API + UI suite)
npm run report            # Generate combined Allure + Playwright HTML reports
npm run test:all:report   # Run full suite and generate combined reports
npm run quality           # Typecheck + lint + format check (CI gate)
```

**77 automated tests** total: **47 UI** + **30 API** across 23 spec files.

Auth sessions for UI tests are generated automatically by `global-setup.ts` before the suite runs. Re-run tests anytime — auth files in `.auth/` are refreshed when older than 24 hours.

Set `HEADED=true` in `.env` to run UI tests in headed mode locally (headless by default).

### Quality Gates

```bash
npm run typecheck     # TypeScript strict check
npm run lint          # ESLint
npm run lint:fix      # Auto-fix lint issues
npm run format        # Prettier write
npm run format:check  # Prettier CI check
npm run quality       # All three (used in CI)
```

---

## Assignment 1 — SauceDemo UI Automation

### Test Coverage

**47 automated UI tests** across 17 spec files, grouped by module:

| Module                                      | Spec file(s)                                                                             |  Tests |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- | -----: |
| Login & logout                              | `auth/login.spec.ts`, `auth/logout.spec.ts`                                              |      7 |
| User types                                  | `auth/user-types.spec.ts`                                                                |      4 |
| Inventory — sorting                         | `inventory/sorting.spec.ts`                                                              |      4 |
| Inventory — cart badge                      | `inventory/add-to-cart.spec.ts`                                                          |      5 |
| Product detail                              | `inventory/product-detail.spec.ts`                                                       |      4 |
| Cart                                        | `cart/cart.spec.ts`, `cart/persistence.spec.ts`                                          |      5 |
| Checkout — E2E flows                        | `checkout/e2e.spec.ts`                                                                   |      3 |
| Checkout — alternate / problem / navigation | `alternate-checkout.spec.ts`, `problem-user-checkout.spec.ts`, `cart-navigation.spec.ts` |      3 |
| Checkout — step-one validation              | `checkout/validation.spec.ts`                                                            |      4 |
| Checkout — order summary                    | `checkout/summary.spec.ts`                                                               |      2 |
| Performance glitch                          | `performance-glitch/cart.spec.ts`, `performance-glitch/checkout-step-one.spec.ts`        |      2 |
| Reset app state                             | `reset/reset-app-state.spec.ts`                                                          |      4 |
| **Total**                                   |                                                                                          | **47** |

**Coverage notes (combined scenarios):**

- `checkout/validation.spec.ts` — one `test.describe` (`Verify Mandatory Customer Information Validation`) runs as **4 separate tests** (missing first name, last name, postal code, all fields empty).
- `checkout/e2e.spec.ts` — `Verify Successful End-to-End Checkout for Standard User` clubs the full checkout flow with order-summary price checks (subtotal, per-item prices, total = subtotal + tax). The same pricing rules are also covered in isolation by `checkout/summary.spec.ts`.
- `@smoke` — critical subset: login, add-to-cart, product detail, cart items, E2E checkout, API cart POST.
- `@regression` — full suite: all **47** UI and **30** API tests (**77 total**; tagged at `test.describe` level; smoke tests inherit both tags).

### Framework: Playwright v1.61 + TypeScript

**Why Playwright over Selenium:**

|            | Playwright                                | Selenium                                           |
| ---------- | ----------------------------------------- | -------------------------------------------------- |
| Selectors  | `data-test` attributes (SauceDemo-native) | XPath/CSS prone to flakiness                       |
| Login skip | `storageState` pre-generates sessions     | Must re-login each test or manage cookies manually |
| Waits      | Auto-retry `expect` with actionability    | Explicit `WebDriverWait` required everywhere       |
| Browsers   | Single install command                    | Separate driver management per browser             |
| Reports    | HTML + trace viewer + video built-in      | Third-party integration required                   |

`storageState` is the key win: auth sessions are generated once via `global-setup.ts` and reused across all UI tests, saving ~2s per test.

### Locator Conventions

SauceDemo exposes stable `data-test` attributes. The framework maps them through a string DSL resolved by `PwActions` in [`helpers/pw-actions.ts`](helpers/pw-actions.ts).

**Rules:**

- Store all locators in the page/component `SEL` object — tests never contain selector strings.
- **Default:** `'getByTestId("...")'` strings (e.g. `'getByTestId("login-button")'`).
- **Scoped rows:** Use `.inventory_item` / `.cart_item` with `page.locator(class, { hasText })` when targeting a product row — the container has no `data-test` attribute.
- **Dynamic buttons:** Use `[data-test^="add-to-cart"]` / `[data-test^="remove"]` for per-product button ids (e.g. `add-to-cart-sauce-labs-backpack`).
- **ID fallback:** Use `#react-burger-menu-btn` / `#react-burger-cross-btn` only where SauceDemo provides no `data-test` (burger menu open/close).
- **All interactions via PwActions** — never call Playwright native `.click()`, `.fill()`, etc. in page objects or tests. `PwActions` accepts `string | Locator` for scoped row helpers.

```typescript
// login.page.ts — preferred pattern
private readonly SEL = {
  loginButton: 'getByTestId("login-button")',
};

// inventory.page.ts — scoped row when container has no data-test
const item = this.page.locator('.inventory_item', { hasText: productName });
await this.actions.click(item.locator('button'), `Add to cart — ${productName}`);
```

### Extension Plan

**Parallelisation:** `fullyParallel: true` with **5 shards × 2 workers** on PR CI. Local sharding: `CURRENT_SHARD=2 TOTAL_SHARDS=5 WORKERS=2 npm run test:regression`.

**Cross-browser:** [`playwright.config.ts`](playwright.config.ts) currently runs UI tests on **Desktop Chrome** only. Firefox and Edge projects (`devices['Desktop Firefox']`, `devices['Desktop Edge']`) are a natural next step but were held off to keep CI runtime manageable — adding them would triple UI browser matrix cost unless scoped to a nightly or smoke-only job.

**Reporting:** API and UI runs write to shared `reports/allure-results` and `reports/blob`. Run `npm run report` to produce one combined Allure report (`reports/allure-report`) and one Playwright HTML report (`reports/playwright-report`) covering both suites. Allure steps (`allure.step()`) are used in UI tests for business-readable reporting.

```bash
# Separate runs, single combined report
npm run test:api && npm run test:ui && npm run report

# Or run everything and report in one step
npm run test:all:report

npx allure open reports/allure-report
npx playwright show-report reports/playwright-report
```

---

## Assignment 2 — FakeStoreAPI Cart CRUD

### Test Coverage

**30 automated API tests** across 6 spec files:

| Spec file                  |  Tests | Coverage                                                     |
| -------------------------- | -----: | ------------------------------------------------------------ |
| `cart-crud.spec.ts`        |     14 | CRUD, simulated negatives, auth, schema field checks         |
| `get.spec.ts`              |      4 | GET list, by id, products array, non-existent id             |
| `cart-data-driven.spec.ts` |      5 | POST cart over 5 product IDs                                 |
| `cart-contract.spec.ts`    |      2 | Single-cart snapshot + collection contract                   |
| `post-validation.spec.ts`  |      3 | Invalid productId, negative quantity, missing products field |
| `security.spec.ts`         |      2 | Missing / invalid Bearer token                               |
| **Total**                  | **30** |                                                              |

`cart-data-driven.spec.ts` defines one `test()` inside a loop over 5 product IDs — Playwright lists **5 runtime tests** from that single spec file.

### Framework: Playwright Test + Axios + Zod

**Why this stack:**

- **Playwright Test as runner** — unified Playwright HTML and Allure reports with the UI suite; single CI step for both
- **Axios** — interceptors attach JWT per-test via `withAuthToken()`; `baseURL` config means zero hardcoded URLs in test files
- **Zod** — TypeScript-style runtime schema validation with human-readable error messages; schemas export `z.infer<>` types used by data builders

### Extension Plan

**Parallelisation:** FakeStoreAPI mutations are simulated (no real DB writes), so all tests are effectively stateless. PR CI uses 5 shards × 2 workers.

**Reporting:** Contract snapshots are committed JSON files — shape drift shows as a `git diff` in PRs. Allure tracks test history across runs.

---

## Project Structure

```
├── api/
│   ├── services/          # Axios wrappers for cart CRUD + auth token setup
│   ├── schemas/           # Cart Zod schema + z.infer types
│   └── tests/carts/
│       ├── cart-crud.spec.ts
│       ├── get.spec.ts
│       ├── cart-data-driven.spec.ts
│       ├── cart-contract.spec.ts
│       ├── post-validation.spec.ts
│       └── security.spec.ts
├── ui/
│   ├── pages/             # Page Object Model (one class per page) + POManager
│   ├── components/        # Header badge, burger menu (extend BasePage)
│   ├── helpers/           # Shared checkout/cart flow helpers (flow.helper.ts)
│   └── tests/
│       ├── auth/          # Login, logout, user-type behaviors
│       ├── inventory/     # Sort, add-to-cart, product detail
│       ├── cart/          # Cart ops + persistence
│       ├── checkout/      # E2E, validation, summary, alternate, problem-user, cart-navigation
│       ├── reset/         # Reset app state from inventory, cart, checkout
│       └── performance-glitch/  # Delayed cart and checkout step-one loads
├── helpers/               # API client, PwActions, Faker builders, API assertions
├── config/                # Constants: UI users, products, auth files, messages, API credentials
├── fixtures/              # UI fixture (poManager) + API fixture (withAuthToken)
├── scripts/               # Allure report generation + Playwright blob merge
├── global-setup.ts        # Pre-generates .auth/ storageState for all user types
└── global-teardown.ts
```

### UI tests — POManager pattern

All UI tests initialize page objects through `POManager` via the custom fixture:

```typescript
import { test, expect } from '../../../fixtures/ui.fixture';

test('example', async ({ poManager }) => {
  const inventory = poManager.getInventoryPage();
  await inventory.goto();
});
```

## CI

| Job             | Trigger                        | Environment               | Purpose                          |
| --------------- | ------------------------------ | ------------------------- | -------------------------------- |
| `quality-gates` | Push + PR to `main` / `master` | Node 24                   | Typecheck, ESLint, Prettier      |
| `setup-auth`    | Push + PR to `main` / `master` | Playwright Docker v1.61.1 | Pre-generate UI auth sessions    |
| `api-tests`     | After `quality-gates`          | Node 24                   | API suite — 5 shards × 2 workers |
| `ui-tests`      | After `quality-gates` + auth   | Playwright Docker v1.61.1 | UI suite — 5 shards × 2 workers  |
| `merge-reports` | After API + UI shards          | Node 24 + Java 17         | Combined Allure + HTML artifact  |

Workflow file: [`ci.yml`](.github/workflows/ci.yml)

CI runs `quality-gates` and `setup-auth` in parallel, then API and UI each execute as a **5-shard matrix** once quality checks pass. A single `merge-reports` job combines all shard blobs and Allure results into one Playwright HTML + Allure artifact (`combined-reports-*`).

### Runner setup

| Job                          | Environment                                  | Why                                                   |
| ---------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| `quality-gates`              | `ubuntu-latest` + Node 24                    | Fast static checks before test shards                 |
| `setup-auth`, `ui-tests`     | `mcr.microsoft.com/playwright:v1.61.1-noble` | Browsers pre-installed — no `playwright install` step |
| `api-tests`, `merge-reports` | `ubuntu-latest` + Node 24                    | API tests need no browser; merge job needs npm + Java |

Pin `PLAYWRIGHT_IMAGE` in `ci.yml` to match `@playwright/test` in `package.json`. Container jobs set `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true` because the Playwright image bundles Node 20 while GitHub runners default to Node 24.

### CI artifacts

Download `combined-reports-<run_number>` from the **Merge API and UI reports** job. The zip contains pre-built `allure-report/` and `playwright-report/` folders.

```bash
# After unzipping the artifact locally
npx allure open /path/to/allure-report
npx playwright show-report /path/to/playwright-report
```

### Sharding (local)

```bash
# Run shard 2 of 5 with 2 workers (env-driven)
CURRENT_SHARD=2 TOTAL_SHARDS=5 WORKERS=2 npm run test:regression

# Or CLI shard flag
WORKERS=2 npx playwright test --project=api --project=ui --shard=2/5
```

Optional env vars (see [`.env.example`](.env.example)): `WORKERS`, `CURRENT_SHARD`, `TOTAL_SHARDS`.

Combined Playwright HTML and Allure reports are uploaded as a single `combined-reports-*` build artifact on every run (pass or fail).
