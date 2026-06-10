import { createContext, createContext as _c, useContext, useState, useCallback, createElement } from 'react'
import en from './en.js'
import zh from './zh.js'
import ms from './ms.js'
import ta from './ta.js'

const DICTS = { en, zh, ms, ta }
export const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'zh', label: '中文', name: '中文' },
  { code: 'ms', label: 'BM', name: 'Bahasa Melayu' },
  { code: 'ta', label: 'தமிழ்', name: 'தமிழ்' },
]
// ms/ta are stubs that fall back to en until translated (spec §6, §12).
export const STUB_LANGS = ['ms', 'ta']

const LangContext = createContext(null)

function resolve(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict)
}

// Interpolate {tokens} — including the {mum} pronoun resolved from `vars`.
function interpolate(str, vars) {
  if (typeof str !== 'string' || !vars) return str
  return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
}

export function LangProvider({ children, initial = 'en' }) {
  const [lang, setLang] = useState(initial)

  // t(key, vars?) — looks up `lang`, falls back to `en`, then the key itself.
  const t = useCallback((key, vars) => {
    const primary = resolve(DICTS[lang], key)
    const value = primary !== undefined ? primary : resolve(en, key)
    return interpolate(value !== undefined ? value : key, vars)
  }, [lang])

  return createElement(LangContext.Provider, { value: { lang, setLang, t } }, children)
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within <LangProvider>')
  return ctx
}

// Convenience: just the translate function.
export function useT() {
  return useLang().t
}
