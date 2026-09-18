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
  cookie: {
    title: 'Cookies',
    body: 'Deze site gebruikt Google Analytics om bezoeken te begrijpen. Accepteer alleen als je akkoord gaat met analytics-cookies.',
    accept: 'Accepteren',
    reject: 'Weigeren',
  },
} satisfies Dictionary

export default dictionary
