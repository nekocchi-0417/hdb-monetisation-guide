// Mock Singpass/Myinfo accelerator (spec §6 S0, §12 out-of-scope for real).
// Returns a fixture partial-profile to prefill typing. Phase 2 dependency.
export function loadMyinfoMock() {
  return {
    cpfRA: 95000,
    age: 67,
    flatType: '3R',
    town: 'TOA PAYOH',
    leaseRemaining: 62,
    isSC: true,
    mopMet: true,
    _demo: true,
  }
}
