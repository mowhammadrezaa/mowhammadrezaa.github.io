'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'

import {hasLocale, locales, type Locale} from '@/i18n/routing'

export function LanguageSwitcher({locale, label}: {locale: Locale; label: string}) {
  const pathname = usePathname()
  const [hash, setHash] = useState('')

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash)
    updateHash()
    window.addEventListener('hashchange', updateHash)
    return () => window.removeEventListener('hashchange', updateHash)
  }, [])

  const segments = pathname.split('/')
  const pathLocale = segments[1]
  const suffix = hasLocale(pathLocale) ? `/${segments.slice(2).join('/')}`.replace(/\/$/, '') : pathname

  return (
    <nav aria-label={label} className="flex shrink-0 items-center text-xs tracking-wide">
      {locales.map((candidate, index) => (
        <span key={candidate} className="flex items-center">
          {index > 0 ? <span className="px-1 text-black/25">/</span> : null}
          <LocaleLink
            candidate={candidate}
            current={locale}
            href={`/${candidate}${suffix}${hash}`}
          />
        </span>
      ))}
    </nav>
  )
}

function LocaleLink({
  candidate,
  current,
  href,
}: {
  candidate: Locale
  current: Locale
  href: string
}) {
  const active = candidate === current
  return (
    <Link
      href={href}
      hrefLang={candidate}
      aria-current={active ? 'page' : undefined}
      className={active ? 'font-semibold text-black' : 'text-gray-400 transition hover:text-black'}
      scroll={false}
    >
      {candidate.toUpperCase()}
    </Link>
  )
}
