// Eligibility predicates, ported from V1's decision-tree node guards and
// reorganised as lazy per-scheme checks (spec §5, §8). Unknown (null) inputs
// are treated as "not yet disqualifying" so partial profiles still surface
// options. Each scheme returns:
//   { status: 'eligible'|'ineligible'|'age_gated'|'suppressed', reason?, opensAtAge? }
import { incomeCeiling } from '../data/benchmarks.js'

const knownFalse = (v) => v === false
const knownTrue = (v) => v === true

// At least one owner is a Singapore Citizen. (We only track the primary owner's
// citizenship as profile.isSC; null = unknown = assume not disqualified.)
function scOk(p) { return !knownFalse(p.isSC) }
function mopOk(p) { return !knownFalse(p.mopMet) }
function incomeOk(p) {
  if (knownTrue(p.incomeUnder14k)) return true
  if (knownFalse(p.incomeUnder14k)) return false
  // Fall back to captured monthly income if the explicit flag is unknown.
  if (p.incomeMonthly != null) return p.incomeMonthly <= incomeCeiling
  return true
}

export function evalSHB(p) {
  if (!scOk(p)) return { status: 'ineligible', reason: 'pr' }
  if (knownFalse(p.mopMet)) return { status: 'ineligible', reason: 'mop' }
  if (knownTrue(p.ownsPrivate)) return { status: 'ineligible', reason: 'private' }
  if (!incomeOk(p)) return { status: 'ineligible', reason: 'income' }
  if (p.age != null && p.age < 55) return { status: 'age_gated', opensAtAge: 55 }
  return { status: 'eligible' }
}

export function evalLBS(p) {
  if (!scOk(p)) return { status: 'ineligible', reason: 'pr' }
  if (knownFalse(p.mopMet)) return { status: 'ineligible', reason: 'mop' }
  if (p.leaseRemaining != null && p.leaseRemaining < 20) return { status: 'ineligible', reason: 'lease' }
  if (!incomeOk(p)) return { status: 'ineligible', reason: 'income' }
  // All owners must be 65+. If the senior is 55–64 (or allOwners65 is false), it opens at 65.
  if ((p.age != null && p.age < 65) || knownFalse(p.allOwners65)) {
    return { status: 'age_gated', opensAtAge: 65 }
  }
  return { status: 'eligible' }
}

export function evalRentRoom(p) {
  if (knownFalse(p.mopMet)) return { status: 'ineligible', reason: 'mop' }
  if (knownFalse(p.spareRoom)) return { status: 'ineligible', reason: 'no_spare_room' }
  if (p.flatType === '2R') return { status: 'ineligible', reason: 'flat_too_small' }
  return { status: 'eligible' }
}

export function evalRentFlat(p) {
  if (knownFalse(p.mopMet)) return { status: 'ineligible', reason: 'mop' }
  // Requires alternative housing + is a hard ask under financial stress (spec §6.4):
  // never auto-recommended when escalated.
  if (p.escalated) return { status: 'suppressed', reason: 'escalated' }
  return { status: 'eligible' }
}

const EVALUATORS = { SHB: evalSHB, LBS: evalLBS, RENT_ROOM: evalRentRoom, RENT_FLAT: evalRentFlat }

// Evaluate every scheme for a profile.
export function evaluateAll(profile) {
  const out = {}
  for (const [id, fn] of Object.entries(EVALUATORS)) out[id] = fn(profile)
  return out
}

// Years until an age-gated scheme opens (for TimelineNote, spec §5/§8).
export function yearsUntilOpen(profile, schemeResult) {
  if (schemeResult.status !== 'age_gated' || profile.age == null) return null
  return Math.max(0, schemeResult.opensAtAge - profile.age)
}
