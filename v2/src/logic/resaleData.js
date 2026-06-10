// Live resale-price estimates from data.gov.sg, ported from V1 `fetchEstimates`.
// Returns { median, txCount, town, windowMonths, flatType, source, live } so the
// UI can cite "based on N transactions in {town}" (spec §3.1, §6 S6). Degrades
// to a cached fallback table with live:false when the API is unavailable (§13).
const RESOURCE_ID = 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc'
const API = `https://data.gov.sg/api/action/datastore_search?resource_id=${RESOURCE_ID}&limit=100&sort=month%20desc&filters=`
const WINDOW_MONTHS = 6

export const HDB_TOWNS = ['ANG MO KIO', 'BEDOK', 'BISHAN', 'BUKIT BATOK', 'BUKIT MERAH', 'BUKIT PANJANG', 'BUKIT TIMAH', 'CENTRAL AREA', 'CHOA CHU KANG', 'CLEMENTI', 'GEYLANG', 'HOUGANG', 'JURONG EAST', 'JURONG WEST', 'KALLANG/WHAMPOA', 'MARINE PARADE', 'PASIR RIS', 'PUNGGOL', 'QUEENSTOWN', 'SEMBAWANG', 'SENGKANG', 'SERANGOON', 'TAMPINES', 'TOA PAYOH', 'WOODLANDS', 'YISHUN']

// Map our flat-type codes to the data.gov.sg `flat_type` values.
const FLAT_API = { '2R': '2 ROOM', '3R': '3 ROOM', '4R': '4 ROOM', '5R+': '5 ROOM', exec: 'EXECUTIVE' }

// Conservative island-wide median fallback (S$) when the API is unavailable.
// Indicative only — clearly labelled live:false in the UI. TODO: refresh periodically.
const FALLBACK_MEDIANS = { '2R': 290000, '3R': 380000, '4R': 540000, '5R+': 660000, exec: 760000 }

const median = (arr) => {
  const s = arr.filter(Number.isFinite).sort((a, b) => a - b)
  return s.length ? s[Math.floor(s.length / 2)] : null
}

function cutoffMonth(now = new Date()) {
  const d = new Date(now)
  d.setMonth(d.getMonth() - WINDOW_MONTHS)
  return d.toISOString().slice(0, 7)
}

async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const r = await fetch(url)
    if (r.status === 429) {
      if (i < retries) { await new Promise(res => setTimeout(res, 2000 * (i + 1))); continue }
      throw new Error('Rate limited (429) — please wait a moment and try again')
    }
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const d = await r.json()
    if (!d.success) throw new Error(d.error?.message || 'API error')
    return d
  }
}

// Fetch the median resale price for one flat type in one town.
// leaseTarget (optional) narrows to transactions within ±10 years of that lease.
export async function fetchResaleMedian(flatType, town, leaseTarget = 0) {
  const apiType = FLAT_API[flatType] || '4 ROOM'
  try {
    const d = await fetchWithRetry(API + encodeURIComponent(JSON.stringify({ flat_type: apiType, town })))
    const records = d.result.records || []
    const cutoff = cutoffMonth()
    let recent = records.filter(rec => rec.month >= cutoff)
    if (recent.length < 5) recent = records
    if (leaseTarget) {
      const nearby = recent.filter(rec => Math.abs(parseInt(rec.remaining_lease) - leaseTarget) <= 10)
      if (nearby.length >= 5) recent = nearby
    }
    const med = median(recent.map(r => parseInt(r.resale_price)))
    if (med == null) throw new Error('no records')
    return { median: med, txCount: recent.length, town, windowMonths: WINDOW_MONTHS, flatType, source: 'data.gov.sg', live: true }
  } catch (e) {
    return {
      median: FALLBACK_MEDIANS[flatType] ?? FALLBACK_MEDIANS['4R'],
      txCount: 0, town, windowMonths: WINDOW_MONTHS, flatType,
      source: 'cached estimate', live: false, error: e.message,
    }
  }
}
