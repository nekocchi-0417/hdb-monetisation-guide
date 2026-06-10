// Bala's table (SLA official milestone values), interpolated per year.
// Ported verbatim from V1 `balaFraction` / `BALA_PTS`.
// Source: Singapore Land Authority / Land Betterment Charge Regulations 2022.
const BALA_PTS = [
  [0, 0], [5, 0.171], [10, 0.300], [15, 0.400], [20, 0.480], [24, 0.534],
  [30, 0.600], [35, 0.646], [40, 0.685], [45, 0.718], [49, 0.741],
  [55, 0.773], [60, 0.800], [65, 0.830], [70, 0.860], [74, 0.880],
  [80, 0.910], [85, 0.929], [90, 0.946], [95, 0.956], [99, 0.960],
]

// Fraction of freehold value retained by a lease of `n` years (linear interp).
export function balaFraction(n) {
  if (n <= 0) return 0
  if (n >= 99) return BALA_PTS[BALA_PTS.length - 1][1]
  for (let i = 1; i < BALA_PTS.length; i++) {
    if (n <= BALA_PTS[i][0]) {
      const [x0, y0] = BALA_PTS[i - 1]
      const [x1, y1] = BALA_PTS[i]
      return y0 + (y1 - y0) * (n - x0) / (x1 - x0)
    }
  }
  return BALA_PTS[BALA_PTS.length - 1][1]
}
