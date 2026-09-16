import {defineQuery} from 'next-sanity'
import Link from 'next/link'
import {draftMode} from 'next/headers'
import {Suspense} from 'react'

import {AboutSection} from '@/components/AboutSection'
import {ContactSection} from '@/components/ContactSection'
import {CustomPortableText} from '@/components/CustomPortableText'
import {Header} from '@/components/Header'
import {HomeHashScroll} from '@/components/HomeHashScroll'
import {ProjectsSection} from '@/components/ProjectsSection'
import {SkillsSection} from '@/components/SkillsSection'
import {studioUrl} from '@/sanity/lib/api'
import {getDynamicFetchOptions, sanityFetch, type DynamicFetchOptions} from '@/sanity/lib/live'

const homePageQuery = defineQuery(`
  {
    "home": *[_type == "home"][0]{
      _id,
      _type,
      overview,
      title,
    },
    "pages": *[_type == "page" && slug.current in ["about", "projects", "education", "work", "skills", "contact"]] | order(
      select(
        slug.current == "about" => 0,
        slug.current == "work" => 1,
        slug.current == "projects" => 2,
        slug.current == "education" => 3,
        slug.current == "skills" => 4,
        slug.current == "contact" => 5,
        99
      ) asc
    ) {
      _id,
      _type,
      body,
      overview,
      title,
      "slug": slug.current,
    }
  }
`)

const SECTION_ORDER = ['about', 'work', 'projects', 'education', 'skills', 'contact'] as const

export default async function IndexPage() {
  const {isEnabled: isDraftMode} = await draftMode()
  if (!isDraftMode) {
    return <CachedHome perspective="published" stega={false} />
  }
  return (
    <Suspense>
      <DynamicHome />
    </Suspense>
  )
}

async function DynamicHome() {
  const {perspective, stega} = await getDynamicFetchOptions()
  return <CachedHome perspective={perspective} stega={stega} />
}

function SectionShell({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-[calc(var(--site-header-height,4.25rem)+1.5rem)] border-t border-black/[0.08] pt-16 pb-12 md:pt-20 md:pb-16"
    >
      {children}
    </section>
  )
}

async function CachedHome({perspective, stega}: DynamicFetchOptions) {
  'use cache'
  const {data} = await sanityFetch({query: homePageQuery, perspective, stega})
  const home = data?.home
  const pages = data?.pages ?? []

  if (!home) {
    return (
      <div className="text-center">
        You don&rsquo;t have a homepage yet,{' '}
        <Link href={`${studioUrl}/structure/home`} className="underline">
          create one now
        </Link>
        !
      </div>
    )
  }

  const pageBySlug = new Map(pages.map((page) => [page.slug, page]))

  return (
    <div className="space-y-0">
      <HomeHashScroll />
      <section id="top" className="scroll-mt-[calc(var(--site-header-height,4.25rem)+1.5rem)] pb-16 md:pb-20">
        {home.title && (
          <Header
            id={home._id || null}
            type={home._type || null}
            path={['overview']}
            centered
            title={home.title}
            description={home.overview}
          />
        )}
      </section>

      {SECTION_ORDER.map((slug) => {
        const page = pageBySlug.get(slug)
        if (!page) return null

        if (slug === 'about') {
          return (
            <SectionShell key={slug} id={slug}>
              <AboutSection
                id={page._id}
                type={page._type}
                title={page.title}
                overview={page.overview}
                body={page.body}
              />
            </SectionShell>
          )
        }

        if (slug === 'projects') {
          return (
            <SectionShell key={slug} id={slug}>
              <ProjectsSection
                id={page._id}
                type={page._type}
                title={page.title}
                overview={page.overview}
                perspective={perspective}
                stega={stega}
              />
            </SectionShell>
          )
        }

        if (slug === 'skills') {
          return (
            <SectionShell key={slug} id={slug}>
              <SkillsSection
                id={page._id}
                type={page._type}
                title={page.title}
                overview={page.overview}
              />
            </SectionShell>
          )
        }

        if (slug === 'contact') {
          return (
            <SectionShell key={slug} id={slug}>
              <ContactSection
                id={page._id}
                type={page._type}
                title={page.title}
                overview={page.overview}
              />
            </SectionShell>
          )
        }

        return (
          <SectionShell key={slug} id={slug}>
            <Header
              id={page._id}
              type={page._type}
              path={['overview']}
              title={page.title || 'Untitled'}
              description={page.overview}
            />
            {Array.isArray(page.body) && (
              <CustomPortableText
                id={page._id}
                type={page._type}
                path={['body']}
                paragraphClasses="font-serif max-w-3xl text-gray-600 text-xl"
                value={page.body}
              />
            )}
          </SectionShell>
        )
      })}
    </div>
  )
}
