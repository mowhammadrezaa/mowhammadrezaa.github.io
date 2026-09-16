'use client'

import {usePathname} from 'next/navigation'
import type {ComponentProps} from 'react'

import {AppLink} from '@/components/AppLink'

type NavLinkProps = ComponentProps<typeof AppLink> & {
  isHome?: boolean
}

export function NavLink({isHome = false, className = '', children, href, ...props}: NavLinkProps) {
  const pathname = usePathname()
  const hrefString = typeof href === 'string' ? href : href.pathname || '/'
  const isActive = isHome
    ? pathname === '/'
    : pathname === hrefString || pathname.startsWith(`${hrefString}/`)

  if (isHome) {
    return (
      <AppLink
        href={href}
        className={`font-serif text-xl tracking-tight text-black transition-opacity duration-200 hover:opacity-70 md:text-2xl ${className}`}
        {...props}
      >
        {children}
      </AppLink>
    )
  }

  return (
    <AppLink
      href={href}
      className={`group relative shrink-0 pb-1 text-sm tracking-wide text-gray-500 transition-colors duration-200 hover:text-black md:text-[0.95rem] ${
        isActive ? 'text-black' : ''
      } ${className}`}
      {...props}
    >
      {children}
      <span
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-px origin-left bg-black transition-transform duration-300 ease-out ${
          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </AppLink>
  )
}
