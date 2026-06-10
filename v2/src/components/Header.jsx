import { useT, useLang, LANGS, STUB_LANGS } from '../i18n/index.js'

// Persistent header: gov masthead, language toggle, A/A+/A++ text-size toggle.
// (spec §10 senior-UX: text-size toggle in header, language toggle persistent.)
export default function Header({ textSize, onTextSize, onStubLang }) {
  const t = useT()
  const { lang, setLang } = useLang()

  const sizes = [
    ['base', t('app.textSizeBase')],
    ['large', t('app.textSizeLarge')],
    ['xlarge', t('app.textSizeXlarge')],
  ]

  function pickLang(code) {
    setLang(code)
    if (STUB_LANGS.includes(code)) onStubLang?.()
  }

  return (
    <header>
      <div className="masthead" style={mastheadStyle}>
        🏛 {t('app.masthead')}
      </div>
      <div style={barStyle}>
        <span style={{ fontWeight: 700, color: 'var(--green-deep)' }}>{t('app.title')}</span>
        <div style={{ flex: 1 }} />

        {/* Language toggle */}
        <div role="group" aria-label={t('app.langName')} style={groupStyle}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => pickLang(l.code)}
              aria-pressed={lang === l.code}
              style={toggleBtn(lang === l.code)}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Text-size toggle */}
        <div role="group" aria-label={t('app.textSize')} style={{ ...groupStyle, marginLeft: 8 }}>
          {sizes.map(([key, label], i) => (
            <button key={key} onClick={() => onTextSize(key)}
              aria-pressed={textSize === key}
              style={{ ...toggleBtn(textSize === key), fontSize: `${0.78 + i * 0.12}em`, fontWeight: 700 }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}

const mastheadStyle = {
  background: '#EFEFEF', color: '#484848', fontSize: '12px',
  padding: '6px 16px', borderBottom: '1px solid #E2E2E2',
}
const barStyle = {
  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
  padding: '10px 16px', background: 'var(--paper)', borderBottom: '1px solid var(--line)',
  position: 'sticky', top: 0, zIndex: 50,
}
const groupStyle = { display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }
function toggleBtn(active) {
  return {
    border: 'none', background: active ? 'var(--green-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--muted)', padding: '6px 10px', minHeight: 36,
    fontSize: '13px', lineHeight: 1,
  }
}
