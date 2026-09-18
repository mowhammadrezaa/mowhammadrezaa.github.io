import 'server-only'

import type {Locale} from './routing'

export type NavigationDictionary = {
  primaryLabel: string
  menuOpenLabel: string
  menuCloseLabel: string
  languageLabel: string
  items: Partial<Record<'about' | 'work' | 'projects' | 'education' | 'skills' | 'contact', string>>
}

export type Dictionary = {
  navigation: NavigationDictionary
}

const dictionaries = {
  nl: () => import('./nl').then((module) => module.default),
  en: () => import('./en').then((module) => module.default),
} satisfies Record<Locale, () => Promise<Dictionary>>

export function getDictionary(locale: Locale) {
  return dictionaries[locale]()
}
