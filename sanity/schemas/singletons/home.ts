import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {DEFAULT_LANGUAGE, languageField} from '../locale'

export default defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  icon: HomeIcon,
  // Uncomment below to have edits publish automatically as you type
  // liveEdit: true,
  fields: [
    languageField,
    defineField({
      name: 'title',
      description: 'This field is the title of your personal website.',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'overview',
      description:
        'Used both for the <meta> description tag for SEO, and the personal website subheader.',
      title: 'Description',
      type: 'array',
      of: [
        // Paragraphs
        defineArrayMember({
          lists: [],
          marks: {
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'Url',
                  },
                ],
              },
            ],
            decorators: [
              {
                title: 'Italic',
                value: 'em',
              },
              {
                title: 'Strong',
                value: 'strong',
              },
            ],
          },
          styles: [],
          type: 'block',
        }),
      ],
      validation: (rule) => rule.max(155).required(),
    }),
    defineField({
      name: 'showcaseProjects',
      title: 'Showcase projects',
      description: 'These are the projects that will appear first on your landing page.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}],
          options: {
            filter: ({document}) => {
              const language =
                typeof document.language === 'string' ? document.language : DEFAULT_LANGUAGE
              return {
                filter: 'language == $language',
                params: {language},
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      language: 'language',
      title: 'title',
    },
    prepare({language, title}) {
      return {
        subtitle: `Home · ${language?.toUpperCase() || 'No language'}`,
        title,
      }
    },
  },
})
