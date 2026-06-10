import { useT } from '../i18n/index.js'

// Soft progress copy ("about N more questions") — never "step x of 23" (spec §10).
export default function ProgressHint({ remaining }) {
  const t = useT()
  if (remaining == null) return null
  const label = remaining <= 0
    ? t('app.progressAlmost')
    : t('app.progressMore', { n: remaining, plural: remaining === 1 ? '' : 's' })
  return (
    <div className="fineprint" style={{ color: 'var(--hint)' }}>
      {label}
    </div>
  )
}
