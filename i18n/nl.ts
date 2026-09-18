import type {Dictionary} from './dictionaries'

const dictionary = {
  navigation: {
    primaryLabel: 'Hoofdnavigatie',
    menuOpenLabel: 'Menu openen',
    menuCloseLabel: 'Menu sluiten',
    languageLabel: 'Taal',
    items: {
      about: 'Over',
      work: 'Werk',
      projects: 'Projecten',
      education: 'Opleiding',
      skills: 'Vaardigheden',
      contact: 'Contact',
    },
  },
} satisfies Dictionary

export default dictionary
