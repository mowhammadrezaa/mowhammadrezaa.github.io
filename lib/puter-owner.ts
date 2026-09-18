import 'server-only'

type PuterChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const PUTER_API_ORIGIN = process.env.PUTER_API_ORIGIN?.replace(/\/$/, '') || 'https://api.puter.com'

function extractText(result: unknown): string {
  if (typeof result === 'string') return result
  if (!result || typeof result !== 'object') return ''

  const obj = result as {
    text?: string
    message?: {content?: unknown} | string
    content?: unknown
    result?: unknown
  }

  if ('result' in obj && obj.result !== undefined) {
    return extractText(obj.result)
  }

  if (typeof obj.text === 'string' && obj.text) return obj.text
  if (typeof obj.message === 'string' && obj.message) return obj.message
  if (obj.message && typeof obj.message === 'object') {
    const content = obj.message.content
    if (typeof content === 'string' && content) return content
    if (typeof content === 'number' || typeof content === 'boolean') return String(content)
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

export function isOwnerCreditsError(error: unknown): boolean {
  const parts: string[] = []
  if (error instanceof Error) parts.push(error.message, error.name)
  if (typeof error === 'string') parts.push(error)
  if (error && typeof error === 'object') {
    const obj = error as {
      message?: unknown
      code?: unknown
      status?: unknown
      statusCode?: unknown
      error?: unknown
    }
    if (typeof obj.message === 'string') parts.push(obj.message)
    if (typeof obj.code === 'string') parts.push(obj.code)
    if (typeof obj.status === 'number') parts.push(String(obj.status))
    if (typeof obj.statusCode === 'number') parts.push(String(obj.statusCode))
    if (typeof obj.error === 'string') parts.push(obj.error)
    if (obj.error && typeof obj.error === 'object') {
      const nested = obj.error as {message?: unknown; code?: unknown}
      if (typeof nested.message === 'string') parts.push(nested.message)
      if (typeof nested.code === 'string') parts.push(nested.code)
    }
  }
  const haystack = parts.join(' ').toLowerCase()
  return (
    /\b402\b/.test(haystack) ||
    /insufficient[_ ]?(funds|credit|credits|quota)/i.test(haystack) ||
    /credit(s)? (exhausted|depleted|ran out)/i.test(haystack) ||
    /out of credit/i.test(haystack) ||
    /payment[_ ]required/i.test(haystack) ||
    /usage[_ ]limit/i.test(haystack)
  )
}

export async function ownerChat(
  messages: PuterChatMessage[],
  model: string,
): Promise<string> {
  const token = process.env.PUTER_AUTH_TOKEN?.trim()
  if (!token) {
    throw new Error('PUTER_AUTH_TOKEN is not configured')
  }

  const response = await fetch(`${PUTER_API_ORIGIN}/drivers/call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      interface: 'puter-chat-completion',
      driver: 'ai-chat',
      test_mode: false,
      method: 'complete',
      args: {
        messages,
        model,
        stream: false,
        normalize: true,
      },
      auth_token: token,
    }),
  })

  const rawText = await response.text()
  let payload: unknown = null
  try {
    payload = rawText ? JSON.parse(rawText) : null
  } catch {
    payload = {message: rawText}
  }

  if (!response.ok) {
    const error = new Error(
      typeof payload === 'object' &&
        payload &&
        'message' in payload &&
        typeof (payload as {message?: unknown}).message === 'string'
        ? (payload as {message: string}).message
        : `Puter API failed with status ${response.status}`,
    ) as Error & {status?: number; payload?: unknown}
    error.status = response.status
    error.payload = payload
    if (response.status === 402 || isOwnerCreditsError(error) || isOwnerCreditsError(payload)) {
      const exhausted = new Error('OWNER_CREDITS_EXHAUSTED')
      exhausted.name = 'OwnerCreditsExhausted'
      throw exhausted
    }
    throw error
  }

  const answer = extractText(payload)
  if (!answer.trim()) {
    throw new Error('No response received from owner Puter chat')
  }
  return answer
}
