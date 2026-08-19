// ui/src/i18n.parity.test.ts
//
// The one thing that catches a missing locale key: locale modules are typed
// as Partial<Record<TranslationKey, string>>, so a missing key passes both
// `tsc --noEmit` and `vite build` silently (BombVault burned this exact gap
// once - see the translate-all-locales-immediately convention). This asserts
// every locale's key set is IDENTICAL to en's, both directions - not just "no
// missing keys" but also "no stray keys a rename left behind".

import { describe, expect, it } from 'vitest'
import { de, en, LOCALES, type Translations } from './i18n'

import ar from './locales/ar'
import cs from './locales/cs'
import da from './locales/da'
import el from './locales/el'
import es from './locales/es'
import fi from './locales/fi'
import fr from './locales/fr'
import he from './locales/he'
import hu from './locales/hu'
import itLocale from './locales/it'
import ja from './locales/ja'
import ko from './locales/ko'
import nl from './locales/nl'
import no from './locales/no'
import pl from './locales/pl'
import pt from './locales/pt'
import ro from './locales/ro'
import ru from './locales/ru'
import sv from './locales/sv'
import th from './locales/th'
import tr from './locales/tr'
import uk from './locales/uk'
import vi from './locales/vi'
import zh from './locales/zh'

const LAZY_DICTS: Record<string, Translations> = {
  fr,
  es,
  it: itLocale,
  pt,
  nl,
  pl,
  ru,
  uk,
  cs,
  sv,
  da,
  fi,
  no,
  tr,
  el,
  hu,
  ro,
  ja,
  ko,
  zh,
  ar,
  he,
  th,
  vi,
}

const enKeys = Object.keys(en).sort()

describe('i18n locale parity', () => {
  it('LOCALES lists exactly 26 entries, matching en+de plus the 24 lazy locales', () => {
    expect(LOCALES).toHaveLength(26)
  })

  it('de (inline, source language) carries every en key and no extra ones', () => {
    expect(Object.keys(de).sort()).toEqual(enKeys)
  })

  for (const locale of LOCALES) {
    if (locale.code === 'en' || locale.code === 'de') continue
    const dict = LAZY_DICTS[locale.code]

    it(`${locale.code} carries every en key and no extra ones`, () => {
      expect(dict).toBeDefined()
      expect(Object.keys(dict as Translations).sort()).toEqual(enKeys)
    })

    it(`${locale.code} has no empty translated values`, () => {
      for (const [key, value] of Object.entries(dict as Translations)) {
        expect(value, `${locale.code}["${key}"] must not be empty`).not.toBe('')
      }
    })
  }
})
