import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'

import {dataset, projectId} from '@/sanity/lib/api'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (
  source: SanityImageSource | null | undefined,
  options?: {preserveAlpha?: boolean},
) => {
  // Ensure that source image contains a valid reference
  if (typeof source === 'string' || !source || ('asset' in source && !source?.asset?._ref)) {
    return undefined
  }

  const builder = imageBuilder?.image(source).fit('max')
  if (options?.preserveAlpha) {
    return builder?.format('png')
  }
  return builder?.auto('format')
}

export function urlForOpenGraphImage(image: SanityImageSource | null | undefined) {
  return urlForImage(image)?.width(1200).height(627).fit('crop').url()
}

export function resolveHref(
  documentType?: string,
  slug?: string | null,
  language?: string | null,
): string | undefined {
  const locale = language === 'en' ? 'en' : 'nl'

  switch (documentType) {
    case 'home':
      return `/${locale}`
    case 'page':
      return slug ? `/${locale}/${slug}` : undefined
    case 'project':
      return slug ? `/${locale}/projects/${slug}` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}
