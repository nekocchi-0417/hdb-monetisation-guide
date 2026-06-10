import { useState } from 'react'
import { useT } from '../i18n/index.js'
import { loadMyinfoMock } from '../logic/myinfoMock.js'

// S0 — set mode + relationship, establish trust, optional Singpass mock.
export default function S0Entry({ profile, update, next }) {
  const t = useT()
  const [mode, setMode] = useState(profile.mode)
  const [relationship, setRelationship] = useState(profile.relationship)
  const [demo, setDemo] = useState(false)

  const needsRelationship = mode === 'helper'
  const canStart = mode && (!needsRelationship || relationship)

  function start() {
    if (!canStart) return
    update({ mode, relationship: needsRelationship ? relationship : null })
    next()
  }

  function useSingpass() {
    const fixture = loadMyinfoMock()
    update(fixture)
    setDemo(true)
  }

  const modes = [
    ['self', t('s0.modeSelf')],
    ['helper', t('s0.modeHelper')],
    ['advisor', t('s0.modeAdvisor')],
  ]
  const rels = [
    ['mum', t('s0.relMum')],
    ['dad', t('s0.relDad')],
    ['other', t('s0.relOther')],
  ]

  return (
    <div>
      <p className="eyebrow" style={eyebrow}>{t('s0.eyebrow')}</p>
      <h1 style={{ fontSize: 'calc(1.5 * var(--font-base))', color: 'var(--green-deep)' }}>{t('s0.title')}</h1>
      <p style={{ color: 'var(--muted)', maxWidth: '54ch' }}>{t('s0.sub')}</p>

      <h2 style={h2} id="mode-heading">{t('s0.modeHeading')}</h2>
      <div role="radiogroup" aria-labelledby="mode-heading" style={{ display: 'grid', gap: 12 }}>
        {modes.map(([val, label]) => (
          <button key={val} role="radio" aria-checked={mode === val}
            onClick={() => { setMode(val); if (val !== 'helper') setRelationship(null) }}
            style={card(mode === val)}>
            {label}
          </button>
        ))}
      </div>

      {needsRelationship && (
        <>
          <h2 style={h2} id="rel-heading">{t('s0.relationshipHeading')}</h2>
          <div role="radiogroup" aria-labelledby="rel-heading" style={{ display: 'grid', gap: 12 }}>
            {rels.map(([val, label]) => (
              <button key={val} role="radio" aria-checked={relationship === val}
                onClick={() => setRelationship(val)} style={card(relationship === val)}>
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Singpass mock (spec §6 S0) */}
      <div style={singpassRow}>
        <span style={{ flex: 1, fontSize: 'calc(0.9 * var(--font-base))' }}>{t('s0.singpassOptional')}</span>
        <button onClick={useSingpass} style={singpassBtn}>
          Singpass{demo && <span style={demoBadge}>{t('s0.singpassDemo')}</span>}
        </button>
      </div>

      <button onClick={start} disabled={!canStart} style={{ ...startBtn, opacity: canStart ? 1 : 0.45 }}>
        {t('s0.start')} →
      </button>

      <p className="fineprint" style={{ marginTop: 18 }}>🔒 {t('s0.privacy')}</p>
    </div>
  )
}

const eyebrow = { fontSize: '12px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green-primary)', fontWeight: 700, margin: '0 0 6px' }
const h2 = { fontSize: 'calc(1.05 * var(--font-base))', margin: '26px 0 12px', color: 'var(--ink)' }
function card(active) {
  return {
    minHeight: 'var(--card-min)', textAlign: 'left', padding: '16px 18px',
    border: `2px solid ${active ? 'var(--green-primary)' : 'var(--line)'}`,
    background: active ? 'var(--green-tint)' : 'var(--paper)',
    color: active ? 'var(--green-deep)' : 'var(--ink)', borderRadius: 'var(--radius)',
    fontWeight: 600,
  }
}
const singpassRow = { display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, padding: '12px 14px', background: 'var(--info-tint)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }
const singpassBtn = { background: 'var(--singpass-red)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }
const demoBadge = { background: 'rgba(255,255,255,.25)', borderRadius: 4, fontSize: '11px', padding: '1px 5px' }
const startBtn = { marginTop: 22, width: '100%', background: 'var(--green-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '15px 0', fontSize: 'calc(1.05 * var(--font-base))', fontWeight: 700 }
