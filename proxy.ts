import {NextRequest, NextResponse} from 'next/server'

import {defaultLocale, hasLocale, locales, type Locale} from '@/i18n/routing'

function preferredLocale(request: NextRequest): Locale {
  const preferences = (request.headers.get('accept-language') ?? '')
    .split(',')
    .map((entry) => {
      const [language, ...parameters] = entry.trim().toLowerCase().split(';')
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='))
      const quality = qualityParameter ? Number(qualityParameter.split('=')[1]) : 1
      return {language: language.split('-')[0], quality: Number.isFinite(quality) ? quality : 0}
    })
    .toSorted((a, b) => b.quality - a.quality)

  for (const preference of preferences) {
    if (preference.quality > 0 && hasLocale(preference.language)) return preference.language
  }

  return defaultLocale
}

export function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )

  if (pathnameHasLocale) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${preferredLocale(request)}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!api(?:/|$)|studio(?:/|$)|_next(?:/|$)|.*\\..*).*)'],
}
