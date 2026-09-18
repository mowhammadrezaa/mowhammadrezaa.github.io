'use client'

import {GoogleAnalytics} from '@next/third-parties/google'
import {useSyncExternalStore} from 'react'

import type {CookieDictionary} from '@/i18n/dictionaries'
import {COOKIE_CONSENT_KEY} from '@/lib/site'

type Consent = 'accepted' | 'rejected'

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getConsentSnapshot(): Consent | null {
  const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY)
  return stored === 'accepted' || stored === 'rejected' ? stored : null
}

function getServerConsentSnapshot(): Consent | null {
  return null
}

function setConsent(value: Consent) {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, value)
  listeners.forEach((listener) => listener())
}

export function AnalyticsConsent({
  gaId,
  enabled,
  dictionary,
}: {
  gaId: string
  enabled: boolean
  dictionary: CookieDictionary
}) {
  const consent = useSyncExternalStore(subscribe, getConsentSnapshot, getServerConsentSnapshot)

  if (!enabled) return null

  return (
    <>
      {consent === 'accepted' ? <GoogleAnalytics gaId={gaId} /> : null}
      {consent === null ? (
        <dialog
          open
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-body"
          className="fixed inset-x-0 bottom-0 z-[90] m-0 w-full max-w-none border-0 border-t border-black/10 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:p-5"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
            <div className="max-w-2xl">
              <p
                id="cookie-consent-title"
                className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gray-400"
              >
                {dictionary.title}
              </p>
              <p
                id="cookie-consent-body"
                className="mt-2 font-serif text-base leading-relaxed text-gray-700 md:text-lg"
              >
                {dictionary.body}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                className="border border-black/15 px-4 py-2.5 text-sm tracking-wide text-gray-600 transition hover:border-black/40 hover:text-black"
                onClick={() => setConsent('rejected')}
              >
                {dictionary.reject}
              </button>
              <button
                type="button"
                className="bg-black px-4 py-2.5 text-sm tracking-wide text-white transition hover:bg-black/85"
                onClick={() => setConsent('accepted')}
              >
                {dictionary.accept}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  )
}
