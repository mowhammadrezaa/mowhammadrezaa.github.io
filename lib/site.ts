import type {Locale} from '@/i18n/routing'

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://mowhammadrezaa-github-io.vercel.app'

export const PERSON = {
  name: 'Mohammadreza Hosseini',
  jobTitle: 'Edge AI / Computer Vision Engineer',
  email: 'mailto:m.hosseini.eng@outlook.com',
  telephone: '+31616218039',
  addressCountry: 'NL',
  addressLocality: 'Netherlands',
  sameAs: [
    'https://linkedin.com/in/mohammadreza-hosseini',
    'https://github.com/mowhammadrezaa',
    'https://www.instagram.com/mohammadreza.hosseini.88',
  ],
} as const

export const SITE_TITLE: Record<Locale, string> = {
  en: 'Mohammadreza Hosseini | Edge AI & Computer Vision Engineer',
  nl: 'Mohammadreza Hosseini | Edge AI- en Computer Vision-engineer',
}

export const SITE_DESCRIPTION: Record<Locale, string> = {
  en: 'Portfolio of Mohammadreza Hosseini — Edge AI and Computer Vision engineer building real-time vision systems, from model optimization to production serving on edge devices and Kubernetes.',
  nl: 'Portfolio van Mohammadreza Hosseini — Edge AI- en Computer Vision-engineer gericht op realtime vision-systemen, van modeloptimalisatie tot productie-inferentie op edge-apparaten en Kubernetes.',
}

export const COOKIE_CONSENT_KEY = 'mh-cookie-consent'

export function pageTitleTemplate(locale: Locale) {
  return {
    default: SITE_TITLE[locale],
    template: `%s | ${PERSON.name}`,
  }
}
