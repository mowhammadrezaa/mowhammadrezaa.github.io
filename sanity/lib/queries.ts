import {defineQuery} from 'next-sanity'

import type {AllSanitySchemaTypes, Slug} from '@/sanity.types'

export const settingsQuery = defineQuery(`
  *[_type == "settings"][0]{
    _id,
    _type,
    footer,
    menuItems[]{
      _key,
      ...@->{
        _type,
        "slug": slug.current,
        title
      }
    },
    ogImage,
  }
`)

export const showcaseProjectsQuery = defineQuery(`
  *[_type == "home"][0]{
    _id,
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
  *[_type == $type && defined(slug.current)]{"slug": slug.current}
`)
// Infer valid `type` params from all TypeGen schema types that has a top-level `slug` field
export type SlugsByTypeQueryParams = {
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
