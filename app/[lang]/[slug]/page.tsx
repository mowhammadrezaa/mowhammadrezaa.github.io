import type {Metadata, ResolvingMetadata} from 'next'
import {defineQuery} from 'next-sanity'
import {notFound} from 'next/navigation'

import {AboutSection} from '@/components/AboutSection'
import {ContactSection} from '@/components/ContactSection'
import {CustomPortableText} from '@/components/CustomPortableText'
import {Header} from '@/components/Header'
import {SkillsSection} from '@/components/SkillsSection'
import {getLocaleAlternates, hasLocale, type Locale} from '@/i18n/routing'
import {
  getDynamicFetchOptions,
  sanityFetch,
  sanityFetchMetadata,
  sanityFetchStaticParams,
  type DynamicFetchOptions,
} from '@/sanity/lib/live'
import {slugsByTypeQuery, type SlugsByTypeQueryParams} from '@/sanity/lib/queries'

export async function generateStaticParams({
  params: parentParams,
}: {
  params: {lang: string}
}): Promise<Array<{slug: string}>> {
  if (!hasLocale(parentParams.lang)) return [{slug: '__placeholder__'}]

  const {data} = await sanityFetchStaticParams({
    query: slugsByTypeQuery,
    params: {
      language: parentParams.lang,
      type: 'page',
    } satisfies SlugsByTypeQueryParams,
  })
  const params = Array.from(
    new Set(data.filter((entry) => entry.slug !== 'projects').map((entry) => entry.slug)),
    (slug) => ({slug}),
  )
  if (params.length > 0) {
    return params.flatMap(({slug}) => (slug ? [{slug}] : []))
  }
  // Cache Components requires `generateStaticParams` to return at least one param — an empty
  // array fails the build (https://nextjs.org/docs/messages/empty-generate-static-params).
  // With no page documents in the dataset yet, prerender a placeholder slug that resolves to
  // the 404 page instead.
  return [{slug: '__placeholder__'}]
}

export async function generateMetadata(
  {params}: PageProps<'/[lang]/[slug]'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const [{lang, slug}, {perspective}] = await Promise.all([params, getDynamicFetchOptions()])
  if (!hasLocale(lang)) notFound()

  const slugPageMetadataQuery = defineQuery(`
    *[
      _type == "page" &&
      slug.current == $slug &&
      language in [$language, "nl"]
    ] | order(select(language == $language => 0, 1) asc)[0] {
      title,
      "overview": pt::text(overview),
    }
  `)
  const {data} = await sanityFetchMetadata({
    query: slugPageMetadataQuery,
    params: {language: lang, slug},
    perspective,
  })

  return {
    title: data?.title,
    description: data?.overview || (await parent).description,
    alternates: getLocaleAlternates(lang, `/${slug}`),
  }
}

export default async function SlugPage({params}: PageProps<'/[lang]/[slug]'>) {
  const [{lang, slug}, {perspective, stega}] = await Promise.all([
    params,
    getDynamicFetchOptions(),
  ])
  if (!hasLocale(lang)) notFound()

  return <CachedSlugPage locale={lang} slug={slug} perspective={perspective} stega={stega} />
}

async function CachedSlugPage({
  locale,
  slug,
  perspective,
  stega,
}: {locale: Locale; slug: string} & DynamicFetchOptions) {
  'use cache'
  const slugPageQuery = defineQuery(`
    *[
      _type == "page" &&
      slug.current == $slug &&
      language in [$language, "nl"]
    ] | order(select(language == $language => 0, 1) asc)[0] {
      _id,
      _type,
      body,
      overview,
      title,
      "slug": slug.current,
    }
  `)
  const {data} = await sanityFetch({
    query: slugPageQuery,
    params: {language: locale, slug},
    perspective,
    stega,
  })

  if (!data?._id) notFound()

  const {body, overview, title, slug: pageSlug} = data ?? {}

  if (pageSlug === 'about') {
    return (
      <AboutSection
        id={data?._id || null}
        type={data?._type || null}
        title={title}
        overview={overview}
        body={body}
        locale={locale}
      />
    )
  }

  if (pageSlug === 'contact') {
    return (
      <ContactSection
        id={data?._id || null}
        type={data?._type || null}
        title={title}
        overview={overview}
        locale={locale}
      />
    )
  }

  if (pageSlug === 'skills') {
    return (
      <SkillsSection
        id={data?._id || null}
        type={data?._type || null}
        title={title}
        overview={overview}
        locale={locale}
      />
    )
  }

  return (
    <>
      {/* Header */}
      <Header
        id={data?._id || null}
        type={data?._type || null}
        path={['overview']}
        title={title || (locale === 'nl' ? 'Zonder titel' : 'Untitled')}
        description={overview}
        locale={locale}
      />

      {/* Body */}
      {Array.isArray(body) && (
        <CustomPortableText
          id={data?._id || null}
          type={data?._type || null}
          path={['body']}
          paragraphClasses="font-serif max-w-3xl text-gray-600 text-xl"
          value={body}
          locale={locale}
        />
      )}
    </>
  )
}
