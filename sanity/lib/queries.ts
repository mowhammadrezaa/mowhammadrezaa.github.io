import {defineQuery} from 'next-sanity'

import type {AllSanitySchemaTypes, Slug} from '@/sanity.types'

export const settingsQuery = defineQuery(`
  *[_type == "settings" && language in [$language, "nl"]]
    | order(select(language == $language => 0, 1) asc)[0]{
    _id,
    _type,
    footer,
    language,
    menuItems[]{
      _key,
      ...@->{
        _type,
        language,
        "slug": slug.current,
        title
      }
    },
    ogImage,
  }
`)

export const showcaseProjectsQuery = defineQuery(`
  *[_type == "home" && language in [$language, "nl"]]
    | order(select(language == $language => 0, 1) asc)[0]{
    _id,
    language,
    showcaseProjects[]{
      _key,
      ...@->{
        _id,
        _type,
        coverImage,
        coverVideoUrl,
        overview,
        "slug": slug.current,
        tags,
        title,
      }
    }
  }
`)

export const slugsByTypeQuery = defineQuery(`
  *[
    _type == $type &&
    language == $language &&
    defined(slug.current)
  ] {
    "slug": coalesce(slug.current, "")
  }
`)
// Infer valid `type` params from all TypeGen schema types that has a top-level `slug` field
export type SlugsByTypeQueryParams = {
  language: 'nl' | 'en'
  type: AllSanitySchemaTypes extends infer SchemaType
    ? SchemaType extends unknown
      ? 'slug' extends keyof SchemaType
        ? SchemaType extends {_type: infer Type extends string; slug?: Slug}
          ? Type
          : never
        : never
      : never
    : never
}
