import {defineQuery} from 'next-sanity'
import type {MetadataRoute} from 'next'

import {locales, localePath, type Locale} from '@/i18n/routing'
import {SITE_URL} from '@/lib/site'
import {sanityFetchStaticParams} from '@/sanity/lib/live'

const sitemapEntriesQuery = defineQuery(`{
  "pages": *[_type == "page" && defined(slug.current)]{
    "slug": slug.current,
    language,
    _updatedAt
  },
  "projects": *[_type == "project" && defined(slug.current)]{
    "slug": slug.current,
    language,
    _updatedAt
  }
}`)

function absoluteUrl(locale: Locale, path = '/') {
  return `${SITE_URL}${localePath(locale, path)}`
}

function languageAlternates(path = '/') {
  return {
    languages: {
      nl: absoluteUrl('nl', path),
      en: absoluteUrl('en', path),
      'x-default': absoluteUrl('nl', path),
    },
  }
}

function entry(
  locale: Locale,
  path = '/',
  options?: {lastModified?: string | Date; priority?: number; changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']},
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(locale, path),
    lastModified: options?.lastModified,
    changeFrequency: options?.changeFrequency ?? 'weekly',
    priority: options?.priority ?? 0.7,
    alternates: languageAlternates(path),
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {data} = await sanityFetchStaticParams({query: sitemapEntriesQuery})
  const pages = data?.pages ?? []
  const projects = data?.projects ?? []

  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    entries.push(
      entry(locale, '/', {
        priority: 1,
        changeFrequency: 'weekly',
      }),
    )
    entries.push(
      entry(locale, '/projects', {
        priority: 0.9,
        changeFrequency: 'weekly',
      }),
    )
  }

  const pageSlugs = new Map<string, string | undefined>()
  for (const page of pages) {
    if (!page.slug || page.slug === 'projects') continue
    const existing = pageSlugs.get(page.slug)
    if (!existing || (page._updatedAt && page._updatedAt > existing)) {
      pageSlugs.set(page.slug, page._updatedAt)
    }
  }

  for (const [slug, updatedAt] of pageSlugs) {
    for (const locale of locales) {
      entries.push(
        entry(locale, `/${slug}`, {
          lastModified: updatedAt,
          priority: 0.8,
          changeFrequency: 'monthly',
        }),
      )
    }
  }

  const projectSlugs = new Map<string, string | undefined>()
  for (const project of projects) {
    if (!project.slug) continue
    const existing = projectSlugs.get(project.slug)
    if (!existing || (project._updatedAt && project._updatedAt > existing)) {
      projectSlugs.set(project.slug, project._updatedAt)
    }
  }

  for (const [slug, updatedAt] of projectSlugs) {
    for (const locale of locales) {
      entries.push(
        entry(locale, `/projects/${slug}`, {
          lastModified: updatedAt,
          priority: 0.7,
          changeFrequency: 'monthly',
        }),
      )
    }
  }

  return entries
}
