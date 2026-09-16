import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'milestone',
  title: 'Milestone',
  type: 'object',
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
      validation: (rule) => rule.required(),
    }),
    defineField({
      type: 'string',
      name: 'description',
      title: 'Description',
    }),
    defineField({
      name: 'points',
      title: 'Points',
      type: 'array',
      description: 'Bullet points for this role (e.g. CV responsibilities).',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: "This image will be used as the milestone's cover image.",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'imageLayout',
      title: 'Image layout',
      type: 'string',
      description: 'How the image should fill the media panel.',
      options: {
        list: [
          {title: 'Logo (contain)', value: 'logo'},
          {title: 'Cover (fill)', value: 'cover'},
        ],
        layout: 'radio',
      },
      initialValue: 'logo',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description:
        'Tags to help categorize the milestone. For example: name of the university course, name of the project, the position you held within the project etc. ',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      type: 'duration',
      name: 'duration',
      title: 'Duration',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      duration: 'duration',
      image: 'image',
      title: 'title',
    },
    prepare({duration, image, title}) {
      return {
        media: image,
        subtitle: [
          duration?.start && new Date(duration.start).getFullYear(),
          duration?.end && new Date(duration.end).getFullYear(),
        ]
          .filter(Boolean)
          .join(' - '),
        title,
      }
    },
  },
})
