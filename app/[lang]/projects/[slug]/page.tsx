import type {Metadata, ResolvingMetadata} from 'next'
import {createDataAttribute, defineQuery} from 'next-sanity'
import Link from 'next/link'
import {notFound} from 'next/navigation'

import {CustomPortableText} from '@/components/CustomPortableText'
import {Header} from '@/components/Header'
import {ProjectCoverMedia} from '@/components/ProjectCoverMedia'
import {getLocaleAlternates, hasLocale, type Locale} from '@/i18n/routing'
import {studioUrl} from '@/sanity/lib/api'
import {
  getDynamicFetchOptions,
  sanityFetch,
  sanityFetchMetadata,
  sanityFetchStaticParams,
  type DynamicFetchOptions,
} from '@/sanity/lib/live'
import {slugsByTypeQuery, type SlugsByTypeQueryParams} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'

export async function generateStaticParams({
  params,
}: {
  params: {lang: string}
}): Promise<Array<{slug: string}>> {
  if (!hasLocale(params.lang)) return [{slug: '__placeholder__'}]

  const {data} = await sanityFetchStaticParams({
    query: slugsByTypeQuery,
    params: {
      language: params.lang,
      type: 'project',
    } satisfies SlugsByTypeQueryParams,
  })
  if (data.length > 0) {
    return Array.from(
      new Set(data.flatMap(({slug}) => (slug ? [slug] : []))),
      (slug) => ({slug}),
    )
  }
  // Cache Components requires `generateStaticParams` to return at least one param — an empty
  // array fails the build (https://nextjs.org/docs/messages/empty-generate-static-params).
  // With no project documents in the dataset yet, prerender a placeholder slug that resolves
  // to the 404 page instead.
  return [{slug: '__placeholder__'}]
}

export async function generateMetadata(
  {params}: PageProps<'/[lang]/projects/[slug]'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const [{lang, slug}, {perspective}] = await Promise.all([params, getDynamicFetchOptions()])
  if (!hasLocale(lang)) notFound()

  const projectSlugPageMetadataQuery = defineQuery(`
    *[
      _type == "project" &&
      slug.current == $slug &&
      language in [$language, "nl"]
    ] | order(select(language == $language => 0, 1) asc)[0] {
      coverImage,
      title,
      client,
      tags,
      "overview": pt::text(overview),
    }
  `)
  const {data} = await sanityFetchMetadata({
    query: projectSlugPageMetadataQuery,
    params: {language: lang, slug},
    perspective,
  })

  const ogImage = urlForOpenGraphImage(data?.coverImage)
  const details = [
    data?.overview,
    data?.client
      ? lang === 'nl'
        ? `Opdrachtgever: ${data.client}.`
        : `Client: ${data.client}.`
      : null,
    data?.tags?.length
      ? lang === 'nl'
        ? `Stack: ${data.tags.join(', ')}.`
        : `Stack: ${data.tags.join(', ')}.`
      : null,
  ]
    .filter(Boolean)
    .join(' ')

  return {
    title: data?.title,
    description: details || (await parent).description,
    alternates: getLocaleAlternates(lang, `/projects/${slug}`),
    openGraph: ogImage
      ? {
          title: data?.title || undefined,
          description: details || undefined,
          images: [ogImage, ...((await parent).openGraph?.images || [])],
        }
      : {
          title: data?.title || undefined,
          description: details || undefined,
        },
  }
}

export default async function ProjectSlugPage({
  params,
}: PageProps<'/[lang]/projects/[slug]'>) {
  const [{lang, slug}, {perspective, stega}] = await Promise.all([
    params,
    getDynamicFetchOptions(),
  ])
  if (!hasLocale(lang)) notFound()

  return (
    <CachedProjectSlugPage
      locale={lang}
      slug={slug}
      perspective={perspective}
      stega={stega}
    />
  )
}

async function CachedProjectSlugPage({
  slug,
  locale,
  perspective,
  stega,
}: {locale: Locale; slug: string} & DynamicFetchOptions) {
  'use cache'
  const projectSlugPageQuery = defineQuery(`
    *[
      _type == "project" &&
      slug.current == $slug &&
      language in [$language, "nl"]
    ] | order(select(language == $language => 0, 1) asc)[0] {
      _id,
      _type,
      client,
      coverImage,
      coverVideoUrl,
      description,
      duration,
      overview,
      site,
      "slug": slug.current,
      tags,
      title,
    }
  `)
  const {data} = await sanityFetch({
    query: projectSlugPageQuery,
    params: {language: locale, slug},
    perspective,
    stega,
  })

  if (!data?._id) notFound()

  const dataAttribute =
    data?._id && data._type
      ? createDataAttribute({
          baseUrl: studioUrl,
          id: data._id,
          type: data._type,
        })
      : null

  const {client, coverImage, coverVideoUrl, description, duration, overview, site, tags, title} =
    data ?? {}

  const startYear = duration?.start ? new Date(duration.start).getFullYear() : undefined
  const isDutch = locale === 'nl'
  const endYear = duration?.end
    ? new Date(duration?.end).getFullYear()
    : isDutch
      ? 'Heden'
      : 'Now'

  return (
    <div className="space-y-6" data-testid="project-content">
      {/* Header */}
      <Header
        id={data?._id || null}
        type={data?._type || null}
        path={['overview']}
        title={title || (isDutch ? 'Zonder titel' : 'Untitled')}
        description={overview}
        locale={locale}
      />

      <div className="rounded-md border">
        {/* Image  */}
        <ProjectCoverMedia
          data-sanity={dataAttribute?.('coverImage')}
          image={coverImage}
          videoUrl={coverVideoUrl}
          alt={
            title
              ? isDutch
                ? `Projectmedia voor ${title}`
                : `Project media for ${title}`
              : isDutch
                ? 'Projectmedia'
                : 'Project media'
          }
        />

        <div className="divide-inherit grid grid-cols-1 divide-y lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {/* Duration */}
          {!!(startYear && endYear) && (
            <div className="p-3 lg:p-4">
              <div className="text-xs md:text-sm">{isDutch ? 'Duur' : 'Duration'}</div>
              <div className="text-md md:text-lg">
                <span data-sanity={dataAttribute?.('duration.start')}>{startYear}</span>
                {' - '}
                <span data-sanity={dataAttribute?.('duration.end')}>{endYear}</span>
              </div>
            </div>
          )}

          {/* Client */}
          {client && (
            <div className="p-3 lg:p-4">
              <div className="text-xs md:text-sm">{isDutch ? 'Opdrachtgever' : 'Client'}</div>
              <div className="text-md md:text-lg">{client}</div>
            </div>
          )}

          {/* Site */}
          {site && (
            <div className="p-3 lg:p-4">
              <div className="text-xs md:text-sm">Website</div>
              {site && (
                <Link target="_blank" className="text-md break-words md:text-lg" href={site}>
                  {site}
                </Link>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="p-3 lg:p-4">
            <div className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
              {isDutch ? 'Tech stack' : 'Tech stack'}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags?.map((tag, key) => (
                <span
                  key={key}
                  className="inline-flex items-center border border-black/10 bg-black/[0.025] px-2.5 py-1 font-sans text-[0.65rem] font-medium uppercase tracking-[0.14em] text-gray-600 md:text-[0.7rem]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {Array.isArray(description) && (
        <CustomPortableText
          id={data?._id || null}
          type={data?._type || null}
          path={['description']}
          paragraphClasses="font-serif max-w-3xl text-xl text-gray-600"
          value={description}
          locale={locale}
        />
      )}
    </div>
  )
}
