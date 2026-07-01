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
npm run quality           # Typecheck + lint + format check (auto-runs Prettier --write if needed)
```

**85 automated tests** total: **47 UI** + **38 API** across 23 spec files.

Manual test cases in [`docs/testcases/`](docs/testcases/): **82 rows** (**44** SauceDemo + **38** FakeStoreAPI). See [Test Case Traceability](#test-case-traceability) for how manual cases map to automation (including clubbed and split scenarios).

Auth sessions for UI tests are generated automatically by `global-setup.ts` before the suite runs. Re-run tests anytime — auth files in `.auth/` are refreshed when older than 24 hours.

Set `HEADED=true` in `.env` to run UI tests in headed mode locally (headless by default).

### Quality Gates

```bash
npm run typecheck     # TypeScript strict check
npm run lint          # ESLint
npm run lint:fix      # Auto-fix lint issues
npm run format        # Prettier write
npm run format:check  # Prettier CI check
npm run quality       # Typecheck, ESLint, Prettier check (auto-formats locally; CI fails if fixes are needed)
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
- `@regression` — full suite: all **47** UI and **38** API tests (**85 total**; tagged at `test.describe` level; smoke tests inherit both tags).

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

**Cross-browser:** [`playwright.config.ts`](playwright.config.ts) currently runs UI tests on **Desktop Chrome** only. Firefox and Edge projects (`devices['Desktop Firefox']`, `devices['Desktop Edge']`) are a natural next step but were held off to keep CI runtime manageable — adding them would triple UI browser matrix cost unless scoped to a nightly or smoke-only job.

**Reporting:** Allure steps (`allure.step()`) are used in UI tests for business-readable reporting. Combined Allure + Playwright HTML output is covered in [CI](#ci) and [Quick Start](#quick-start).

---

## Assignment 2 — FakeStoreAPI Cart CRUD

### Test Coverage

**38 automated API tests** across 6 spec files:

| Spec file                  |  Tests | Coverage                                                     |
| -------------------------- | -----: | ------------------------------------------------------------ |
| `cart-crud.spec.ts`        |     14 | CRUD, simulated negatives, auth, schema field checks         |
| `security.spec.ts`         |     10 | Auth boundary, IDOR, unauthenticated write operations        |
| `cart-data-driven.spec.ts` |      5 | POST cart over 5 product IDs                                 |
| `get.spec.ts`              |      4 | GET list, by id, products array, non-existent id             |
| `post-validation.spec.ts`  |      3 | Invalid productId, negative quantity, missing products field |
| `cart-contract.spec.ts`    |      2 | Single-cart snapshot + collection contract                   |
| **Total**                  | **38** |                                                              |

`cart-data-driven.spec.ts` defines one `test()` inside a loop over 5 product IDs — Playwright lists **5 runtime tests** from that single spec file.

### Framework: Playwright Test + Axios + Zod

**Why this stack:**

- **Playwright Test as runner** — unified Playwright HTML and Allure reports with the UI suite; single CI step for both
- **Axios** — interceptors attach JWT per-test via `withAuthToken()`; `baseURL` config means zero hardcoded URLs in test files
- **Zod** — TypeScript-style runtime schema validation with human-readable error messages; schemas export `z.infer<>` types used by data builders

### Extension Plan

**Reporting:** Contract snapshots are committed JSON files — shape drift shows as a `git diff` in PRs. Allure tracks test history across runs.

---

## Test Case Traceability

Manual cases live in [`docs/testcases/saucedemo_testcases.csv`](docs/testcases/saucedemo_testcases.csv) and [`docs/testcases/fakestoreapi_testcases.csv`](docs/testcases/fakestoreapi_testcases.csv). Every manual case is covered by automation; the automated count is higher because some scenarios are **split** into multiple tests for clearer failure isolation.

| Source       | Manual cases (`docs/`) | Automated tests | Net delta | Notes                                    |
| ------------ | ---------------------: | --------------: | --------: | ---------------------------------------- |
| SauceDemo UI |                     44 |              47 |        +3 | 1 validation case split into 4 tests     |
| FakeStoreAPI |                     38 |              38 |         0 | 1:1 mapping (1 manual case clubs 2 GETs) |
| **Total**    |                 **82** |          **85** |    **+3** | All 82 manual intents covered            |

### SauceDemo — split (1 manual → multiple automated)

| Manual case (`docs/`)                            | Automated spec                |                                               Automated tests |
| ------------------------------------------------ | ----------------------------- | ------------------------------------------------------------: |
| Verify Mandatory Customer Information Validation | `checkout/validation.spec.ts` | **4** (missing first name, last name, postal code, all empty) |

### SauceDemo — clubbed (multiple manual intents in one automated test)

| Automated test                                          | Manual cases covered                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `checkout/e2e.spec.ts` — E2E checkout for Standard User | End-to-end checkout **+** order-summary subtotal/tax checks (also isolated in `summary.spec.ts`) |
| `checkout/cart-navigation.spec.ts`                      | Cart navigation from inventory **and** order confirmation (single flow)                          |

All other SauceDemo manual cases map **1:1** to a single automated test (same title or direct equivalent).

### FakeStoreAPI — clubbed (1 manual → 1 automated, multiple steps)

| Manual case (`docs/`)                                 | Automated test                                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Verify Unauthenticated Client Can Read Any Cart By Id | `security.spec.ts` — asserts 401 for both `GET /carts/1` and `GET /carts/2` in one test |

All other FakeStoreAPI manual cases map **1:1** to a single automated test.

### Coverage status by manual `Status` column

| Manual `Status` |  Count | Automation                                          |
| --------------- | -----: | --------------------------------------------------- |
| **Passed**      |     65 | Genuine pass                                        |
| **Failed**      |     17 | `markKnownDefect()` — 4 SauceDemo + 13 FakeStoreAPI |
| **Total**       | **82** | **17** `@known-defect` tests                        |

---

## Known Defects

**17 of 85 tests** assert **expected product behavior** from the manual test case spreadsheets, but the **demo applications do not meet that expected behavior**. These are **not automation bugs** — the tests correctly detect real defects in SauceDemo and FakeStoreAPI. The remaining **68 tests** are genuine passes against current app/API behavior.

All 17 use the same `markKnownDefect()` pattern (see below). Breakdown: **4 UI** + **13 API**.

Source of truth (manual execution `Status: Failed`):

- [SauceDemo test cases spreadsheet](https://docs.google.com/spreadsheets/d/1jK9cAb_C6vVrr4h8FTc8oyGkygmwP6a_Y01s3_4vydQ/edit?usp=sharing)
- [FakeStoreAPI test cases spreadsheet](https://docs.google.com/spreadsheets/d/1NbomKcn3HD95l9FbgWy1MYpOcaYueGE7iSy4OHucJWE/edit?usp=sharing)

### Why they show as **Passed** in CI and reports

All **17 known-defect tests** use the same single pattern — no mixed approaches. Each test:

1. **Asserts the correct expected behavior** from the manual test case (e.g. `401 Unauthorized`, checkout reaches step two).
2. **Calls `markKnownDefect()`** at the start, which registers the defect in Allure and tells Playwright the failure is expected.

Implementation in [`helpers/known-defects.helper.ts`](helpers/known-defects.helper.ts):

```typescript
export async function markKnownDefect(key: KnownDefectKey): Promise<void> {
  const defect = KNOWN_DEFECTS[key];
  test.fail(true, `[${defect.id}] ${defect.summary}`); // Playwright: expect this test to fail
  await allure.label('known-defect', defect.id);
  await allure.tag('known-defect');
}
```

Playwright's [`test.fail()`](https://playwright.dev/docs/test-annotations#test-fail) inverts the usual pass/fail logic: if the test **does** fail, the run result is **Passed**; if it **passes**, the run result is **Failed**.

```
Manual test case says:     "API should return 401 without auth"
Demo app actually does:    Returns 200 with data
Automation asserts:        expect 401  →  assertion FAILS (correct — bug detected)
test.fail(true):           "I expected this failure"  →  Playwright result: PASSED
CI pipeline:               Green ✓  (no false alarm on a third-party demo bug)
```

| Layer               | What you see                 | What it means                                                                                                                                                                                         |
| ------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Assertion**       | Fails                        | Automation correctly detected that the app/API does not meet the expected behavior. The defect is real and documented.                                                                                |
| **Playwright / CI** | Passed                       | Failure was pre-declared via `test.fail()` — CI stays green because this is a known, accepted demo-app limitation, not a regression in our code.                                                      |
| **Allure**          | Passed + `@known-defect` tag | Same mapping as Playwright. Filter by `@known-defect` or label `known-defect` (e.g. `SAUCEDEMO-001`) to list all documented bugs. Assertion details remain visible in steps, traces, and screenshots. |

**Why not skip or assert the broken behavior instead?**

- **Skip / `test.fixme()`** — defect never runs; easy to forget; no daily signal that the bug still exists.
- **Assert broken behavior** (e.g. expect `200` when spec says `401`) — test passes but stops documenting the gap; if the app is fixed, the test breaks for the wrong reason.
- **`markKnownDefect()` + correct assertion** — runs every CI build, keeps asserting the right outcome, stays green until the app is fixed, then **flips to Failed** automatically.

**When an application fix lands**, the assertion will start passing while `test.fail()` still expects failure — the test will flip to **Failed** in CI. That is the signal to remove `markKnownDefect()` and the `@known-defect` tag for that test.

### SauceDemo UI (4 tests)

| Defect ID       | Test                                             | Expected                               | Actual app behavior                                                    | Failing assertion (evidence)                                                                                  |
| --------------- | ------------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `SAUCEDEMO-001` | `checkout/problem-user-checkout.spec.ts`         | Problem user completes checkout        | Last name input does not retain value; checkout never reaches step two | `getLastNameValue()` ≠ filled last name, or URL stays on `/checkout-step-one` instead of `/checkout-step-two` |
| `SAUCEDEMO-002` | `reset/reset-app-state.spec.ts` — From Inventory | Reset restores **Add to Cart** buttons | Cart badge clears, but **Remove** buttons stay on products             | `isAddToCartShownForProduct()` is `false` / `isRemoveShownForProduct()` is `true` after reset                 |
| `SAUCEDEMO-003` | `reset/reset-app-state.spec.ts` — From Cart      | Reset empties the cart                 | Cart badge clears, but line items remain                               | `getCartItemCount()` returns `2` (expected `0`) after reset                                                   |
| `SAUCEDEMO-004` | `reset/reset-app-state.spec.ts` — Order Overview | Reset clears order overview            | Badge clears, but items still listed and purchase can finish           | `getItemCount()` returns `1` (expected `0`) on checkout step two after reset                                  |

### FakeStoreAPI (13 tests)

| Defect ID          | Test                                                   | Expected               | Actual API behavior                                         | Failing assertion (evidence)                                                |
| ------------------ | ------------------------------------------------------ | ---------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| `FAKESTOREAPI-001` | `security.spec.ts` — no token                          | `401 Unauthorized`     | `GET /carts` returns **`200`** with data — no auth enforced | `assertApiErrorStatus(..., 401)` — request succeeds instead of throwing 401 |
| `FAKESTOREAPI-001` | `security.spec.ts` — malformed token                   | `401 Unauthorized`     | Same — malformed Bearer token still returns **`200`**       | `assertApiErrorStatus(..., 401)` — request succeeds instead of throwing 401 |
| `FAKESTOREAPI-001` | `security.spec.ts` — tampered JWT                      | `401 Unauthorized`     | Same — tampered JWT still returns **`200`**                 | `assertApiErrorStatus(..., 401)` — request succeeds instead of throwing 401 |
| `FAKESTOREAPI-001` | `security.spec.ts` — empty Bearer token                | `401 Unauthorized`     | Same — empty Bearer token still returns **`200`**           | `assertApiErrorStatus(..., 401)` — request succeeds instead of throwing 401 |
| `FAKESTOREAPI-001` | `security.spec.ts` — invalid token PUT                 | `401 Unauthorized`     | `PUT /carts/:id` succeeds with invalid Bearer token         | `assertApiErrorStatus(..., 401)` — request succeeds instead of throwing 401 |
| `FAKESTOREAPI-005` | `security.spec.ts` — unauthenticated GET by id         | `401 Unauthorized`     | Unauthenticated client can read any cart by id              | `assertApiErrorStatus(..., 401)` — request succeeds instead of throwing 401 |
| `FAKESTOREAPI-006` | `security.spec.ts` — cross-user read                   | `403 Forbidden`        | Authenticated client can read another users cart            | `assertApiErrorStatus(..., 403)` — request succeeds instead of throwing 403 |
| `FAKESTOREAPI-007` | `security.spec.ts` — unauthenticated PATCH             | `401 Unauthorized`     | Unauthenticated PATCH can modify another users cart         | `assertApiErrorStatus(..., 401)` — request succeeds instead of throwing 401 |
| `FAKESTOREAPI-008` | `security.spec.ts` — unauthenticated POST              | `401 Unauthorized`     | Unauthenticated POST creates a cart                         | `assertApiErrorStatus(..., 401)` — request succeeds instead of throwing 401 |
| `FAKESTOREAPI-008` | `security.spec.ts` — unauthenticated DELETE            | `401 Unauthorized`     | Unauthenticated DELETE returns success                      | `assertApiErrorStatus(..., 401)` — request succeeds instead of throwing 401 |
| `FAKESTOREAPI-002` | `post-validation.spec.ts` — invalid `productId: 99999` | `400` validation error | API returns **`201 Created`**                               | `assertApiErrorStatus(..., 400)` — create succeeds for non-existent product |
| `FAKESTOREAPI-003` | `post-validation.spec.ts` — negative quantity          | `400` validation error | API returns **`201 Created`**                               | `assertApiErrorStatus(..., 400)` — create succeeds with `quantity: -1`      |
| `FAKESTOREAPI-004` | `post-validation.spec.ts` — missing `products`         | `400` validation error | API returns **`201 Created`**                               | `assertApiErrorStatus(..., 400)` — create succeeds without `products` field |

Run only known-defect tests (assertions fail; results show **Passed** due to `test.fail()`):

```bash
npx playwright test --grep @known-defect
```

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
