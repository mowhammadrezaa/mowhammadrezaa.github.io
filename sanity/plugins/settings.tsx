/**
 * This plugin contains all the logic for setting up the singletons
 */

import {type DocumentDefinition} from 'sanity'
import {type StructureResolver} from 'sanity/structure'

import {SUPPORTED_LANGUAGES} from '@/sanity/schemas/locale'

export const singletonPlugin = (types: string[]) => {
  return {
    name: 'singletonPlugin',
    document: {
      // Hide 'Singletons (such as Home)' from new document options
      // https://user-images.githubusercontent.com/81981/195728798-e0c6cf7e-d442-4e58-af3a-8cd99d7fcc28.png
      newDocumentOptions: (prev, {creationContext}) => {
        if (creationContext.type === 'global') {
          return prev.filter((templateItem) => !types.includes(templateItem.templateId))
        }

        return prev
      },
      // Removes the "duplicate" action on the Singletons (such as Home)
      actions: (prev, {schemaType}) => {
        if (types.includes(schemaType)) {
          return prev.filter(({action}) => action !== 'duplicate')
        }

        return prev
      },
    },
  }
}

// The StructureResolver is how we're changing the DeskTool structure to linking to document (named Singleton)
// like how "Home" is handled.
export const pageStructure = (typeDefArray: DocumentDefinition[]): StructureResolver => {
  return (S) => {
    const singletonItems = typeDefArray.map((typeDef) => {
      return S.listItem()
        .title(typeDef.title!)
        .icon(typeDef.icon)
        .child(
          S.list()
            .title(typeDef.title!)
            .items(
              SUPPORTED_LANGUAGES.map(({title, value}) =>
                S.listItem()
                  .title(title)
                  .child(
                    S.editor()
                      .id(`${typeDef.name}-${value}`)
                      .schemaType(typeDef.name)
                      .documentId(value === 'en' ? typeDef.name : `${typeDef.name}-${value}`),
                  ),
              ),
            ),
        )
    })

    const localizedDocumentItems = ['page', 'project'].map((schemaType) =>
      S.listItem()
        .title(schemaType === 'page' ? 'Pages' : 'Projects')
        .child(
          S.list()
            .title(schemaType === 'page' ? 'Pages' : 'Projects')
            .items(
              SUPPORTED_LANGUAGES.map(({title, value}) =>
                S.listItem()
                  .title(title)
                  .child(
                    S.documentTypeList(schemaType)
                      .title(`${title} ${schemaType === 'page' ? 'pages' : 'projects'}`)
                      .filter(`_type == $type && language == $language`)
                      .params({type: schemaType, language: value}),
                  ),
              ),
            ),
        ),
    )

    return S.list()
      .title('Content')
      .items([...singletonItems, S.divider(), ...localizedDocumentItems])
  }
}
