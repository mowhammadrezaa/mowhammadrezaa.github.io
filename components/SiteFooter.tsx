import Link from 'next/link'

const LINKS = [
  {
    label: 'Email',
    dutchLabel: 'E-mail',
    href: 'mailto:m.hosseini.eng@outlook.com',
  },
  {
    label: 'GitHub',
    dutchLabel: 'GitHub',
    href: 'https://github.com/mowhammadrezaa',
  },
  {
    label: 'LinkedIn',
    dutchLabel: 'LinkedIn',
    href: 'https://linkedin.com/in/mohammadreza-hosseini',
  },
  {
    label: 'Contact',
    dutchLabel: 'Contact',
    href: '/contact',
  },
] as const

export function SiteFooter({locale = 'en'}: {locale?: 'nl' | 'en'}) {
  const year = new Date().getFullYear()
  const isDutch = locale === 'nl'

  return (
    <footer className="mt-auto border-t border-black/[0.08] bg-white" data-testid="site-footer">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:items-end md:justify-between md:gap-10 md:px-16 md:py-16 lg:px-32">
        <div className="max-w-md">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
            Mohammadreza Hosseini
          </p>
          <p className="mt-3 font-serif text-2xl tracking-tight text-black md:text-3xl">
            Edge AI / Computer Vision
          </p>
          <p className="mt-3 font-serif text-base leading-relaxed text-gray-600 md:text-lg">
            {isDutch
              ? 'Ik bouw realtime computer-visionsystemen, van modeloptimalisatie tot productie-implementatie.'
              : 'Building real-time vision systems from model optimization to production serving.'}
          </p>
        </div>

        <div className="flex flex-col gap-5 md:items-end">
          <nav
            aria-label={isDutch ? 'Voettekst' : 'Footer'}
            className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end"
          >
            {LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.label === 'Contact' ? `/${locale}#contact` : link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="font-sans text-sm tracking-wide text-gray-500 transition hover:text-black"
              >
                {isDutch ? link.dutchLabel : link.label}
              </Link>
            ))}
          </nav>
          <p className="font-mono text-xs text-gray-400">© {year}</p>
        </div>
      </div>
    </footer>
  )
}
