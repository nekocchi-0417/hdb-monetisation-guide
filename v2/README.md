# Plan with your flat — HDB Housing Monetisation Guide V2

A research-grounded rebuild of [V1](../index.html) per `hm-tool-v2-spec.md`. Reframes housing monetisation around **monthly retirement income**: lifestyle goal → income → the monthly gap → housing values → eligibility → options (with inline caveats) → shareable summary → handoff to HDB's official e-Service.

Built as a sibling of the untouched V1 (`../index.html`), deployed at `…/hdb-monetisation-guide/v2/`.

## Develop

```bash
cd v2
npm install
npm run dev      # http://localhost:5173  (root base in dev)
npm run build    # base '/hdb-monetisation-guide/v2/'  → dist/
npm run preview
npm test         # node --test on logic/*.test.js
```

## Structure

```
src/
  App.jsx              Stage machine (S0→S7), profile state, nav
  stages/  S0Entry … S7Summary
  components/  Header, ProgressHint, StageStub  (+ OptionCard, GapBar,
               MechanismChain, EscalationCard, HelpStrip, SummaryCard,
               TapTip, ReviewSheet — added in later phases)
  logic/   profile.js, myinfoMock.js  (+ estimator, bala, resaleData,
           eligibility — ported from V1, later phases)
  data/    schemes, benchmarks, channels, flow  (later phases)
  i18n/    en (source) · zh (headlines) · ms/ta (stubs → en fallback)
  styles/  tokens.css   SGDS-aligned design tokens
```

## Build status

- **Phase 1 ✅** — scaffold, SGDS tokens, i18n (en/zh + ms/ta stubs), senior-UX header (A/A+/A++, language toggle), profile state model, S0 (functional) + S1–S7 stub stages, walkable S0→S7 machine.
- Phases 2–8 (logic layer → data → S1–S3 → S4–S5 → S6 → S7 → hardening) per spec build order.

---

## Data ledger

> Compiled 2026-06-10 by research pass, adversarially cross-checked. **Confidence:** HIGH = official .gov.sg page · MEDIUM = corroborated secondary · LOW = inferred/stale. Every figure surfaced in-UI must show its source and defer to official HDB/CPF figures (spec §2, §13). **Verify TODO-flagged items before launch.**

### CPF Retirement Sums — 2026 cohort (turning 55 in 2026)
| Sum | 2026 | (2025) | Conf. |
|---|---|---|---|
| BRS | **$110,200** | $106,500 | HIGH |
| FRS (2×BRS) | **$220,400** | $213,000 | HIGH |
| ERS (4×BRS) | **$440,800** | $426,000 | HIGH |

Sources: cpf.gov.sg retirement-sums article; ERS-2026 change article; MOM Budget-2022 BRS schedule (2023–2027). 2027 BRS will be $114,100.

### CPF LIFE Standard Plan — monthly payout from age 65 (the S1 tier amounts, `benchmarks.js`)
| Tier (RA at 55) | Est. monthly payout | Conf. |
|---|---|---|
| BRS $110,200 | **~$950** | HIGH |
| FRS $220,400 | **~$1,780** | HIGH |
| ERS $440,800 | **~$3,440** | MEDIUM |

CPF publishes these as a low–high **band** (e.g. 2025 FRS was "$1,610–$1,730"); treat the above as midpoints. **ERS ~$3,440** corroborated via secondary aggregators only — confirm on the live estimator. Source: cpf.gov.sg/payoutestimator.

### CPF LIFE payout lookup (`estimator.cpfLifePayout`)
**No public granular table exists — FLAGGED (LOW).** CPF offers only the live estimator (cpf.gov.sg/payoutestimator) + a worked-examples PDF. Anchor points to interpolate: ($110,200→~$950), ($220,400→~$1,780), ($440,800→~$3,440); ~$8–8.5/mo per $1,000 RA, **not** officially linear. Drive real figures from the estimator, not a static table; show a ±band.

### LBS cash bonus (`estimator.lbsEstimate`) — HIGH, unchanged 2025–2026
3-room or smaller **$30,000** · 4-room **$15,000** · 5-room+ **$7,500**. Full bonus when total RA top-up ≥ **$60,000**, else pro-rated. Source: hdb.gov.sg LBS "How it Works"; T&Cs Dec 2024.

### Silver Housing Bonus (enhanced, effective 1 Dec 2025) — HIGH
Max cash bonus **$40,000**/household (was $30,000); **+$10,000** extra for right-sizing to 2-room-or-smaller / CCA (no pro-ration); net CPF RA top-up commitment up to **$60,000** (may be met from CPF housing refund); income ceiling **$14,000**/mo; AV ≤ **$21,000**, **extended to ≤ $31,000 for private property** (confirmed in force); min age 55. Source: HDB SHB-enhancements press release + SHB page. *(Note: V1 used $30k/$40k tiers — update to the $40k base / +$10k structure.)*

### Proximity Housing Grant (`estimator.rightsizeEstimate`) — HIGH
Families: **$30,000** (live with) / **$20,000** (within 4 km). Singles: **$15,000** / **$10,000**. Resale only; no income ceiling. *(V1 used a flat $30k — refine.)*

### Buyer's Stamp Duty (`estimator.calcBSD`) — HIGH (since 15 Feb 2023)
1% first $180k · 2% next $180k · 3% next $640k · 4% next $500k (→$1.5m) · **5% next $1.5m** · **6% above $3m**. V1's `calcBSD` covers only up to 4% — extend to the 5%/6% tiers. Source: IRAS BSD.

### Hotlines (`channels.js`) — HIGH
ComCare **1800-222-0000** (daily 7am–12am) · Silver Generation Office / AIC **1800-650-6060** (Mon–Fri 8.30–20.30, Sat 8.30–16.00) · HDB Branch Service Line **6225-5432** (weekdays 8am–5pm, verified for monetisation).

### Official URLs (`channels.js`)
- HDB Check/Enquire Housing Monetisation Options e-Service: **https://go.gov.sg/hdb-hmoptions** (HDB-published short link — capture resolved long URL before hardcoding). Info page: hdb.gov.sg → monetising-your-flat-for-retirement.
- HDB appointment booking: **https://services2.hdb.gov.sg/webapp/BF13AWAppointmentWeb/branch/**
- MSF SSO locator: **https://www.msf.gov.sg/our-services/directories**
- SupportGoWhere: **https://supportgowhere.life.gov.sg** (confirmed live)
- CPF payout estimator: **https://www.cpf.gov.sg/payoutestimator**

### NUS LKYSPP Minimum Income Standard (`benchmarks.references.mis`)
Single elderly **$1,492**/mo (HIGH) · elderly couple **$2,551**/mo (MEDIUM — verify line in report PDF). **2022 prices**, MIS 2023 report; no newer study found — label "2022 prices" and consider CPI uplift. Source: whatsenough.sg/key-findings-2023.

### Open flags to resolve before launch
1. CPF LIFE granular lookup table does not exist publicly → interpolation is LOW confidence; band only.
2. ERS 2026 monthly payout (~$3,440) — confirm on live estimator (secondary sources only).
3. MIS elderly-couple $2,551 — verify verbatim in report PDF.
4. HDB monetisation e-Service final resolved URL.

## Out of scope for V2.0
Real Singpass/Myinfo (mocked) · parameterised HDB e-Service deep link (plain link first) · ms/ta translations (stubs) · live rental data · analytics · saved multi-session plans.
