import {lang} from 'next/root-params'

import {Header} from '@/components/Header'

export default async function SlugNotFound() {
  const locale = await lang()
  return (
    <Header
      id={null}
      type={null}
      path={['overview']}
      title={locale === 'nl' ? '404 Pagina niet gevonden' : '404 Page Not Found'}
    />
  )
}
