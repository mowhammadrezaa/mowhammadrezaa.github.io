import {buildSystemPrompt} from '@/packages/puter-resume-chat/src/buildSystemPrompt'
import {CHAT_KNOWLEDGE, PERSON_NAME} from '@/lib/mohammadreza-knowledge'
import {isOwnerCreditsError, ownerChat} from '@/lib/puter-owner'

const MAX_MESSAGES = 24
const MAX_CONTENT_CHARS = 4000
const DEFAULT_MODEL = 'gpt-4o-mini'

type ClientMessage = {
  role: 'user' | 'assistant'
  content: string
}

function isLocale(value: unknown): value is 'nl' | 'en' {
  return value === 'nl' || value === 'en'
}

function sanitizeMessages(raw: unknown): ClientMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null

  const messages: ClientMessage[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null
    const role = (item as {role?: unknown}).role
    const content = (item as {content?: unknown}).content
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null
    const trimmed = content.trim()
    if (!trimmed || trimmed.length > MAX_CONTENT_CHARS) return null
    messages.push({role, content: trimmed})
  }

  if (messages[0]?.role !== 'user') return null
  return messages
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({error: 'Invalid JSON body', code: 'bad_request'}, {status: 400})
  }

  const locale = isLocale((body as {locale?: unknown})?.locale)
    ? (body as {locale: 'nl' | 'en'}).locale
    : 'en'
  const model =
    typeof (body as {model?: unknown})?.model === 'string' &&
    (body as {model: string}).model.trim()
      ? (body as {model: string}).model.trim().slice(0, 80)
      : DEFAULT_MODEL
  const messages = sanitizeMessages((body as {messages?: unknown})?.messages)

  if (!messages) {
    return Response.json(
      {error: 'Invalid chat messages', code: 'bad_request'},
      {status: 400},
    )
  }

  if (!process.env.PUTER_AUTH_TOKEN?.trim()) {
    return Response.json(
      {
        error: 'Owner Puter token is not configured',
        code: 'owner_unavailable',
      },
      {status: 503},
    )
  }

  const knowledge = CHAT_KNOWLEDGE[locale].knowledgeBase
  const payload = [
    {
      role: 'system' as const,
      content: buildSystemPrompt(PERSON_NAME, knowledge, locale),
    },
    ...messages,
  ]

  try {
    const answer = await ownerChat(payload, model)
    return Response.json({answer, billedTo: 'owner'})
  } catch (error) {
    if (
      (error instanceof Error && error.message === 'OWNER_CREDITS_EXHAUSTED') ||
      isOwnerCreditsError(error)
    ) {
      return Response.json(
        {
          error: 'Owner Puter credits are exhausted',
          code: 'owner_credits_exhausted',
        },
        {status: 402},
      )
    }

    console.error('Owner Puter chat failed', error instanceof Error ? error.message : error)
    return Response.json(
      {
        error: 'Owner chat temporarily unavailable',
        code: 'owner_error',
      },
      {status: 502},
    )
  }
}
