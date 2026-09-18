import {createDataAttribute, stegaClean} from 'next-sanity'

import {LanguageSwitcher} from '@/components/LanguageSwitcher'
import {MobileNav, type MobileNavItem} from '@/components/MobileNav'
import {NavLink} from '@/components/NavLink'
import {OptimisticSortOrder} from '@/components/OptimisticSortOrder'
import type {NavigationDictionary} from '@/i18n/dictionaries'
import {localizeHref, type Locale} from '@/i18n/routing'
import type {SettingsQueryResult} from '@/sanity.types'
import {studioUrl} from '@/sanity/lib/api'
import {resolveHref} from '@/sanity/lib/utils'

interface NavbarProps {
  data: SettingsQueryResult
  locale: Locale
  dictionary: NavigationDictionary
}

function shortBrandName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) return name
  return `${parts[0][0]}. ${parts[parts.length - 1]}`
}

/** Point primary nav at home-section anchors so content is scrollable on `/`. */
function toSectionHref(locale: Locale, documentType?: string | null, slug?: string | null) {
  const href = resolveHref(documentType || undefined, slug, locale)
  if (!href) return undefined
  if (documentType === 'page' && slug) return `/${locale}#${slug}`
  return localizeHref(href, locale)
}

function navTestId(href: string) {
  if (href.includes('#')) return `nav-link-${href.split('#')[1]}`
  return `nav-link${href.replaceAll('/', '-')}`
}

export function Navbar(props: NavbarProps) {
  const {data, locale, dictionary} = props
  const dataAttribute =
    data?._id && data?._type
      ? createDataAttribute({
          baseUrl: studioUrl,
          id: data._id,
          type: data._type,
        })
      : null

  const menuItems = data?.menuItems ?? []
  const homeItem = menuItems.find((item) => item?._type === 'home')
  const navItems = menuItems.filter((item) => item?._type !== 'home')

  const homeHref = localizeHref(
    homeItem ? resolveHref(homeItem._type, homeItem.slug, locale) || '/' : '/',
    locale,
  )
  const brandName = homeItem
    ? stegaClean(homeItem.title) || 'Mohammadreza Hosseini'
    : 'Mohammadreza Hosseini'
  const brandShort = shortBrandName(brandName)

  const mobileItems: MobileNavItem[] = navItems.flatMap((menuItem) => {
    const href = toSectionHref(locale, menuItem?._type, menuItem?.slug)
    if (!href || !menuItem._key) return []
    const slug = stegaClean(menuItem.slug || '')
    return [
      {
        key: menuItem._key,
        href,
        title:
          (slug && dictionary.items[slug]) ||
          stegaClean(menuItem.title) ||
          href,
        prefetch: true,
        sanityAttr: dataAttribute?.(['menuItems', {_key: menuItem._key}]),
      },
    ]
  })

  return (
    <header
      className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/85 backdrop-blur-md"
      style={{['--site-header-height' as string]: '4.25rem'}}
      data-sanity={dataAttribute?.('menuItems')}
      data-testid="site-header"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:gap-6 md:px-16 md:py-5 lg:px-32">
        {homeItem && homeHref ? (
          <NavLink
            isHome
            href={homeHref}
            prefetch={undefined}
            className="min-w-0 shrink"
            data-sanity={dataAttribute?.(['menuItems', {_key: homeItem._key as unknown as string}])}
            data-testid="nav-link-home"
          >
            <span className="xl:hidden">{brandShort}</span>
            <span className="hidden xl:inline">{brandName}</span>
          </NavLink>
        ) : (
          <span className="min-w-0 shrink font-serif text-xl tracking-tight text-black md:text-2xl">
            <span className="xl:hidden">{brandShort}</span>
            <span className="hidden xl:inline">{brandName}</span>
          </span>
        )}

        <nav
          aria-label={dictionary.primaryLabel}
          className="hidden min-w-0 items-center gap-x-3 xl:flex xl:gap-x-4"
        >
          <OptimisticSortOrder id={data?._id} path="menuItems">
            {navItems.map((menuItem) => {
              const href = toSectionHref(locale, menuItem?._type, menuItem?.slug)
              if (!href) {
                return null
              }
              const slug = stegaClean(menuItem.slug || '')
              return (
                <NavLink
                  key={menuItem._key}
                  prefetch
                  href={href}
                  data-sanity={dataAttribute?.([
                    'menuItems',
                    {_key: menuItem._key as unknown as string},
                  ])}
                  data-testid={navTestId(href)}
                >
                  {(slug && dictionary.items[slug]) ||
                    stegaClean(menuItem.title)}
                </NavLink>
              )
            })}
          </OptimisticSortOrder>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} label={dictionary.languageLabel} />
          <MobileNav
            items={mobileItems}
            primaryLabel={dictionary.primaryLabel}
            openLabel={dictionary.menuOpenLabel}
            closeLabel={dictionary.menuCloseLabel}
          />
        </div>
      </div>
    </header>
  )
}
