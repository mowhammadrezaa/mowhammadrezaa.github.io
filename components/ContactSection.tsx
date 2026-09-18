import type {InferValue, SanityQueries} from 'next-sanity'

import {CopyButton} from '@/components/CopyButton'
import {CustomPortableText} from '@/components/CustomPortableText'

type PortableValue = InferValue<SanityQueries[keyof SanityQueries]>

type ContactItem = {
  label: string
  display: string
  href: string
  copyValue: string
}

const CONTACT_ITEMS: ContactItem[] = [
  {
    label: 'Email',
    display: 'm.hosseini.eng@outlook.com',
    href: 'mailto:m.hosseini.eng@outlook.com',
    copyValue: 'm.hosseini.eng@outlook.com',
  },
  {
    label: 'Phone',
    display: '+31 6 1621 8039',
    href: 'tel:+31616218039',
    copyValue: '+31616218039',
  },
  {
    label: 'LinkedIn',
    display: 'linkedin.com/in/mohammadreza-hosseini',
    href: 'https://linkedin.com/in/mohammadreza-hosseini',
    copyValue: 'https://linkedin.com/in/mohammadreza-hosseini',
  },
  {
    label: 'GitHub',
    display: 'github.com/mowhammadrezaa',
    href: 'https://github.com/mowhammadrezaa',
    copyValue: 'https://github.com/mowhammadrezaa',
  },
  {
    label: 'Instagram',
    display: 'instagram.com/mohammadreza.hosseini.88',
    href: 'https://www.instagram.com/mohammadreza.hosseini.88',
    copyValue: 'https://www.instagram.com/mohammadreza.hosseini.88',
  },
]

interface ContactSectionProps {
  id: string | null
  type: string | null
  title?: string | null
  overview?: PortableValue | null
  locale?: 'nl' | 'en'
  headingAs?: 'h1' | 'h2'
}

export function ContactSection({
  id,
  type,
  title,
  overview,
  locale = 'en',
  headingAs: Heading = 'h1',
}: ContactSectionProps) {
  const isDutch = locale === 'nl'
  const labels: Record<string, string> = isDutch ? {Email: 'E-mail', Phone: 'Telefoon'} : {}
  return (
    <article className="mx-auto max-w-3xl pb-16 md:pb-24">
      <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
        {isDutch ? 'Neem contact op' : 'Get in touch'}
      </p>
      {title && (
        <Heading
          className="mt-2 font-serif text-4xl tracking-tight text-black md:text-5xl"
          data-testid="page-title"
        >
          {title}
        </Heading>
      )}

      {Array.isArray(overview) && overview.length > 0 && (
        <div className="mt-5 max-w-2xl text-pretty font-serif text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-snug">
          <CustomPortableText
            id={id}
            type={type}
            path={['overview']}
            paragraphClasses="text-inherit"
            value={overview}
            locale={locale}
          />
        </div>
      )}

      <ul className="mt-12 divide-y divide-black/[0.08] border-y border-black/[0.08]">
        {CONTACT_ITEMS.map((item) => (
          <li
            key={item.label}
            className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          >
            <div className="min-w-0">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                {labels[item.label] || item.label}
              </p>
              <a
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="mt-1.5 block truncate font-mono text-sm text-gray-800 transition hover:text-black md:text-[0.95rem]"
              >
                {item.display}
              </a>
            </div>
            <CopyButton
              value={item.copyValue}
              label={labels[item.label] || item.label}
              locale={locale}
            />
          </li>
        ))}
      </ul>

      <aside className="mt-10 border-l-2 border-black pl-5 md:pl-6">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
          {isDutch ? 'Beschikbaarheid' : 'Availability'}
        </p>
        <p className="mt-3 font-serif text-base leading-relaxed text-gray-700 md:text-lg">
          {isDutch
            ? 'Per direct beschikbaar · Bereid te verhuizen · Nederlandse zoekjaarvergunning geldig t/m juli 2027'
            : 'Available immediately · Willing to relocate · Dutch orientation-year permit valid through July 2027'}
        </p>
      </aside>
    </article>
  )
}
