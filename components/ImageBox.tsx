import type {SanityImageSource} from '@sanity/image-url'
import Image from 'next/image'

import {urlForImage} from '@/sanity/lib/utils'

interface ImageBoxProps {
  'image'?: SanityImageSource | null | undefined
  'alt'?: string
  'width'?: number
  'height'?: number
  'size'?: string
  'classesWrapper'?: string
  'preserveAlpha'?: boolean
  'quality'?: number
  'unoptimized'?: boolean
  'data-sanity'?: string
  'locale'?: 'nl' | 'en'
}

export default function ImageBox({
  image,
  alt,
  width = 3500,
  height = 2000,
  size = '100vw',
  classesWrapper,
  preserveAlpha = false,
  quality,
  unoptimized = false,
  locale = 'en',
  ...props
}: ImageBoxProps) {
  const builder = preserveAlpha
    ? urlForImage(image, {preserveAlpha: true})?.height(height).width(width)
    : urlForImage(image)?.height(height).width(width).fit('crop')
  const imageUrl = builder?.url()

  return (
    <div
      className={`w-full overflow-hidden rounded-[3px] ${
        preserveAlpha ? 'bg-transparent' : 'bg-gray-50'
      } ${classesWrapper}`}
      data-sanity={props['data-sanity']}
    >
      {imageUrl && (
        <Image
          className={`absolute h-full w-full ${preserveAlpha ? 'object-contain' : 'object-cover'}`}
          alt={alt ?? (locale === 'nl' ? 'Afbeelding' : 'Image')}
          width={width}
          height={height}
          sizes={size}
          quality={quality ?? (preserveAlpha ? 100 : 75)}
          unoptimized={unoptimized}
          src={imageUrl}
        />
      )}
    </div>
  )
}
