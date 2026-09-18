import type {PuterGlobal} from './types'

/**
 * Loads Puter’s public browser SDK (https://js.puter.com/v2/).
 * Chat calls authenticate as the visiting user — there is no site API key.
 * Visitors sign in / continue via Puter’s own UI when required.
 */
const PUTER_SCRIPT = 'https://js.puter.com/v2/'
let loading: Promise<PuterGlobal> | null = null

export function loadPuter(): Promise<PuterGlobal> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Puter.js only runs in the browser'))
  }
  if (window.puter?.ai?.chat) {
    return Promise.resolve(window.puter)
  }
  if (loading) return loading

  loading = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PUTER_SCRIPT}"]`)
    const onReady = () => {
      if (window.puter?.ai?.chat) resolve(window.puter)
      else reject(new Error('Puter.js loaded but puter.ai.chat is unavailable'))
    }

    if (existing) {
      if (window.puter?.ai?.chat) {
        onReady()
        return
      }
      existing.addEventListener('load', onReady, {once: true})
      existing.addEventListener('error', () => reject(new Error('Failed to load Puter.js')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = PUTER_SCRIPT
    script.async = true
    script.addEventListener('load', onReady, {once: true})
    script.addEventListener('error', () => reject(new Error('Failed to load Puter.js')), {
      once: true,
    })
    document.head.appendChild(script)
  })

  return loading
}
