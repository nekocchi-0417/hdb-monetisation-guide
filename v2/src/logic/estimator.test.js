import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  monthlyGap, calcBSD, cpfLifePayout, lbsEstimate, rightsizeEstimate, rentEstimate,
} from './estimator.js'
import { evaluateAll, yearsUntilOpen } from './eligibility.js'
import { sums } from '../data/benchmarks.js'

// ── gap ───────────────────────────────────────────────────────────────
test('monthlyGap: goal minus income, floored at 0', () => {
  assert.equal(monthlyGap({ goalMonthly: 1780, incomeMonthly: 950 }), 830)
  assert.equal(monthlyGap({ goalMonthly: 900, incomeMonthly: 1200 }), 0)
  assert.equal(monthlyGap({ goalMonthly: 1500, payoutMonthly: 600, otherIncomeMonthly: 300 }), 600)
})

// ── BSD incl. the 2023 5%/6% tiers ────────────────────────────────────
test('calcBSD: matches V1 for low tiers', () => {
  assert.equal(calcBSD(380000), 6000)   // 1800 + 3600 + 600
  assert.equal(calcBSD(180000), 1800)
})
test('calcBSD: applies 5% tier above $1.5m', () => {
  // 1800 + 3600 + 19200 + 20000 + 25000
  assert.equal(calcBSD(2000000), 69600)
})

// ── CPF LIFE payout band ──────────────────────────────────────────────
test('cpfLifePayout: FRS midpoint ~ comfortable tier, band brackets it', () => {
  const p = cpfLifePayout(sums.frs)
  assert.equal(p.mid, 1780)
  assert.ok(p.lo < p.mid && p.mid < p.hi)
  assert.equal(p.mid % 10, 0) // rounded to $10
})
test('cpfLifePayout: zero balance → zero', () => {
  assert.deepEqual(cpfLifePayout(0), { lo: 0, hi: 0, mid: 0 })
})

// ── rentEstimate ──────────────────────────────────────────────────────
test('rentEstimate: returns a band', () => {
  const r = rentEstimate('3R', 'room')
  assert.ok(r.lo > 0 && r.hi > r.lo)
})

// ══════════════════════════════════════════════════════════════════════
// Persona A — 67yo, 3R Toa Payoh, RA $60k, stay + gap → LBS works
// ══════════════════════════════════════════════════════════════════════
test('persona A: LBS estimate is positive and tops up RA; LBS eligible', () => {
  const lbs = lbsEstimate({
    flatValue: 380000, remainLease: 62,
    owners: [{ age: 67, ra: 60000 }], flatType: '3R_or_smaller',
  })
  assert.ok(lbs.grossProceeds > 0, 'gross proceeds positive')
  assert.ok(lbs.newRA > 60000, 'RA topped up')
  assert.equal(lbs.bonus, 30000, 'full 3R bonus (top-up ≥ $60k)')

  const profile = { isSC: true, mopMet: true, age: 67, leaseRemaining: 62, incomeUnder14k: true, stayOrMove: 'stay' }
  const e = evaluateAll(profile)
  assert.equal(e.LBS.status, 'eligible')
})

// ══════════════════════════════════════════════════════════════════════
// Persona B — 58yo couple, 4R, move → SHB path + LBS age-timeline to 65
// ══════════════════════════════════════════════════════════════════════
test('persona B: SHB eligible & sized right; LBS age-gated to 65 (7 yrs)', () => {
  const rs = rightsizeEstimate({
    salePrice: 540000, cpfUsed: 150000, yearsOwned: 25,
    newFlatPrice: 380000, isBTO: false, soldFlatType: '4R',
    downsizeToSmall: false, region: 'flexible', household: 'couple',
  })
  assert.equal(rs.shbBonus, 30000, '3-room right-size → $30k base bonus')
  assert.equal(rs.phgGrant, 0, 'no PHG when region flexible')
  assert.equal(rs.totalWithBonuses, rs.netCash + 30000)

  const profile = { isSC: true, mopMet: true, age: 58, allOwners65: false, incomeUnder14k: true, stayOrMove: 'move' }
  const e = evaluateAll(profile)
  assert.equal(e.SHB.status, 'eligible')
  assert.equal(e.LBS.status, 'age_gated')
  assert.equal(e.LBS.opensAtAge, 65)
  assert.equal(yearsUntilOpen(profile, e.LBS), 7)
})

// ══════════════════════════════════════════════════════════════════════
// Persona C — escalated urgent case → rent-out-entire-flat suppressed
// ══════════════════════════════════════════════════════════════════════
test('persona C: escalated profile suppresses RENT_FLAT recommendation', () => {
  const profile = { isSC: true, mopMet: true, age: 70, escalated: true, urgency: 'immediate' }
  const e = evaluateAll(profile)
  assert.equal(e.RENT_FLAT.status, 'suppressed')
  assert.equal(e.RENT_FLAT.reason, 'escalated')
})

// ── SHB small-flat uplift ─────────────────────────────────────────────
test('rightsize: downsizing to 2R/CCA → $40k SHB bonus', () => {
  const rs = rightsizeEstimate({
    salePrice: 540000, cpfUsed: 100000, yearsOwned: 20,
    newFlatPrice: 200000, isBTO: false, soldFlatType: '4R',
    downsizeToSmall: true, region: 'proximity', household: 'couple',
  })
  assert.equal(rs.shbBonus, 40000)
  assert.equal(rs.phgGrant, 20000) // families "live near" band, resale
})
