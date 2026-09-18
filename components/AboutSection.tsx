import {stegaClean, type InferValue, type SanityQueries} from 'next-sanity'

import {CopyEmailButton} from '@/components/CopyEmailButton'
import {CustomPortableText} from '@/components/CustomPortableText'
import ImageBox from '@/components/ImageBox'

type PortableValue = InferValue<SanityQueries[keyof SanityQueries]>

type BodyBlock = {
  _key?: string
  _type?: string
  alt?: string
  caption?: string
  children?: {_type?: string; text?: string; marks?: string[]}[]
  markDefs?: {_key?: string; _type?: string; href?: string}[]
  asset?: unknown
  [key: string]: unknown
}

function getPlainText(block: BodyBlock | undefined): string {
  if (!block?.children) return ''
  return stegaClean(block.children.map((c) => c.text || '').join(''))
}

function isStackBlock(block: BodyBlock): boolean {
  return /^(Core stack|Kernstack|Kerntechnologieën):/i.test(getPlainText(block))
}

function isAvailabilityBlock(block: BodyBlock): boolean {
  const text = getPlainText(block)
  return /zoekjaar|oriëntatiejaar|orientation year/i.test(text)
}

interface AboutSectionProps {
  id: string | null
  type: string | null
  title?: string | null
  overview?: PortableValue | null
  body?: BodyBlock[] | null
  locale?: 'nl' | 'en'
}

export function AboutSection({id, type, title, overview, body, locale = 'en'}: AboutSectionProps) {
  const isDutch = locale === 'nl'
  const blocks = Array.isArray(body) ? body : []
  const image = blocks.find((b) => b._type === 'image')
  const textBlocks = blocks.filter((b) => b._type === 'block')
  const availability = textBlocks.find(isAvailabilityBlock)
  const stack = textBlocks.find(isStackBlock)
  const narrative = textBlocks.filter((b) => b !== availability && b !== stack)

  // Drop narrative that duplicates the overview lede
  const overviewText = Array.isArray(overview)
    ? stegaClean(
        overview
          .flatMap((block) =>
            'children' in (block as object) ? (block as BodyBlock).children || [] : [],
          )
          .map((c) => c.text || '')
          .join(''),
      )
    : ''
  const story = narrative.filter((b) => getPlainText(b) !== overviewText)

  const stackItems = getPlainText(stack)
    .replace(/^(Core stack|Kernstack|Kerntechnologieën):\s*/i, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <article className="mx-auto max-w-5xl">
      <div className="grid items-start gap-10 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-12 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-16">
        {image && (
          <div className="md:sticky md:top-28">
            <div className="relative mx-auto aspect-[4/5] max-w-[240px] overflow-hidden md:mx-0 md:max-w-none">
              <ImageBox
                image={image}
                alt={image.alt || (isDutch ? 'Portret' : 'Portrait')}
                width={900}
                height={1125}
                size="(min-width: 768px) 280px, 70vw"
                classesWrapper="absolute inset-0 bg-transparent [&_img]:object-contain [&_img]:object-bottom"
                preserveAlpha
              />
            </div>
            {image.caption && (
              <p className="mt-3 text-center font-sans text-sm text-gray-500 md:text-left">
                {stegaClean(image.caption)}
              </p>
            )}
          </div>
        )}

        <div className="min-w-0">
          {title && (
            <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
              {isDutch ? 'Profiel' : 'Profile'}
            </p>
          )}
          {title && (
            <h1
              className="mt-2 font-serif text-4xl tracking-tight text-black md:text-5xl"
              data-testid="page-title"
            >
              {title}
            </h1>
          )}

          {Array.isArray(overview) && overview.length > 0 && (
            <div className="mt-5 max-w-2xl text-pretty font-serif text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-snug">
              <CustomPortableText
                id={id}
                type={type}
                path={['overview']}
                paragraphClasses="text-inherit"
                value={overview}
                locale={locale}
              />
            </div>
          )}

          {story.length > 0 && (
            <div className="mt-10 space-y-6 border-t border-black/[0.08] pt-10">
              <CustomPortableText
                id={id}
                type={type}
                path={['body']}
                paragraphClasses="font-serif text-lg leading-relaxed text-gray-600 md:text-xl md:leading-relaxed"
                value={story as PortableValue}
                locale={locale}
              />
            </div>
          )}

          {availability && (
            <aside className="mt-10 border-l-2 border-black pl-5 md:pl-6">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                {isDutch ? 'Beschikbaarheid' : 'Availability'}
              </p>
              <div className="mt-3">
                <CustomPortableText
                  id={id}
                  type={type}
                  path={['body']}
                  paragraphClasses="font-serif text-base leading-relaxed text-gray-700 md:text-lg"
                  value={[availability] as PortableValue}
                  locale={locale}
                />
              </div>
            </aside>
          )}

          {stackItems.length > 0 && (
            <div className="mt-10 border-t border-black/[0.08] pt-8">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                {isDutch ? 'Kerntechnologieën' : 'Core stack'}
              </p>
              <ul className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-2 font-mono text-sm text-gray-600 md:text-[0.9rem]">
                {stackItems.map((item, index) => (
                  <li key={item} className="flex items-center gap-x-1">
                    {index > 0 && (
                      <span className="text-gray-300" aria-hidden>
                        ·
                      </span>
                    )}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <CopyEmailButton locale={locale} />
        </div>
      </div>
    </article>
  )
}
