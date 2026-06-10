// The single source of truth for a session (spec §4). Held in memory only;
// nothing is sent server-side. Optional localStorage save is behind an
// explicit tap (not implemented in Phase 1).
export function initialProfile() {
  return {
    mode: null,            // 'self' | 'helper' | 'advisor'
    relationship: null,    // 'mum' | 'dad' | 'other'  (helper mode only)
    lang: 'en',

    // S1 goal
    goalMonthly: null,
    goalTier: null,        // 'basic' | 'comfortable' | 'plenty' | 'custom'

    // S2 income & spending
    payoutMonthly: 0,
    otherIncomeMonthly: 0,
    incomeMonthly: null,   // combined; what S2 actually captures
    spendMonthly: null,
    cpfRA: null,

    // S3 derived + urgency
    gapMonthly: 0,
    urgency: 'none',       // 'none' | 'months' | 'immediate'
    escalated: false,

    // S4 housing values
    stayOrMove: null,      // 'stay' | 'move' | 'both'
    bequest: null,         // 'must_keep_flat' | 'flexible' | 'no_need'
    household: null,       // 'alone' | 'couple' | 'with_family'
    spareRoom: null,

    // S5 eligibility
    isSC: null,
    age: null,
    allOwners65: null,
    mopMet: null,
    flatType: null,        // '2R' | '3R' | '4R' | '5R+'
    town: null,
    leaseRemaining: null,
    incomeUnder14k: null,
    ownsPrivate: null,

    // outputs
    results: [],
  }
}

// The ordered stages of the journey (spec §5).
export const STAGES = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7']

// Resolve the {mum} pronoun token family from mode/relationship (spec §6).
// Returns interpolation vars consumed by t(key, vars).
export function makePronoun(profile, t) {
  let base
  if (profile.mode === 'self') base = 'self'
  else if (profile.mode === 'advisor') base = 'advisor'
  else base = profile.relationship || 'other'

  const subj = t(`pronoun.${base}_subject`)
  const poss = t(`pronoun.${base}_possessive`)
  const obj = t(`pronoun.${base}_object`)
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

  return {
    mum: subj,
    mum_possessive: poss,
    mum_object: obj,
    Mum: cap(subj),
    Mum_possessive: cap(poss),
  }
}
