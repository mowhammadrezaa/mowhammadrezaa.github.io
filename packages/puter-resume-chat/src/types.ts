export type ChatRole = 'system' | 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
}

export type PuterResumeChatProps = {
  /** Display name of the person this bot knows about */
  personName: string
  /**
   * Plain-text knowledge base (resume, bio, projects, contact).
   * Injected into the system prompt — keep it factual.
   */
  knowledgeBase: string
  /** Optional line under the title (omit to hide) */
  subtitle?: string
  /** Intro copy shown before the first message */
  intro?: string
  /** Example questions shown before the first message */
  suggestedQuestions?: string[]
  /** Floating launcher label (aria + tooltip) */
  launcherLabel?: string
  /** Panel title */
  title?: string
  /**
   * Puter model id.
   * Auth/billing is handled by Puter’s browser SDK for the visitor —
   * do not pass a site owner API key (none is supported here).
   */
  model?: string
  /** Extra class on the root portal wrapper */
  className?: string
  /** Start open (useful for demos) */
  defaultOpen?: boolean
}

export type PuterAiChatOptions = {
  model?: string
  stream?: boolean
  /** Force OpenAI-shaped responses across providers (avoids SDK field mismatches). */
  normalize?: boolean
}

export type PuterChatChunk = {
  type?: string
  text?: string
  reasoning?: string
  message?: string
  content?: string
}

export type PuterGlobal = {
  ai: {
    chat: (
      messages: ChatMessage[] | string,
      options?: PuterAiChatOptions,
    ) => Promise<
      | AsyncIterable<PuterChatChunk>
      | {message?: {content?: string | unknown}; text?: string}
      | string
    >
  }
}

declare global {
  interface Window {
    puter?: PuterGlobal
  }
}

export {}
