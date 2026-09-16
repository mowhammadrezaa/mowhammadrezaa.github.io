import ImageBox from '@/components/ImageBox'
import type {SanityImageSource} from '@sanity/image-url'

export function ProjectCoverMedia({
  image,
  videoUrl,
  alt,
  'data-sanity': dataSanity,
}: {
  image?: SanityImageSource | null
  videoUrl?: string | null
  alt: string
  'data-sanity'?: string
}) {
  if (videoUrl) {
    return (
      <div
        className="relative aspect-[16/9] w-full overflow-hidden rounded-[3px] bg-gray-50"
        data-sanity={dataSanity}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          poster={undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
        />
      </div>
    )
  }

  return (
    <ImageBox
      image={image}
      alt={alt}
      classesWrapper="relative aspect-[16/9]"
      data-sanity={dataSanity}
    />
  )
}
