import '../globals.css'
import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata, Viewport} from 'next'
import {IBM_Plex_Mono, Inter, PT_Serif} from 'next/font/google'
import {defineQuery} from 'next-sanity'
import {VisualEditing} from 'next-sanity/visual-editing'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'
import {Toaster} from 'sonner'

import {AnalyticsConsent} from '@/components/AnalyticsConsent'
import {DraftModeProvider} from '@/components/DraftModeContext'
import {Navbar} from '@/components/Navbar'
import {PersonJsonLd} from '@/components/PersonJsonLd'
import {SiteFooter} from '@/components/SiteFooter'
import {SiteResumeChat} from '@/components/SiteResumeChat'
import {getDictionary} from '@/i18n/dictionaries'
import {getLocaleAlternates, hasLocale, locales, type Locale} from '@/i18n/routing'
import {pageTitleTemplate, SITE_DESCRIPTION, SITE_URL} from '@/lib/site'
import type {SettingsQueryResult} from '@/sanity.types'
import {
  getDynamicFetchOptions,
  liveWaitFor,
  sanityFetch,
  sanityFetchMetadata,
  SanityLive,
  type DynamicFetchOptions,
} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'

import {handleError} from './client-functions'
import {DraftModeToast} from './DraftModeToast'

const serif = PT_Serif({
  variable: '--font-serif',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  weight: ['400', '700'],
})
const sans = Inter({variable: '--font-sans', subsets: ['latin']})
const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['500', '700'],
})
const googleAnalyticsId =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || 'G-VGHHSX3DS9'
const googleAnalyticsEnabled = process.env.NODE_ENV === 'production'

export function generateStaticParams() {
  return locales.map((lang) => ({lang}))
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const {lang} = await params
  if (!hasLocale(lang)) notFound()

  const {perspective} = await getDynamicFetchOptions()
  const layoutMetadataQuery = defineQuery(`{
    "settings": *[_type == "settings" && language in [$language, "nl"]]
      | order(select(language == $language => 0, 1) asc)[0]{ogImage},
    "home": *[_type == "home" && language in [$language, "nl"]]
      | order(select(language == $language => 0, 1) asc)[0]{
      title,
      "overview": pt::text(overview),
    }
  }`)
  const {
    data: {settings, home},
  } = await sanityFetchMetadata({
    query: layoutMetadataQuery,
    params: {language: lang},
    perspective,
  })

  const ogImage = urlForOpenGraphImage(settings?.ogImage)
  return {
    metadataBase: new URL(SITE_URL),
    title: pageTitleTemplate(lang),
    description: home?.overview || SITE_DESCRIPTION[lang],
    alternates: getLocaleAlternates(lang),
    openGraph: {
      title: pageTitleTemplate(lang).default,
      description: home?.overview || SITE_DESCRIPTION[lang],
      images: ogImage ? [ogImage] : [],
      locale: lang === 'nl' ? 'nl_NL' : 'en_US',
      type: 'website',
    },
  }
}

export const viewport: Viewport = {themeColor: '#000'}

export default async function PersonalLayout({children, params}: LayoutProps<'/[lang]'>) {
  const {lang} = await params
  if (!hasLocale(lang)) notFound()

  const {isEnabled: isDraftMode} = await draftMode()
  const dictionary = await getDictionary(lang)
  return (
    <html lang={lang} className={`${mono.variable} ${sans.variable} ${serif.variable}`}>
      <body>
        <PersonJsonLd />
        <DraftModeProvider isDraftMode={isDraftMode}>
          <div className="flex min-h-screen flex-col bg-white text-black">
            {isDraftMode ? (
              <Suspense fallback={<NavbarFallback />}>
                <DynamicNavbar locale={lang} />
              </Suspense>
            ) : (
              <CachedNavbar locale={lang} perspective="published" stega={false} />
            )}
            <div className="mt-20 flex-grow px-4 md:px-16 lg:px-32">{children}</div>
            {isDraftMode ? (
              <Suspense>
                <DynamicFooter locale={lang} />
              </Suspense>
            ) : (
              <CachedFooter locale={lang} perspective="published" stega={false} />
            )}
          </div>
          <Toaster />
          <SanityLive onError={handleError} includeDrafts={isDraftMode} waitFor={liveWaitFor} />
          {isDraftMode && (
            <>
              <DraftModeToast
                locale={lang}
                action={async () => {
                  'use server'

                  const draft = await draftMode()
                  draft.disable()
                  // Simulate a delay to show the loading state
                  await new Promise((resolve) => setTimeout(resolve, 1000))
                }}
              />
              <VisualEditing />
            </>
          )}
          <SpeedInsights />
          <SiteResumeChat locale={lang} />
          <AnalyticsConsent
            gaId={googleAnalyticsId}
            enabled={googleAnalyticsEnabled}
            dictionary={dictionary.cookie}
          />
        </DraftModeProvider>
      </body>
    </html>
  )
}

/**
 * Shared cache leaf — both the navbar and footer derive from the same `settingsQuery`, so
 * neither has to wait independently for the same data.
 */
async function fetchSettings({
  locale,
  perspective,
  stega,
}: DynamicFetchOptions & {locale: Locale}) {
  'use cache'
  const {data} = await sanityFetch({
    query: settingsQuery,
    params: {language: locale},
    perspective,
    stega,
  })
  return data
}

async function DynamicNavbar({locale}: {locale: Locale}) {
  const {perspective, stega} = await getDynamicFetchOptions()
  return <CachedNavbar locale={locale} perspective={perspective} stega={stega} />
}

async function CachedNavbar({
  locale,
  perspective,
  stega,
}: DynamicFetchOptions & {locale: Locale}) {
  'use cache'
  const [data, dictionary] = await Promise.all([
    fetchSettings({locale, perspective, stega}),
    getDictionary(locale),
  ])
  return (
    <Navbar
      data={data as SettingsQueryResult}
      locale={locale}
      dictionary={dictionary.navigation}
    />
  )
}

/**
 * Mirrors the real `<Navbar>` shell so the static fallback occupies the same vertical space.
 * Width of the placeholder link is arbitrary — height is what matters to avoid layout shift.
 */
function NavbarFallback() {
  return (
    <header
      aria-busy
      className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/85 backdrop-blur-md"
      data-testid="site-header"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:gap-6 md:px-16 md:py-5 lg:px-32">
        <span className="font-serif text-xl tracking-tight md:text-2xl" aria-hidden>
          <span className="inline-block h-[1em] w-28 animate-pulse rounded bg-gray-200 align-middle md:w-52" />
        </span>
        <span className="inline-block h-10 w-10 animate-pulse rounded border border-gray-200 xl:hidden" aria-hidden />
        <span className="hidden h-[1em] w-64 animate-pulse rounded bg-gray-100 xl:inline-block" aria-hidden />
      </div>
    </header>
  )
}

async function DynamicFooter({locale}: {locale: Locale}) {
  const {perspective, stega} = await getDynamicFetchOptions()
  return <CachedFooter locale={locale} perspective={perspective} stega={stega} />
}

async function CachedFooter({
  locale,
  perspective,
  stega,
}: DynamicFetchOptions & {locale: Locale}) {
  'use cache'
  // Keep settings fetch so footer revalidates with other shared chrome when content changes.
  await fetchSettings({locale, perspective, stega})
  return <SiteFooter locale={locale} />
}
