import { test } from 'node:test'
import assert from 'node:assert/strict'
import { balaFraction } from './bala.js'

test('bala: anchor points are exact', () => {
  assert.equal(balaFraction(0), 0)
  assert.equal(balaFraction(5), 0.171)
  assert.equal(balaFraction(60), 0.800)
  assert.equal(balaFraction(95), 0.956)
})

test('bala: clamps below 0 and at/above 99', () => {
  assert.equal(balaFraction(-10), 0)
  assert.equal(balaFraction(99), 0.960)
  assert.equal(balaFraction(120), 0.960)
})

test('bala: linear interpolation between anchors', () => {
  // halfway between 5 (0.171) and 10 (0.300)
  assert.ok(Math.abs(balaFraction(7.5) - 0.2355) < 1e-9)
})

test('bala: monotonically non-decreasing', () => {
  let prev = -1
  for (let n = 0; n <= 99; n++) {
    const v = balaFraction(n)
    assert.ok(v >= prev, `decreasing at ${n}`)
    prev = v
  }
})
