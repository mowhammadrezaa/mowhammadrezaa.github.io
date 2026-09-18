import type {PathSegment} from 'sanity'

import {CustomPortableText} from '@/components/CustomPortableText'

interface HeaderProps {
  id: string | null
  type: string | null
  path: PathSegment[]
  centered?: boolean
  description?: null | React.ComponentProps<typeof CustomPortableText>['value']
  title?: string | null
  locale?: 'nl' | 'en'
  as?: 'h1' | 'h2'
}
export function Header(props: HeaderProps) {
  const {
    id,
    type,
    path,
    title,
    description,
    centered = false,
    locale = 'en',
    as: Heading = 'h1',
  } = props
  if (!description && !title) {
    return null
  }
  return (
    <div className={centered ? 'text-center' : 'w-5/6 lg:w-3/5'}>
      {title && (
        <Heading
          className="text-3xl font-extrabold tracking-tight md:text-5xl"
          data-testid="page-title"
        >
          {title}
        </Heading>
      )}
      {Array.isArray(description) && (
        <div className="mt-4 text-pretty font-serif text-xl text-gray-600 md:text-2xl">
          <CustomPortableText id={id} type={type} path={path} value={description} locale={locale} />
        </div>
      )}
    </div>
  )
}
