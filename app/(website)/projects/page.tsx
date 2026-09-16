import type {Metadata} from 'next'
import {defineQuery} from 'next-sanity'
import {draftMode} from 'next/headers'
import {Suspense} from 'react'

import {ProjectsSection} from '@/components/ProjectsSection'
import {getDynamicFetchOptions, sanityFetch, type DynamicFetchOptions} from '@/sanity/lib/live'

const projectsPageMetadataQuery = defineQuery(`
    *[_type == "page" && slug.current == "projects"][0] {
      title,
      "overview": pt::text(overview),
    }
  `)

const projectsPageQuery = defineQuery(`
    *[_type == "page" && slug.current == "projects"][0] {
      _id,
      _type,
      overview,
      title,
    }
  `)

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({
    query: projectsPageMetadataQuery,
    perspective: 'published',
    stega: false,
  })
  return {
    title: data?.title || 'Projects',
    description: data?.overview || undefined,
  }
}

export default async function ProjectsIndexPage() {
  const {isEnabled: isDraftMode} = await draftMode()
  if (!isDraftMode) {
    return <CachedProjectsIndex perspective="published" stega={false} />
  }
  return (
    <Suspense>
      <DynamicProjectsIndex />
    </Suspense>
  )
}

async function DynamicProjectsIndex() {
  const {perspective, stega} = await getDynamicFetchOptions()
  return <CachedProjectsIndex perspective={perspective} stega={stega} />
}

async function CachedProjectsIndex({perspective, stega}: DynamicFetchOptions) {
  'use cache'
  const {data} = await sanityFetch({query: projectsPageQuery, perspective, stega})

  return (
    <ProjectsSection
      id={data?._id || null}
      type={data?._type || null}
      title={data?.title || 'Projects'}
      overview={data?.overview}
      perspective={perspective}
      stega={stega}
    />
  )
}
