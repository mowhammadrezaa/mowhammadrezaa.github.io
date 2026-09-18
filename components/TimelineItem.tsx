import ImageBox from '@/components/ImageBox'
import type {Milestone} from '@/sanity.types'

export function TimelineItem({
  milestone,
  locale = 'en',
  ...props
}: {
  'milestone': Milestone
  'locale'?: 'nl' | 'en'
  'data-sanity'?: string
}) {
  const {description, duration, image, imageLayout, points, tags, title} = milestone
  const startYear = duration?.start ? new Date(duration.start).getFullYear() : undefined
  const endYear = duration?.end
    ? new Date(duration.end).getFullYear()
    : locale === 'nl'
      ? 'Heden'
      : 'Now'
  const detailPoints = points?.filter(Boolean) ?? []
  const isCover = imageLayout === 'cover'

  return (
    <div
      className="group flex flex-col gap-x-5 p-2 transition odd:border-b odd:border-t hover:bg-gray-50/50 xl:flex-row odd:xl:flex-row-reverse"
      data-sanity={props['data-sanity']}
    >
      <div className="w-full xl:w-5/12">
        {isCover ? (
          <ImageBox
            image={image}
            alt={
              title ||
              (locale === 'nl' ? 'Omslagafbeelding bij tijdlijnitem' : 'Timeline item cover image')
            }
            classesWrapper="relative aspect-[16/9]"
            size="(max-width: 1280px) 100vw, 40vw"
          />
        ) : (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[3px] bg-gray-50">
            <div className="absolute inset-0 p-10 md:p-14 lg:p-16">
              <ImageBox
                image={image}
                alt={
                  title || (locale === 'nl' ? 'Pictogram bij tijdlijnitem' : 'Timeline item icon')
                }
                width={900}
                height={900}
                size="(max-width: 1280px) 100vw, 40vw"
                quality={100}
                unoptimized
                preserveAlpha
                classesWrapper="relative h-full w-full bg-transparent"
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex xl:w-7/12">
        <div className="relative mt-2 flex w-full flex-col justify-between p-3 xl:mt-0">
          <div>
            <div className="mb-2 text-xl font-extrabold tracking-tight md:text-2xl">{title}</div>
            {(startYear || endYear) && (
              <div className="mb-2 text-sm font-medium text-gray-500 md:text-base">
                {startYear} – {endYear}
              </div>
            )}
            {description && (
              <div className="mb-4 font-serif text-base text-gray-700 md:text-lg">
                {description}
              </div>
            )}
            {detailPoints.length > 0 && (
              <ul className="space-y-3 font-serif text-sm leading-relaxed text-gray-500 md:text-base">
                {detailPoints.map((point, key) => (
                  <li key={key} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {tags && tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag, key) => (
                <span
                  key={key}
                  className="inline-flex items-center border border-black/10 bg-black/[0.025] px-2.5 py-1 font-sans text-[0.65rem] font-medium uppercase tracking-[0.14em] text-gray-600 transition-colors duration-200 group-hover:border-black/20 group-hover:text-gray-800 md:text-[0.7rem]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
