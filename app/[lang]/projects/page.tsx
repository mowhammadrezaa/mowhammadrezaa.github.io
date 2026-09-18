import type {Metadata} from 'next'
import {defineQuery} from 'next-sanity'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'

import {ProjectsSection} from '@/components/ProjectsSection'
import {getLocaleAlternates, hasLocale, type Locale} from '@/i18n/routing'
import {
  getDynamicFetchOptions,
  sanityFetch,
  sanityFetchMetadata,
  type DynamicFetchOptions,
} from '@/sanity/lib/live'

const projectsPageMetadataQuery = defineQuery(`
    *[_type == "page" && slug.current == "projects" && language in [$language, "nl"]]
      | order(select(language == $language => 0, 1) asc)[0] {
      title,
      "overview": pt::text(overview),
    }
  `)

const projectsPageQuery = defineQuery(`
    *[_type == "page" && slug.current == "projects" && language in [$language, "nl"]]
      | order(select(language == $language => 0, 1) asc)[0] {
      _id,
      _type,
      overview,
      title,
    }
  `)

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/projects'>): Promise<Metadata> {
  const {lang} = await params
  if (!hasLocale(lang)) notFound()

  const {perspective} = await getDynamicFetchOptions()
  const {data} = await sanityFetchMetadata({
    query: projectsPageMetadataQuery,
    params: {language: lang},
    perspective,
  })
  return {
    title: data?.title || (lang === 'nl' ? 'Projecten' : 'Projects'),
    description:
      data?.overview ||
      (lang === 'nl'
        ? 'Geselecteerd werk op het gebied van Edge AI, computer vision en productontwikkeling — van realtime pijplijnen tot full-stack oplevering.'
        : 'Selected Edge AI, computer vision, and product work — from real-time pipelines to full-stack delivery.'),
    alternates: getLocaleAlternates(lang, '/projects'),
  }
}

export default async function ProjectsIndexPage({params}: PageProps<'/[lang]/projects'>) {
  const {lang} = await params
  if (!hasLocale(lang)) notFound()

  const {isEnabled: isDraftMode} = await draftMode()
  if (!isDraftMode) {
    return <CachedProjectsIndex locale={lang} perspective="published" stega={false} />
  }
  return (
    <Suspense>
      <DynamicProjectsIndex locale={lang} />
    </Suspense>
  )
}

async function DynamicProjectsIndex({locale}: {locale: Locale}) {
  const {perspective, stega} = await getDynamicFetchOptions()
  return <CachedProjectsIndex locale={locale} perspective={perspective} stega={stega} />
}

async function CachedProjectsIndex({
  locale,
  perspective,
  stega,
}: DynamicFetchOptions & {locale: Locale}) {
  'use cache'
  const {data} = await sanityFetch({
    query: projectsPageQuery,
    params: {language: locale},
    perspective,
    stega,
  })

  return (
    <ProjectsSection
      id={data?._id || null}
      type={data?._type || null}
      title={data?.title || (locale === 'nl' ? 'Projecten' : 'Projects')}
      overview={data?.overview}
      locale={locale}
      perspective={perspective}
      stega={stega}
    />
  )
}
