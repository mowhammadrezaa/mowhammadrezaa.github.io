import {PERSON, SITE_URL} from '@/lib/site'

export function PersonJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PERSON.name,
    url: SITE_URL,
    jobTitle: PERSON.jobTitle,
    email: PERSON.email,
    telephone: PERSON.telephone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: PERSON.addressLocality,
      addressCountry: PERSON.addressCountry,
    },
    sameAs: PERSON.sameAs,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  )
}
