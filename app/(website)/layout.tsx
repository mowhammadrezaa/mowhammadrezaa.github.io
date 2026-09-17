import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata, Viewport} from 'next'
import {defineQuery} from 'next-sanity'
import {VisualEditing} from 'next-sanity/visual-editing'
import {draftMode} from 'next/headers'
import {Suspense} from 'react'
import {Toaster} from 'sonner'

import {DraftModeProvider} from '@/components/DraftModeContext'
import {Navbar} from '@/components/Navbar'
import {SiteFooter} from '@/components/SiteFooter'
import {SiteResumeChat} from '@/components/SiteResumeChat'
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

export async function generateMetadata(): Promise<Metadata> {
  const {perspective} = await getDynamicFetchOptions()
  const layoutMetadataQuery = defineQuery(`{
    "settings": *[_type == "settings"][0]{ogImage},
    "home": *[_type == "home"][0]{
      title,
      "overview": pt::text(overview),
    }
  }`)
  const {
    data: {settings, home},
  } = await sanityFetchMetadata({query: layoutMetadataQuery, perspective})

  const ogImage = urlForOpenGraphImage(settings?.ogImage)
  return {
    title: home?.title
      ? {template: `%s | ${home.title}`, default: home.title || 'Personal website'}
      : undefined,
    description: home?.overview,
    openGraph: {images: ogImage ? [ogImage] : []},
  }
}

export const viewport: Viewport = {themeColor: '#000'}

export default async function PersonalLayout({children}: LayoutProps<'/'>) {
  const {isEnabled: isDraftMode} = await draftMode()
  return (
    <DraftModeProvider isDraftMode={isDraftMode}>
      <div className="flex min-h-screen flex-col bg-white text-black">
        {isDraftMode ? (
          <Suspense fallback={<NavbarFallback />}>
            <DynamicNavbar />
          </Suspense>
        ) : (
          <CachedNavbar perspective="published" stega={false} />
        )}
        <div className="mt-20 flex-grow px-4 md:px-16 lg:px-32">{children}</div>
        {isDraftMode ? (
          <Suspense>
            <DynamicFooter />
          </Suspense>
        ) : (
          <CachedFooter perspective="published" stega={false} />
        )}
      </div>
      <Toaster />
      <SanityLive onError={handleError} includeDrafts={isDraftMode} waitFor={liveWaitFor} />
      {isDraftMode && (
        <>
          <DraftModeToast
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
      <SiteResumeChat />
    </DraftModeProvider>
  )
}

/**
 * Shared cache leaf — both the navbar and footer derive from the same `settingsQuery`, so
 * neither has to wait independently for the same data.
 */
async function fetchSettings({perspective, stega}: DynamicFetchOptions) {
  'use cache'
  const {data} = await sanityFetch({query: settingsQuery, perspective, stega})
  return data
}

async function DynamicNavbar() {
  const {perspective, stega} = await getDynamicFetchOptions()
  return <CachedNavbar perspective={perspective} stega={stega} />
}

async function CachedNavbar({perspective, stega}: DynamicFetchOptions) {
  'use cache'
  const data = await fetchSettings({perspective, stega})
  return <Navbar data={data} />
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
        <span className="inline-block h-10 w-10 animate-pulse rounded border border-gray-200 lg:hidden" aria-hidden />
        <span className="hidden h-[1em] w-64 animate-pulse rounded bg-gray-100 lg:inline-block" aria-hidden />
      </div>
    </header>
  )
}

async function DynamicFooter() {
  const {perspective, stega} = await getDynamicFetchOptions()
  return <CachedFooter perspective={perspective} stega={stega} />
}

async function CachedFooter({perspective, stega}: DynamicFetchOptions) {
  'use cache'
  // Keep settings fetch so footer revalidates with other shared chrome when content changes.
  await fetchSettings({perspective, stega})
  return <SiteFooter />
}
