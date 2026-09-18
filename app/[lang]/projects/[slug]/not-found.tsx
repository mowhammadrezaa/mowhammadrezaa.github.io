import {lang} from 'next/root-params'

import {Header} from '@/components/Header'

export default async function ProjectSlugNotFound() {
  const locale = await lang()
  return (
    <Header
      id={null}
      type={null}
      path={['overview']}
      title={locale === 'nl' ? '404 Project niet gevonden' : '404 Project Not Found'}
    />
  )
}
