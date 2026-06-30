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
npm run test:regression   # API + UI regression
npm run report            # Generate combined Allure + Playwright HTML reports
npm run test:all:report   # Run full suite and generate combined reports
```

Auth sessions for UI tests are generated automatically by `global-setup.ts` before the suite runs. Re-run tests anytime — auth files in `.auth/` are refreshed when older than 24 hours.

Set `HEADED=true` in `.env` to run UI tests in headed mode locally (headless by default).

---

## Assignment 1 — SauceDemo UI Automation

### Test Coverage

| Module | Positive | Negative | E2E |
|---|---|---|---|
| Login | 1 | 5 | — |
| Inventory (sort, add/remove) | 6 | 1 | — |
| Product Detail | 3 | — | — |
| Cart | 4 | — | — |
| Checkout | 4 | 4 | 1 |
| **Total** | **18** | **10** | **1** |

### Framework: Playwright v1.61 + TypeScript

**Why Playwright over Selenium:**

| | Playwright | Selenium |
|---|---|---|
| Selectors | `data-test` attributes (SauceDemo-native) | XPath/CSS prone to flakiness |
| Login skip | `storageState` pre-generates sessions | Must re-login each test or manage cookies manually |
| Waits | Auto-retry `expect` with actionability | Explicit `WebDriverWait` required everywhere |
| Browsers | Single install command | Separate driver management per browser |
| Reports | HTML + trace viewer + video built-in | Third-party integration required |

`storageState` is the key win: auth sessions are generated once via `global-setup.ts` and reused across all UI tests, saving ~2s per test.

### Locator Conventions

SauceDemo exposes stable `data-test` attributes. The framework maps them through Playwright's `getByTestId` via a string DSL resolved by `PwActions` in [`helpers/pw-actions.ts`](helpers/pw-actions.ts).

**Rules:**

- Store all locators in the page/component `SEL` object — tests never contain selector strings.
- **Default:** `'getByTestId("...")'` strings (e.g. `'getByTestId("login-button")'`).
- **Scoped rows:** Use `.inventory_item` / `.cart_item` with `page.locator(class, { hasText })` when targeting a product row — the container has no `data-test` attribute.
- **Dynamic buttons:** Use `[data-test^="add-to-cart"]` / `[data-test^="remove"]` for per-product button ids (e.g. `add-to-cart-sauce-labs-backpack`).
- **ID fallback:** Use `#react-burger-menu-btn` / `#react-burger-cross-btn` only where SauceDemo provides no `data-test` (burger menu open/close).
- **All interactions via PwActions** — never call Playwright native `.click()`, `.fill()`, etc. in page objects or tests.

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

| Category | File | Count |
|---|---|---|
| Positive CRUD | `cart-crud.spec.ts`, `get.spec.ts` | POST, GET, PUT, PATCH, DELETE |
| Negative cases | `cart-crud.spec.ts`, `get.spec.ts` | Missing/non-existent cart and empty PATCH scenarios |
| Authentication | `cart-crud.spec.ts` | Authenticated cart request |
| Response schema validation | `cart-crud.spec.ts`, `get.spec.ts` | Zod validation + field checks |
| Data-driven test | `cart-data-driven.spec.ts` | Same POST cart scenario over 5 product IDs |
| Contract / snapshot | `cart-contract.spec.ts` | One cart response shape contract |

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
│   └── tests/
│       └── carts/         # Cart CRUD, auth, schema, data-driven, contract
├── ui/
│   ├── pages/             # Page Object Model (one class per page) + POManager
│   ├── components/        # Header badge, burger menu (extend BasePage)
│   ├── helpers/           # Shared checkout/cart flow helpers
│   └── tests/
│       ├── auth/          # Login positive/negative + user-type behaviors
│       ├── inventory/     # Sort, add-to-cart, product detail
│       ├── cart/          # Cart ops + persistence
│       └── checkout/      # E2E, form validation, price accuracy
├── helpers/               # API client, PwActions, Faker builders, API assertions
├── config/                # Constants: UI users, products, auth files, messages, API credentials
├── fixtures/              # UI fixture (poManager) + API fixture (withAuthToken)
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

| Workflow | Trigger | Container | Shards | Workers |
|---|---|---|---|---|
| [`ci.yml`](.github/workflows/ci.yml) | Push + PR to `main` / `master` | UI: Playwright Docker, API: Node 24 | 5 | 2 |

CI runs `setup-auth` once, then API and UI each execute as a **5-shard matrix**. A single `merge-reports` job combines all shard blobs and Allure results into one Playwright HTML + Allure artifact (`combined-reports-*`).

### Runner setup

| Job | Environment | Why |
|---|---|---|
| `setup-auth`, `ui-tests` | `mcr.microsoft.com/playwright:v1.61.1-noble` | Browsers pre-installed — no `playwright install` step |
| `api-tests`, `merge-reports` | `ubuntu-latest` + Node 24 | API tests need no browser; merge job needs npm + Java |

Pin `PLAYWRIGHT_IMAGE` in `ci.yml` to match `@playwright/test` in `package.json`. Container jobs set `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true` because the Playwright image bundles Node 20 while GitHub runners default to Node 24.

### GitHub Pages

On push to `main` or `master`, the `deploy-pages` job publishes merged reports. **Pull request runs skip deploy** (GitHub Pages only updates from direct pushes). You can also trigger deploy manually via **Actions → Playwright Tests → Run workflow**.

Enable it once in the repo:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

### Sharding (local)

```bash
# Run shard 2 of 5 with 2 workers (env-driven)
CURRENT_SHARD=2 TOTAL_SHARDS=5 WORKERS=2 npm run test:regression

# Or CLI shard flag
WORKERS=2 npx playwright test --project=api --project=ui --shard=2/5
```

Optional env vars (see [`.env.example`](.env.example)): `WORKERS`, `CURRENT_SHARD`, `TOTAL_SHARDS`.

Combined Playwright HTML and Allure reports are uploaded as a single `combined-reports-*` build artifact on every run (pass or fail).
