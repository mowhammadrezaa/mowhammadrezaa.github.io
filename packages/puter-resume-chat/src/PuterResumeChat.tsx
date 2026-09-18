'use client'

import {useEffect, useId, useRef, useState, type KeyboardEvent, type SyntheticEvent} from 'react'

import {buildSystemPrompt} from './buildSystemPrompt'
import {ChatMarkdown} from './ChatMarkdown'
import {loadPuter} from './loadPuter'
import styles from './PuterResumeChat.module.css'
import type {ChatMessage, PuterChatChunk, PuterGlobal, PuterResumeChatProps} from './types'

type UiMessage = {
  id: string
  role: 'user' | 'assistant' | 'error'
  content: string
}

const DEFAULT_QUESTIONS = [
  'What is their current role?',
  'What are their strongest skills?',
  'Tell me about a recent project',
  'Are they available to hire?',
]

const DUTCH_DEFAULT_QUESTIONS = [
  'Wat is zijn huidige functie?',
  'Wat zijn zijn sterkste vaardigheden?',
  'Vertel me over een recent project',
  'Is hij beschikbaar voor werk?',
]

function extractText(result: unknown): string {
  if (typeof result === 'string') return result
  if (!result || typeof result !== 'object') return ''

  const obj = result as {
    text?: string
    message?: {content?: unknown} | string
    content?: unknown
  }

  if (typeof obj.text === 'string' && obj.text) return obj.text
  if (typeof obj.message === 'string' && obj.message) return obj.message
  if (obj.message && typeof obj.message === 'object') {
    const content = obj.message.content
    if (typeof content === 'string' && content) return content
    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === 'string') return part
          if (part && typeof part === 'object' && 'text' in part) {
            return (part as {text?: string}).text || ''
          }
          return ''
        })
        .join('')
    }
  }
  if (typeof obj.content === 'string') return obj.content
  return ''
}

function isAsyncIterable(value: unknown): value is AsyncIterable<PuterChatChunk> {
  return Boolean(value && typeof value === 'object' && Symbol.asyncIterator in value)
}

async function collectStream(
  stream: AsyncIterable<PuterChatChunk>,
  onChunk: (text: string) => void,
) {
  let full = ''
  for await (const chunk of stream) {
    if (!chunk || typeof chunk !== 'object') continue
    if (chunk.type === 'error') {
      throw new Error(chunk.message || 'The model returned an error while streaming.')
    }
    // Skip reasoning / usage / tool chunks — only show answer text.
    if (chunk.type && chunk.type !== 'text') continue
    const piece = typeof chunk.text === 'string' ? chunk.text : ''
    if (!piece) continue
    full += piece
    onChunk(full)
  }
  return full
}

/**
 * Prefer normalized non-streaming completion.
 * Puter’s stream path can throw `Cannot read properties of undefined (reading 'reasoning_content')`
 * on some models; non-stream + normalize avoids that SDK bug.
 */
async function completeChat(
  puter: PuterGlobal,
  payload: ChatMessage[],
  model: string,
  onPartial: (text: string) => void,
) {
  try {
    const response = await puter.ai.chat(payload, {
      model,
      stream: false,
      normalize: true,
    })
    const answer = extractText(response)
    if (answer.trim()) {
      onPartial(answer)
      return answer
    }
  } catch {
    // Retry with streaming below.
  }

  const streamed = await puter.ai.chat(payload, {model, stream: true})
  if (!isAsyncIterable(streamed)) {
    const answer = extractText(streamed)
    onPartial(answer)
    return answer
  }
  return collectStream(streamed, onPartial)
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4.2 3.15A.75.75 0 0 1 4.5 18.5V6.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PuterResumeChat({
  personName,
  knowledgeBase,
  locale = 'en',
  subtitle,
  intro,
  suggestedQuestions,
  launcherLabel,
  title,
  model = 'gpt-4o-mini',
  className,
  defaultOpen = false,
}: PuterResumeChatProps) {
  const panelId = useId()
  const [open, setOpen] = useState(defaultOpen)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [history, setHistory] = useState<ChatMessage[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messageSequence = useRef(0)

  const isDutch = locale === 'nl'
  const questions = suggestedQuestions ?? (isDutch ? DUTCH_DEFAULT_QUESTIONS : DEFAULT_QUESTIONS)
  const heading = title || (isDutch ? `Vraag over ${personName}` : `Ask about ${personName}`)
  const introCopy =
    intro ||
    (isDutch
      ? `Vraag alles over het werk, de vaardigheden, projecten of beschikbaarheid van ${personName}.`
      : `Ask anything about ${personName}'s work, skills, projects, or availability.`)
  const copy = isDutch
    ? {
        assistant: 'Cv-assistent',
        close: 'Chat sluiten',
        thinking: 'Bezig met nadenken',
        examples: 'Voorbeeldvragen',
        placeholder: `Vraag over ${personName}…`,
        message: 'Bericht',
        send: 'Versturen',
        launcher: launcherLabel || 'Vraag over mij',
        noResponse: 'Geen antwoord ontvangen. Probeer het opnieuw.',
        temporaryError: 'Er is tijdelijk een probleem met het model. Probeer het opnieuw.',
        unreachable: 'De assistent is niet bereikbaar. Probeer het over een moment opnieuw.',
      }
    : {
        assistant: 'Resume assistant',
        close: 'Close chat',
        thinking: 'Thinking',
        examples: 'Example questions',
        placeholder: `Ask about ${personName}…`,
        message: 'Message',
        send: 'Send',
        launcher: launcherLabel || 'Ask about me',
        noResponse: 'No response received. Please try again.',
        temporaryError: 'The assistant hit a temporary model error. Please try again.',
        unreachable: 'Could not reach the assistant. Try again in a moment.',
      }

  const messageCount = messages.length
  useEffect(() => {
    if (!open) return undefined
    if (messageCount >= 0) {
      bottomRef.current?.scrollIntoView({behavior: 'smooth', block: 'end'})
    }
    return undefined
  }, [messageCount, open])

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 180)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [open])

  async function send(raw: string) {
    const text = raw.trim()
    if (!text || busy) return

    messageSequence.current += 1
    const sequence = messageSequence.current
    const userMessage: UiMessage = {
      id: `u-${sequence}`,
      role: 'user',
      content: text,
    }
    const assistantId = `a-${sequence}`

    setInput('')
    setBusy(true)
    setMessages((prev) => [...prev, userMessage, {id: assistantId, role: 'assistant', content: ''}])

    const nextHistory: ChatMessage[] = [...history, {role: 'user', content: text}]
    const payload: ChatMessage[] = [
      {role: 'system', content: buildSystemPrompt(personName, knowledgeBase, locale)},
      ...nextHistory,
    ]

    try {
      const puter = await loadPuter()
      const answer = await completeChat(puter, payload, model, (partial) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? {...m, content: partial} : m)),
        )
      })

      if (!answer.trim()) {
        throw new Error(copy.noResponse)
      }

      setHistory([...nextHistory, {role: 'assistant', content: answer}])
    } catch (error) {
      const message = (() => {
        if (error instanceof Error && error.message) {
          if (/reasoning_content/i.test(error.message)) {
            return copy.temporaryError
          }
          return error.message
        }
        if (typeof error === 'string' && error) return error
        if (error && typeof error === 'object' && 'message' in error) {
          const value = (error as {message?: unknown}).message
          if (typeof value === 'string' && value) {
            if (/reasoning_content/i.test(value)) {
              return copy.temporaryError
            }
            return value
          }
        }
        return copy.unreachable
      })()
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                id: `e-${sequence}`,
                role: 'error',
                content: message,
              }
            : m,
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    void send(input)
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send(input)
    }
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {open ? (
        <dialog
          open
          id={panelId}
          className={styles.panel}
          aria-label={heading}
        >
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>{copy.assistant}</p>
              <h2 className={styles.title}>{heading}</h2>
              {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
            </div>
            <button
              type="button"
              className={styles.close}
              aria-label={copy.close}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          <div className={styles.messages} aria-live="polite">
            {messages.length === 0 && (
              <div className={styles.intro}>
                <p className={styles.introText}>{introCopy}</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={[
                  styles.bubble,
                  message.role === 'user'
                    ? styles.bubbleUser
                    : message.role === 'error'
                      ? styles.bubbleError
                      : styles.bubbleAssistant,
                ].join(' ')}
              >
                {message.role === 'assistant' && !message.content && busy ? (
                  <span className={styles.typing} aria-label={copy.thinking}>
                    <span />
                    <span />
                    <span />
                  </span>
                ) : message.role === 'assistant' ? (
                  <ChatMarkdown content={message.content} />
                ) : (
                  message.content
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {questions.length > 0 && (
            <div className={styles.suggestionsBar} aria-label={copy.examples}>
              {questions.map((question) => (
                <button
                  key={question}
                  type="button"
                  className={styles.suggestion}
                  disabled={busy}
                  onClick={() => void send(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <form
            className={[
              styles.composer,
              questions.length === 0 ? styles.composerSolo : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onSubmit={onSubmit}
          >
            <textarea
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={copy.placeholder}
              disabled={busy}
              aria-label={copy.message}
            />
            <button className={styles.send} type="submit" disabled={busy || !input.trim()}>
              {copy.send}
            </button>
          </form>
        </dialog>
      ) : (
        <button
          type="button"
          className={styles.launcher}
          aria-expanded={false}
          aria-controls={panelId}
          onClick={() => setOpen(true)}
        >
          <span className={styles.launcherIcon}>
            <ChatIcon />
          </span>
          <span className={styles.launcherLabel}>{copy.launcher}</span>
        </button>
      )}
    </div>
  )
}
