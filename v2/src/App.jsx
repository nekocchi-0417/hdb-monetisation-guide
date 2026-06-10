import { useState, useEffect, useMemo } from 'react'
import { useT } from './i18n/index.js'
import { initialProfile, STAGES, makePronoun } from './logic/profile.js'

import Header from './components/Header.jsx'
import ProgressHint from './components/ProgressHint.jsx'

import S0Entry from './stages/S0Entry.jsx'
import S1Goal from './stages/S1Goal.jsx'
import S2Income from './stages/S2Income.jsx'
import S3Gap from './stages/S3Gap.jsx'
import S4Values from './stages/S4Values.jsx'
import S5Eligibility from './stages/S5Eligibility.jsx'
import S6Results from './stages/S6Results.jsx'
import S7Summary from './stages/S7Summary.jsx'

const STAGE_COMPONENTS = {
  S0: S0Entry, S1: S1Goal, S2: S2Income, S3: S3Gap,
  S4: S4Values, S5: S5Eligibility, S6: S6Results, S7: S7Summary,
}

export default function App() {
  const t = useT()
  const [profile, setProfile] = useState(initialProfile)
  const [index, setIndex] = useState(0)
  const [history, setHistory] = useState([])
  const [textSize, setTextSize] = useState('base')
  const [toast, setToast] = useState(null)

  // Apply the A/A+/A++ scale to the document root.
  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', textSize)
  }, [textSize])

  const stage = STAGES[index]
  const Stage = STAGE_COMPONENTS[stage]
  const pronoun = useMemo(() => makePronoun(profile, t), [profile.mode, profile.relationship, t])

  function update(partial) {
    setProfile(p => ({ ...p, ...partial }))
  }
  function next() {
    setHistory(h => [...h, index])
    setIndex(i => Math.min(i + 1, STAGES.length - 1))
    window.scrollTo({ top: 0 })
  }
  function back() {
    if (!history.length) return
    setIndex(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
    window.scrollTo({ top: 0 })
  }
  function restart() {
    if (!window.confirm(t('app.restartConfirm'))) return
    setProfile(initialProfile())
    setHistory([])
    setIndex(0)
  }

  function showStubToast() {
    setToast(t('app.stubToast'))
    window.setTimeout(() => setToast(null), 4000)
  }

  // Soft progress: questions remaining until results (S6). Hidden on S0/S6/S7.
  const remaining = (index === 0 || stage === 'S6' || stage === 'S7')
    ? null
    : Math.max(0, STAGES.indexOf('S6') - index)

  return (
    <>
      <Header textSize={textSize} onTextSize={setTextSize} onStubLang={showStubToast} />

      {toast && (
        <div role="status" style={toastStyle}>{toast}</div>
      )}

      <main style={mainStyle}>
        {(history.length > 0 || remaining != null) && (
          <div style={navRow} className="no-print">
            {history.length > 0
              ? <button onClick={back} style={backBtn}>← {t('app.back')}</button>
              : <span />}
            <ProgressHint remaining={remaining} />
          </div>
        )}

        <Stage profile={profile} update={update} next={next} back={back} pronoun={pronoun} />

        {index > 0 && (
          <div style={{ marginTop: 28, textAlign: 'center' }} className="no-print">
            <button onClick={restart} style={restartLink}>{t('app.restart')}</button>
          </div>
        )}
      </main>
    </>
  )
}

const mainStyle = { maxWidth: 'var(--maxw)', margin: '0 auto', padding: '20px 16px 64px' }
const navRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, minHeight: 36 }
const backBtn = { background: 'var(--green-tint)', border: '1px solid var(--line)', color: 'var(--green-dark)', borderRadius: 8, padding: '6px 14px', fontSize: '14px', fontWeight: 600, minHeight: 36 }
const restartLink = { background: 'none', border: 'none', color: 'var(--hint)', textDecoration: 'underline', fontSize: '14px' }
const toastStyle = { position: 'sticky', top: 0, zIndex: 60, background: 'var(--info-text)', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: '14px' }
