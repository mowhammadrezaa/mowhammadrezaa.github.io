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
  cookie: {
    title: 'Cookies',
    body: 'This site uses Google Analytics to understand visits. Accept only if you agree to analytics cookies.',
    accept: 'Accept',
    reject: 'Reject',
  },
} satisfies Dictionary

export default dictionary
