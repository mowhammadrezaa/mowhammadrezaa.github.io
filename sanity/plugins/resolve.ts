/**
 * Sets up the Presentation Resolver API,
 * see https://www.sanity.io/docs/presentation-resolver-api for more information.
 */

import {defineDocuments, defineLocations} from 'sanity/presentation'

import {resolveHref} from '@/sanity/lib/utils'

export const mainDocuments = defineDocuments([
  {
    route: '/:language/projects/:slug',
    filter: `_type == "project" && language == $language && slug.current == $slug`,
  },
  {
    route: '/:language/:slug',
    filter: `_type == "page" && language == $language && slug.current == $slug`,
  },
  {
    route: '/:language',
    filter: `_type == "home" && language == $language`,
  },
])

export const locations = {
  settings: defineLocations({
    message: 'This document is used on all pages',
    tone: 'caution',
    select: {language: 'language'},
    resolve: (doc) => ({
      locations: [{title: 'Home', href: resolveHref('home', null, doc?.language)!}],
    }),
  }),
  home: defineLocations({
    message: 'This document is used to render the front page',
    tone: 'positive',
    select: {language: 'language'},
    resolve: (doc) => ({
      locations: [{title: 'Home', href: resolveHref('home', null, doc?.language)!}],
    }),
  }),
  project: defineLocations({
    select: {language: 'language', title: 'title', slug: 'slug.current'},
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || 'Untitled',
          href: resolveHref('project', doc?.slug, doc?.language)!,
        },
      ],
    }),
  }),
  page: defineLocations({
    select: {language: 'language', title: 'title', slug: 'slug.current'},
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || 'Untitled',
          href: resolveHref('page', doc?.slug, doc?.language)!,
        },
      ],
    }),
  }),
}
