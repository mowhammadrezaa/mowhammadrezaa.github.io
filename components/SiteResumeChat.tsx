'use client'

import {PuterResumeChat} from '@/packages/puter-resume-chat/src'
import {
  KNOWLEDGE_BASE,
  PERSON_NAME,
  SUGGESTED_QUESTIONS,
} from '@/lib/mohammadreza-knowledge'

/**
 * Site wrapper: Puter.js runs in the visitor’s browser with their Puter session.
 * No owner API key is configured or required.
 */
export function SiteResumeChat() {
  return (
    <PuterResumeChat
      personName={PERSON_NAME}
      knowledgeBase={KNOWLEDGE_BASE}
      suggestedQuestions={SUGGESTED_QUESTIONS}
      launcherLabel="Ask about me"
      title="Ask about Mohammadreza"
      intro="Ask anything about My work, skills, projects, or availability."
    />
  )
}
