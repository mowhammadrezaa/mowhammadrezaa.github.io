import {createDataAttribute} from 'next-sanity'

import {AppLink} from '@/components/AppLink'
import {CustomPortableText} from '@/components/CustomPortableText'
import {Header} from '@/components/Header'
import {OptimisticSortOrder} from '@/components/OptimisticSortOrder'
import {ProjectCoverMedia} from '@/components/ProjectCoverMedia'
import type {ProjectsPageQueryResult} from '@/sanity.types'
import {studioUrl} from '@/sanity/lib/api'
import {sanityFetch, type DynamicFetchOptions} from '@/sanity/lib/live'
import {showcaseProjectsQuery} from '@/sanity/lib/queries'
import {resolveHref} from '@/sanity/lib/utils'

type ProjectsOverview = NonNullable<ProjectsPageQueryResult>['overview']

export async function ProjectsSection({
  id,
  type,
  title,
  overview,
  perspective,
  stega,
  locale = 'en',
  headingAs = 'h1',
}: {
  id: string | null
  type: string | null
  title?: string | null
  overview?: ProjectsOverview
  locale?: 'nl' | 'en'
  headingAs?: 'h1' | 'h2'
} & DynamicFetchOptions) {
  const {data: home} = await sanityFetch({
    query: showcaseProjectsQuery,
    params: {language: locale},
    perspective,
    stega,
  })
  const showcaseProjects = home?.showcaseProjects ?? []
  const isDutch = locale === 'nl'

  const dataAttribute = home?._id
    ? createDataAttribute({
        baseUrl: studioUrl,
        id: home._id,
        type: 'home',
      })
    : null

  return (
    <div className="space-y-12">
      <Header
        id={id}
        type={type}
        path={['overview']}
        title={title || (isDutch ? 'Projecten' : 'Projects')}
        description={overview}
        locale={locale}
        as={headingAs}
      />

      <div className="mx-auto max-w-[100rem] rounded-md border">
        <OptimisticSortOrder id={home?._id} path="showcaseProjects">
          {showcaseProjects.map((project) => {
            const href = resolveHref(project?._type, project?.slug, locale)
            if (!href) return null
            return (
              <AppLink
                className="group flex flex-col gap-x-5 p-2 transition odd:border-b odd:border-t hover:bg-gray-50/50 xl:flex-row odd:xl:flex-row-reverse"
                key={project._key}
                href={href}
                prefetch={true}
                data-sanity={dataAttribute?.(['showcaseProjects', {_key: project._key}])}
              >
                <div className="w-full xl:w-9/12">
                  <ProjectCoverMedia
                    image={project.coverImage}
                    videoUrl={project.coverVideoUrl}
                    alt={
                      project.title
                        ? isDutch
                          ? `Projectmedia voor ${project.title}`
                          : `Project media for ${project.title}`
                        : isDutch
                          ? 'Projectmedia'
                          : 'Project media'
                    }
                  />
                </div>
                <div className="flex xl:w-1/4">
                  <div className="relative mt-2 flex w-full flex-col justify-between p-3 xl:mt-0">
                    <div>
                      <div className="mb-2 text-xl font-extrabold tracking-tight md:text-2xl">
                        {project.title}
                      </div>
                      {Array.isArray(project.overview) && (
                        <div className="font-serif text-gray-500">
                          <CustomPortableText
                            id={project._id}
                            type={project._type}
                            path={['overview']}
                            value={project.overview}
                            locale={locale}
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags?.map((tag, key) => (
                        <span
                          key={key}
                          className="inline-flex items-center border border-black/10 bg-black/[0.025] px-2.5 py-1 font-sans text-[0.65rem] font-medium uppercase tracking-[0.14em] text-gray-600 transition-colors duration-200 group-hover:border-black/20 group-hover:text-gray-800 md:text-[0.7rem]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </AppLink>
            )
          })}
        </OptimisticSortOrder>
      </div>
    </div>
  )
}
