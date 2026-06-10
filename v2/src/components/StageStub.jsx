import { useT } from '../i18n/index.js'

// Placeholder stage shell used by S1–S7 until each is built out in later
// phases. Renders the stage title and a Continue control so the full S0→S7
// journey is walkable now.
export default function StageStub({ titleKey, pronoun, next, stage }) {
  const t = useT()
  return (
    <div>
      <span className="fineprint" style={{ color: 'var(--hint)' }}>{stage}</span>
      <h1 style={{ fontSize: 'calc(1.4 * var(--font-base))', color: 'var(--green-deep)', marginTop: 6 }}>
        {t(titleKey, pronoun)}
      </h1>
      <p style={{ color: 'var(--muted)' }}>
        This stage is part of the V2 build and will be filled in by a later phase.
      </p>
      {next && (
        <button onClick={next} style={continueBtn}>{t('app.continue')} →</button>
      )}
    </div>
  )
}

const continueBtn = {
  marginTop: 20, width: '100%', background: 'var(--green-primary)', color: '#fff',
  border: 'none', borderRadius: 'var(--radius)', padding: '15px 0',
  fontSize: 'calc(1.05 * var(--font-base))', fontWeight: 700,
}
