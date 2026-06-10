// Pure estimation logic. Ported from V1's calculators (JSX stripped), updated
// to 2026 figures sourced from data/benchmarks.js. Every function is pure and
// unit-tested in estimator.test.js (incl. the 3 personas from spec §11).
import { balaFraction } from './bala.js'
import {
  bsdTiers, lbsBonus, shb, phg, resaleLevy, rentBands, cpfLifeAnchors, CPF_LIFE_BAND,
} from '../data/benchmarks.js'

// ── Formatting ────────────────────────────────────────────────────────
export function fmt(n) {
  return 'S$' + Math.round(n).toLocaleString()
}
// Round payouts DOWN to nearest $10 (spec §10: conservative).
export function roundPayoutDown(n) {
  return Math.max(0, Math.floor(n / 10) * 10)
}

// ── The gap (spec §11) ────────────────────────────────────────────────
export function monthlyGap(profile) {
  const income = profile.incomeMonthly != null
    ? profile.incomeMonthly
    : (profile.payoutMonthly || 0) + (profile.otherIncomeMonthly || 0)
  return Math.max(0, (profile.goalMonthly || 0) - income)
}

// ── Buyer's Stamp Duty — extended to 2023 5%/6% tiers ─────────────────
export function calcBSD(price) {
  let bsd = 0, prev = 0
  for (const [upper, rate] of bsdTiers) {
    if (price <= prev) break
    const slice = Math.min(price, upper) - prev
    bsd += slice * rate
    prev = upper
  }
  return Math.round(bsd)
}

// ── CPF LIFE payout band (spec §11) ───────────────────────────────────
// Linear interpolation over published anchor points; returns a {lo, hi, mid}
// band (±CPF_LIFE_BAND), rounded down to $10. LOW confidence between anchors —
// the UI must cite the official estimator.
export function cpfLifePayout(raBalance) {
  const ra = Math.max(0, raBalance || 0)
  const pts = cpfLifeAnchors
  let mid
  if (ra >= pts[pts.length - 1][0]) {
    // Extrapolate beyond ERS at the top segment's marginal rate.
    const [x0, y0] = pts[pts.length - 2]
    const [x1, y1] = pts[pts.length - 1]
    mid = y1 + (ra - x1) * (y1 - y0) / (x1 - x0)
  } else {
    for (let i = 1; i < pts.length; i++) {
      if (ra <= pts[i][0]) {
        const [x0, y0] = pts[i - 1]
        const [x1, y1] = pts[i]
        mid = y0 + (y1 - y0) * (ra - x0) / (x1 - x0)
        break
      }
    }
  }
  return {
    lo: roundPayoutDown(mid * (1 - CPF_LIFE_BAND)),
    hi: roundPayoutDown(mid * (1 + CPF_LIFE_BAND)),
    mid: roundPayoutDown(mid),
  }
}

// ── LBS target sums (ported from V1 getFRS/getBRS/minRetain) ──────────
// V1's age-banded FRS approximation for the LBS top-up target.
// TODO(launch): reconcile against the member's official cohort FRS.
export function getFRS(age) {
  if (age >= 80) return 200400
  if (age >= 70) return 210400
  return 220400
}
export function getBRS(age) { return Math.round(getFRS(age) / 2) }
export function minRetain(age) { return Math.max(35, 95 - age) } // lease to retain to age 95

// ── Lease Buyback proceeds (ported from V1 LBSCalculator) ─────────────
// params: { flatValue, remainLease, owners:[{age, ra}], flatType:'3R_or_smaller'|'4R'|'5R_or_larger',
//           outstandingLoan?, hdbQuote? }
export function lbsEstimate({ flatValue, remainLease, owners, flatType = '3R_or_smaller', outstandingLoan = 0, hdbQuote = 0 }) {
  const fv = +flatValue || 0, rl = +remainLease || 0, loan = +outstandingLoan || 0
  const os = (owners || []).filter(o => o && +o.age > 0)
  const twoOwners = os.length >= 2
  const youngestAge = os.length ? Math.min(...os.map(o => +o.age || 99)) : 0
  const retainedLease = youngestAge > 0 ? Math.max(minRetain(youngestAge), 0) : 0

  const bR = balaFraction(rl), bRet = balaFraction(retainedLease)
  const tailFraction = bR > 0 ? (bR - bRet) / bR : 0
  const balaEstimate = Math.round(fv * tailFraction)
  const grossProceeds = (+hdbQuote || 0) || balaEstimate
  const netProceeds = Math.max(0, grossProceeds - loan)

  const share = twoOwners ? 0.5 : 1
  const calcOwner = (procShare, currentRA, age, isSole) => {
    const target = isSole ? getFRS(age) : getBRS(age)
    const needed = Math.max(0, target - (currentRA || 0))
    const topUp = Math.min(needed, procShare)
    return { target, needed, topUp, remaining: procShare - topUp, newRA: (currentRA || 0) + topUp }
  }
  const isSole = !twoOwners
  const per = os.map(o => calcOwner(Math.round(netProceeds * share), +o.ra || 0, +o.age || 0, isSole))
  const totalTopUp = per.reduce((s, o) => s + o.topUp, 0)
  const totalRemaining = per.reduce((s, o) => s + o.remaining, 0)

  const cashPayout = Math.min(totalRemaining, 100000)
  const extraToRA = Math.max(0, totalRemaining - 100000)

  const maxBonus = lbsBonus[flatType] ?? lbsBonus['3R_or_smaller']
  const proRateDivisor = flatType === '4R' ? 4 : flatType === '5R_or_larger' ? 8 : 2
  const bonus = totalTopUp >= lbsBonus.fullBonusTopUpThreshold
    ? maxBonus
    : Math.min(maxBonus, Math.round(totalTopUp / proRateDivisor))

  const newRA = per.reduce((s, o) => s + o.newRA, 0) + bonus + extraToRA
  return {
    grossProceeds, netProceeds, totalTopUp, cashPayout, extraToRA, bonus,
    newRA, retainedLease, tailFraction, youngestAge,
  }
}

// ── Right-sizing proceeds (ported from V1 Calculator) ─────────────────
// params: { salePrice, cpfUsed, yearsOwned, newFlatPrice, isBTO, soldFlatType,
//           renovCost, downsizeToSmall, region, household }
export function rightsizeEstimate({
  salePrice, cpfUsed = 0, yearsOwned = 10, newFlatPrice, isBTO = false,
  soldFlatType = '4R', renovCost = 0, downsizeToSmall = false,
  region = 'flexible', household = 'couple',
}) {
  const sale = +salePrice || 0, cpf = +cpfUsed || 0, years = +yearsOwned || 10
  const newFlat = +newFlatPrice || 0, renov = +renovCost || 0

  const cpfInterest = Math.round(cpf * (Math.pow(1.025, years) - 1))
  const cpfRefund = cpf + cpfInterest
  const sellingAgent = Math.round(sale * 0.01)
  const sellingLegal = 3200
  const cashFromSale = sale - cpfRefund - sellingAgent - sellingLegal

  const bsd = calcBSD(newFlat)
  const buyingAgent = isBTO ? 0 : Math.round(newFlat * 0.01)
  const buyingLegal = 3200
  const levy = isBTO ? (resaleLevy[soldFlatType] || 0) : 0
  const totalBuying = newFlat + bsd + buyingAgent + buyingLegal + levy
  const cashForNew = Math.max(0, totalBuying - cpfRefund)
  const cpfLeftover = Math.max(0, cpfRefund - newFlat - bsd - buyingAgent - buyingLegal - levy)
  const netCash = (cashFromSale - cashForNew) - renov

  const shbBonus = downsizeToSmall ? shb.smallFlatBonus : shb.baseBonus
  // PHG (resale only): conservative "live near" band; families vs singles by household.
  const isFamily = household === 'couple' || household === 'with_family'
  const phgGrant = (region === 'proximity' && !isBTO)
    ? (isFamily ? phg.families.liveNear : phg.singles.liveNear)
    : 0
  const totalWithBonuses = netCash + shbBonus + phgGrant

  return { cpfRefund, netCash, shbBonus, phgGrant, cpfLeftover, totalWithBonuses, bsd, levy }
}

// ── Rental estimate (conservative bands; spec §11) ────────────────────
export function rentEstimate(flatType = '3R', scope = 'room') {
  const band = (rentBands[scope] && rentBands[scope][flatType]) || rentBands[scope]['3R']
  return { lo: band[0], hi: band[1], scope, flatType }
}
