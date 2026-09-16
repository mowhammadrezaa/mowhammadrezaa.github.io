'use client'

import {useEffect, useId, useState} from 'react'
import {usePathname} from 'next/navigation'

import {NavLink} from '@/components/NavLink'

export type MobileNavItem = {
  key: string
  href: string
  title: string
  prefetch?: boolean
  sanityAttr?: string
}

function navTestId(href: string) {
  if (href.startsWith('/#')) return `nav-link-${href.slice(2)}`
  return `nav-link${href.replaceAll('/', '-')}`
}

export function MobileNav({items}: {items: MobileNavItem[]}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelId = useId()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center border border-black/15 text-black transition hover:border-black/40"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div className="fixed inset-0 top-[var(--site-header-height,4.5rem)] z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/20"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav
            id={panelId}
            aria-label="Primary"
            className="absolute inset-x-0 top-0 border-b border-black/10 bg-white px-4 py-3 shadow-sm"
          >
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.key}>
                  <NavLink
                    href={item.href}
                    prefetch={item.prefetch}
                    data-sanity={item.sanityAttr}
                    data-testid={navTestId(item.href)}
                    showUnderline={false}
                    className="block w-full border-b border-black/[0.06] !pb-3.5 py-3.5 text-base tracking-wide last:border-b-0"
                    onClick={() => setOpen(false)}
                  >
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
