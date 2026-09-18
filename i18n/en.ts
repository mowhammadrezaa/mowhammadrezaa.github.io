import type {Dictionary} from './dictionaries'

const dictionary = {
  navigation: {
    primaryLabel: 'Primary navigation',
    menuOpenLabel: 'Open menu',
    menuCloseLabel: 'Close menu',
    languageLabel: 'Language',
    items: {
      about: 'About',
      work: 'Work',
      projects: 'Projects',
      education: 'Education',
      skills: 'Skills',
      contact: 'Contact',
    },
  },
} satisfies Dictionary

export default dictionary
