import type {Metadata} from 'next'

export const locales = ['nl', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'nl'

export function hasLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value)
}

export function localePath(locale: Locale, path = '/') {
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  return `/${locale}${normalizedPath}`
}

export function localizeHref(href: string, locale: Locale) {
  if (!href.startsWith('/') || href.startsWith('//')) return href

  const [path, hash] = href.split('#', 2)
  const firstSegment = path.split('/')[1]
  const localizedPath = firstSegment && hasLocale(firstSegment) ? path : localePath(locale, path)
  return hash === undefined ? localizedPath : `${localizedPath}#${hash}`
}

export function getLocaleAlternates(locale: Locale, path = '/'): Metadata['alternates'] {
  return {
    canonical: localePath(locale, path),
    languages: {
      nl: localePath('nl', path),
      en: localePath('en', path),
      'x-default': localePath(defaultLocale, path),
    },
  }
}
