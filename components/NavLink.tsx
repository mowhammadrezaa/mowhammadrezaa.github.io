'use client'

import {useEffect, useState} from 'react'
import {usePathname} from 'next/navigation'
import type {ComponentProps, MouseEvent} from 'react'

import {AppLink} from '@/components/AppLink'

type NavLinkProps = ComponentProps<typeof AppLink> & {
  isHome?: boolean
  showUnderline?: boolean
}

function getHash(href: string) {
  const index = href.indexOf('#')
  return index >= 0 ? href.slice(index) : ''
}

export function NavLink({
  isHome = false,
  showUnderline = true,
  className = '',
  children,
  href,
  onClick,
  ...props
}: NavLinkProps) {
  const pathname = usePathname()
  const hrefString = typeof href === 'string' ? href : href.pathname || '/'
  const targetHash = getHash(hrefString)
  const targetPath = hrefString.split('#')[0] || '/'
  const [activeHash, setActiveHash] = useState('')

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash)
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  useEffect(() => {
    if (pathname !== targetPath) return undefined

    const sectionIds = ['about', 'work', 'projects', 'education', 'skills', 'contact']
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .toSorted((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]?.target
        if (top?.id) {
          setActiveHash(`#${top.id}`)
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5],
      },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [pathname, targetPath])

  const isActive = isHome
    ? pathname === targetPath && !activeHash
    : targetHash
      ? pathname === targetPath && activeHash === targetHash
      : pathname === targetPath || pathname.startsWith(`${targetPath}/`)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (!targetHash || !targetHash.startsWith('#')) return

    const id = targetHash.slice(1)
    const onHome = pathname === targetPath
    if (!onHome) return

    const target = document.getElementById(id)
    if (!target) return

    event.preventDefault()
    target.scrollIntoView({behavior: 'smooth', block: 'start'})
    window.history.pushState(null, '', targetHash)
    setActiveHash(targetHash)
  }

  if (isHome) {
    return (
      <AppLink
        href={href}
        className={`font-serif text-xl tracking-tight text-black transition-opacity duration-200 hover:opacity-70 md:text-2xl ${className}`}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented) return
          if (pathname === targetPath) {
            event.preventDefault()
            window.scrollTo({top: 0, behavior: 'smooth'})
            window.history.pushState(null, '', targetPath)
            setActiveHash('')
          }
        }}
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
      onClick={handleClick}
      {...props}
    >
      {children}
      {showUnderline ? (
        <span
          aria-hidden
          className={`absolute inset-x-0 bottom-0 h-px origin-left bg-black transition-transform duration-300 ease-out ${
            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
          }`}
        />
      ) : null}
    </AppLink>
  )
}
