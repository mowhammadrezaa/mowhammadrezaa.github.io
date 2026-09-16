import ImageBox from '@/components/ImageBox'
import type {Milestone} from '@/sanity.types'

export function TimelineItem({
  milestone,
  ...props
}: {
  milestone: Milestone
  'data-sanity'?: string
}) {
  const {description, duration, image, tags, title} = milestone
  const startYear = duration?.start ? new Date(duration.start).getFullYear() : undefined
  const endYear = duration?.end ? new Date(duration.end).getFullYear() : 'Now'

  return (
    <div
      className="flex flex-col gap-x-5 p-2 transition odd:border-b odd:border-t hover:bg-gray-50/50 xl:flex-row odd:xl:flex-row-reverse"
      data-sanity={props['data-sanity']}
    >
      <div className="w-full xl:w-9/12">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[3px] bg-gray-50">
          <div className="absolute inset-0 p-10 md:p-16 lg:p-20">
            <ImageBox
              image={image}
              alt={title || 'Timeline item icon'}
              width={900}
              height={900}
              size="(max-width: 1280px) 100vw, 75vw"
              quality={100}
              unoptimized
              preserveAlpha
              classesWrapper="relative h-full w-full bg-transparent"
            />
          </div>
        </div>
      </div>
      <div className="flex xl:w-1/4">
        <div className="relative mt-2 flex w-full flex-col justify-between p-3 xl:mt-0">
          <div>
            <div className="mb-2 text-xl font-extrabold tracking-tight md:text-2xl">{title}</div>
            {(startYear || endYear) && (
              <div className="mb-3 text-sm font-medium text-gray-500 md:text-base">
                {startYear} – {endYear}
              </div>
            )}
            {description && (
              <div className="font-serif text-gray-500">{description}</div>
            )}
          </div>
          {tags && tags.length > 0 && (
            <div className="mt-4 flex flex-row flex-wrap gap-x-2 gap-y-1">
              {tags.map((tag, key) => (
                <div className="text-sm font-medium lowercase md:text-lg" key={key}>
                  #{tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
