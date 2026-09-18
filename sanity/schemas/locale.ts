import {defineField, type ReferenceFilterResolver, type SlugIsUniqueValidator} from 'sanity'

export const DEFAULT_LANGUAGE = 'nl'
export const SUPPORTED_LANGUAGES = [
  {title: 'Nederlands', value: 'nl'},
  {title: 'English', value: 'en'},
] as const

export const languageField = defineField({
  name: 'language',
  title: 'Language',
  type: 'string',
  options: {
    list: [...SUPPORTED_LANGUAGES],
    layout: 'radio',
  },
  initialValue: DEFAULT_LANGUAGE,
  validation: (rule) => rule.required(),
})

export const languageReferenceFilter: ReferenceFilterResolver = ({document}) => {
  const language = typeof document.language === 'string' ? document.language : DEFAULT_LANGUAGE
  return {
    filter: 'language == $language',
    params: {language},
  }
}

export const isUniqueSlugPerLanguage: SlugIsUniqueValidator = async (slug, context) => {
  const document = context.document
  if (!document?._id || !document._type || !slug) return true

  const language = typeof document.language === 'string' ? document.language : DEFAULT_LANGUAGE
  const publishedId = document._id.replace(/^drafts\./, '')
  const draftId = `drafts.${publishedId}`
  const client = context.getClient({apiVersion: '2025-02-27'})

  const duplicateCount = await client.fetch<number>(
    `count(*[
      _type == $type &&
      language == $language &&
      slug.current == $slug &&
      !(_id in [$publishedId, $draftId])
    ])`,
    {
      type: document._type,
      language,
      slug,
      publishedId,
      draftId,
    },
  )

  return duplicateCount === 0
}
