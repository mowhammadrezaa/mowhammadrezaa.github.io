'use client'

import {useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent} from 'react'

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
            return String((part as {text?: string}).text || '')
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
  subtitle,
  intro,
  suggestedQuestions = DEFAULT_QUESTIONS,
  launcherLabel = 'Ask about me',
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

  const heading = title || `Ask about ${personName}`
  const introCopy =
    intro || `Ask anything about ${personName}'s work, skills, projects, or availability.`

  useEffect(() => {
    if (!open) return
    bottomRef.current?.scrollIntoView({behavior: 'smooth', block: 'end'})
  }, [messages, open, busy])

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 180)
      return () => window.clearTimeout(t)
    }
  }, [open])

  async function send(raw: string) {
    const text = raw.trim()
    if (!text || busy) return

    const userMessage: UiMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
    }
    const assistantId = `a-${Date.now()}`

    setInput('')
    setBusy(true)
    setMessages((prev) => [...prev, userMessage, {id: assistantId, role: 'assistant', content: ''}])

    const nextHistory: ChatMessage[] = [...history, {role: 'user', content: text}]
    const payload: ChatMessage[] = [
      {role: 'system', content: buildSystemPrompt(personName, knowledgeBase)},
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
        throw new Error('No response received. Please try again.')
      }

      setHistory([...nextHistory, {role: 'assistant', content: answer}])
    } catch (error) {
      const message = (() => {
        if (error instanceof Error && error.message) {
          if (/reasoning_content/i.test(error.message)) {
            return 'The assistant hit a temporary model error. Please try again.'
          }
          return error.message
        }
        if (typeof error === 'string' && error) return error
        if (error && typeof error === 'object' && 'message' in error) {
          const value = (error as {message?: unknown}).message
          if (typeof value === 'string' && value) {
            if (/reasoning_content/i.test(value)) {
              return 'The assistant hit a temporary model error. Please try again.'
            }
            return value
          }
        }
        return 'Could not reach the assistant. Try again in a moment.'
      })()
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                id: `e-${Date.now()}`,
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

  function onSubmit(event: FormEvent) {
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
        <section
          id={panelId}
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-label={heading}
        >
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Resume assistant</p>
              <h2 className={styles.title}>{heading}</h2>
              {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
            </div>
            <button
              type="button"
              className={styles.close}
              aria-label="Close chat"
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
                  <span className={styles.typing} aria-label="Thinking">
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

          {suggestedQuestions.length > 0 && (
            <div className={styles.suggestionsBar} aria-label="Example questions">
              {suggestedQuestions.map((question) => (
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
              suggestedQuestions.length === 0 ? styles.composerSolo : '',
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
              placeholder={`Ask about ${personName}…`}
              disabled={busy}
              aria-label="Message"
            />
            <button className={styles.send} type="submit" disabled={busy || !input.trim()}>
              Send
            </button>
          </form>
        </section>
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
          <span className={styles.launcherLabel}>{launcherLabel}</span>
        </button>
      )}
    </div>
  )
}
