'use client'

import {PuterResumeChat} from '@/packages/puter-resume-chat/src'
import {CHAT_KNOWLEDGE, PERSON_NAME} from '@/lib/mohammadreza-knowledge'

/**
 * Site wrapper: Puter.js runs in the visitor’s browser with their Puter session.
 * No owner API key is configured or required.
 */
export function SiteResumeChat({locale = 'en'}: {locale?: 'nl' | 'en'}) {
  const knowledge = CHAT_KNOWLEDGE[locale]
  const isDutch = locale === 'nl'

  return (
    <PuterResumeChat
      personName={PERSON_NAME}
      knowledgeBase={knowledge.knowledgeBase}
      suggestedQuestions={[...knowledge.suggestedQuestions]}
      locale={locale}
      launcherLabel={isDutch ? 'Vraag over mij' : 'Ask about me'}
      title={isDutch ? 'Vraag over Mohammadreza' : 'Ask about Mohammadreza'}
      intro={
        isDutch
          ? 'Vraag alles over mijn werk, vaardigheden, projecten of beschikbaarheid.'
          : 'Ask anything about my work, skills, projects, or availability.'
      }
    />
  )
}
