import type {StudioPathLike} from '@sanity/client/csm'
import {createDataAttribute, stegaClean} from 'next-sanity'

import {TimelineItem} from '@/components/TimelineItem'
import type {Milestone} from '@/sanity.types'
import {studioUrl} from '@/sanity/lib/api'

import {OptimisticSortOrder} from './OptimisticSortOrder'

interface TimelineBlock {
  _key: string
  title?: string
  milestones?: (Milestone & {_key: string})[]
}

export function TimelineSection({
  timelines,
  id,
  type,
  path,
  locale = 'en',
}: {
  timelines: TimelineBlock[] | undefined
  id: string | null
  type: string | null
  path: StudioPathLike
  locale?: 'nl' | 'en'
}) {
  const dataAttribute =
    id && type
      ? createDataAttribute({
          baseUrl: studioUrl,
          id,
          type,
          path,
        })
      : null

  return (
    <div className="space-y-12 pt-16 text-black" data-sanity={dataAttribute?.()}>
      <OptimisticSortOrder id={id} path={path}>
        {timelines?.map((timeline) => {
          const {title, milestones, _key} = timeline
          return (
            <div key={_key} data-sanity={dataAttribute?.([{_key}])}>
              {title ? (
                <div className="pb-5 font-sans text-xl font-bold">{stegaClean(title)}</div>
              ) : null}
              <div className="mx-auto max-w-[100rem] rounded-md border">
                <OptimisticSortOrder
                  id={id}
                  path={[...(Array.isArray(path) ? path : [path]), {_key}, 'milestones']}
                >
                  {milestones?.map((experience) => (
                    <TimelineItem
                      key={experience._key}
                      milestone={stegaClean(experience)}
                      locale={locale}
                      data-sanity={dataAttribute?.([{_key}, 'milestones', {_key: experience._key}])}
                    />
                  ))}
                </OptimisticSortOrder>
              </div>
            </div>
          )
        })}
      </OptimisticSortOrder>
    </div>
  )
}
