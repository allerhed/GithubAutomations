---
type: intake
source: test
intent: "Exercise Copilot triage: create issues and a PR with enhanced workflow"
---

# Intake: multi-item test

Hello Copilot! Please analyze the items below.  
For each **Feature**/**Bug**/**Docs** item, open a separate **Issue** with:
- clear title,
- summary,
- acceptance criteria (checklist),
- links back to this task Issue.

For the **Code/Config** item, open a **draft PR** that implements the change, links back here, and includes minimal tests/docs updates.  
Assign **copilot-swe-agent** to everything you create. Use small, incremental commits.

---

## 1) Feature: Rate limiting for public API

**Context**
Our `/v1/search` endpoint sees burst traffic that can degrade p95 latency.

**Proposal**
Implement token-bucket rate limiting at the API gateway:
- Default: **60 req/min per API key**
- Burst: up to 120 req/min for 10 seconds
- Return `429 Too Many Requests` with `Retry-After` header
- Expose per-key overrides via config

**Acceptance criteria**
- [ ] Requests above limit receive 429 with `Retry-After`
- [ ] Limits configurable via `config/rate-limits.json`
- [ ] Metrics emitted: `rate_limit.throttle.count`, `rate_limit.remaining`
- [ ] Docs updated in `docs/api/rate-limits.md`
- [ ] Integration test covering 429 path

**Labels**: enhancement, backend

---

## 2) Bug: Null reference in payment capture

**Environment**
- Prod, Node 20
- Payments provider: MockPay v2

**Steps to reproduce**
1. Create order with `payment_method="invoice"`
2. Apply coupon AFTER order creation
3. Capture payment

**Observed**
`TypeError: Cannot read properties of undefined (reading 'amount')` in `payments/capture.ts:74`

**Expected**
Capture succeeds; amount equals order total minus coupon.

**Notes**
Likely due to missing `recalculateTotals()` call when coupons are applied post-creation.

**Acceptance criteria**
- [ ] Repro unit test added
- [ ] Fix `capture.ts` to handle late coupons
- [ ] No regression on credit-card path

**Labels**: bug, payments

---

## 3) Docs: README badge & quickstart fix

**Change**
- Add CI status badge for the default branch.
- Update Quickstart to include Node 20 requirement and `pnpm` option.

**Acceptance criteria**
- [ ] README shows build badge pointing to this repo’s default branch
- [ ] Quickstart includes `node >=20` and `pnpm install` snippet

**Labels**: documentation

---

## 4) Code/Config to integrate via PR

Please open a **draft PR** that includes the following new/updated files.  
If any path already exists, merge carefully; otherwise create new files.

### 4.1 New file: `config/rate-limits.json`
```json
{
  "default_per_minute": 60,
  "burst_per_minute": 120,
  "burst_window_seconds": 10,
  "overrides": {}
}

### test 1
### test 2
### test 3