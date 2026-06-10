// All tunable government figures live here, each with its source + confidence.
// Verified 2026-06-10 (see README "Data ledger"). Confirm CPF LIFE payouts on
// the live estimator before launch — CPF publishes bands, not point values.

export const COHORT_YEAR = 2026

// CPF Retirement Sums by cohort (member turning 55 that year). HIGH confidence.
export const retirementSums = {
  2025: { brs: 106500, frs: 213000, ers: 319500 },
  2026: { brs: 110200, frs: 220400, ers: 440800 },
}
export const sums = retirementSums[COHORT_YEAR]

// S1 lifestyle tiers → CPF LIFE Standard Plan monthly payout from age 65.
// Midpoints of CPF's published bands (BRS/FRS HIGH, ERS MEDIUM — verify).
export const tiers = {
  basic: { amount: 950, source: 'brs', label: 'simpleSteady' },
  comfortable: { amount: 1780, source: 'frs', label: 'comfortable' },
  plenty: { amount: 3440, source: 'ers', label: 'plenty' },
}

// Anchor points for cpfLifePayout interpolation: [RA balance at 65, monthly].
// No official granular table exists (LOW confidence between anchors) — drive
// real figures from cpf.gov.sg/payoutestimator; show a band.
export const cpfLifeAnchors = [
  [0, 0],
  [sums.brs, tiers.basic.amount],
  [sums.frs, tiers.comfortable.amount],
  [sums.ers, tiers.plenty.amount],
]
export const CPF_LIFE_BAND = 0.08 // ±8% around interpolated midpoint (spec §11)

// Lease Buyback Scheme cash bonus by flat type. HIGH, unchanged 2025–2026.
export const lbsBonus = {
  '3R_or_smaller': 30000,
  '4R': 15000,
  '5R_or_larger': 7500,
  fullBonusTopUpThreshold: 60000, // total RA top-up for full (un-prorated) bonus
}

// Silver Housing Bonus — enhanced, effective 1 Dec 2025. HIGH.
export const shb = {
  baseBonus: 30000,        // right-sizing to 3-room
  smallFlatBonus: 40000,   // 2-room-or-smaller / CCA (base + $10k, no pro-ration)
  netRaCommitment: 60000,  // committed from CPF housing refund
  incomeCeiling: 14000,
  avCeilingHdb: 21000,
  avCeilingPrivate: 31000, // Dec 2025 extension, confirmed in force
  minAge: 55,
}

// Proximity Housing Grant (resale only; no income ceiling). HIGH.
// Conservative default = "live near (within 4km)" families band.
export const phg = {
  families: { liveWith: 30000, liveNear: 20000 },
  singles: { liveWith: 15000, liveNear: 10000 },
}

// Buyer's Stamp Duty residential tiers (since 15 Feb 2023). HIGH.
// [upperThreshold, rate]; last tier upperThreshold = Infinity.
export const bsdTiers = [
  [180000, 0.01],
  [360000, 0.02],
  [1000000, 0.03],
  [1500000, 0.04],
  [3000000, 0.05],
  [Infinity, 0.06],
]

// Resale levy when buying a new subsidised (BTO) flat. From V1.
export const resaleLevy = { '2R': 15000, '3R': 30000, '4R': 40000, '5R+': 45000, exec: 50000 }

// Conservative monthly rental bands (S$) by flat type. TODO: URA/HDB rental
// statistics API is a Phase 2 upgrade to live data (spec §11). LOW confidence.
export const rentBands = {
  room: { '2R': [600, 1000], '3R': [700, 1200], '4R': [800, 1400], '5R+': [900, 1600] },
  whole: { '2R': [1600, 2200], '3R': [2000, 2800], '4R': [2400, 3400], '5R+': [2800, 4200] },
}

// Reference (not a target): NUS LKYSPP Minimum Income Standard, 2022 prices.
export const references = {
  mis: {
    single: 1492,   // HIGH
    couple: 2551,   // MEDIUM — verify in report PDF
    asOf: '2022 prices',
    label: 'Minimum Income Standard study (NUS LKYSPP, 2023)',
    url: 'https://whatsenough.sg/key-findings-2023/',
  },
}

export const incomeCeiling = 14000 // SHB & LBS gross household monthly ceiling
