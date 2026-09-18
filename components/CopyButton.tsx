'use client'

import {useState} from 'react'

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    const input = document.createElement('textarea')
    input.value = value
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.left = '-9999px'
    document.body.appendChild(input)
    input.select()
    // Legacy fallback for browsers where the asynchronous Clipboard API is unavailable.
    // oxlint-disable-next-line typescript/no-deprecated
    document.execCommand('copy')
    document.body.removeChild(input)
  }
}

export function CopyButton({
  value,
  label,
  locale = 'en',
}: {
  value: string
  label?: string
  locale?: 'nl' | 'en'
}) {
  const [copied, setCopied] = useState(false)
  const isDutch = locale === 'nl'
  const accessibleLabel = label || 'item'

  async function handleCopy() {
    await copyToClipboard(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex shrink-0 items-center gap-1.5 border border-black/15 bg-white px-2.5 py-1.5 font-sans text-xs font-medium tracking-wide text-gray-700 transition hover:border-black/40 hover:text-black"
      aria-label={
        copied
          ? isDutch
            ? `${accessibleLabel} gekopieerd`
            : `${accessibleLabel} copied`
          : isDutch
            ? `${accessibleLabel.toLowerCase()} naar het klembord kopiëren`
            : `Copy ${accessibleLabel.toLowerCase()} to clipboard`
      }
    >
      {copied ? (
        <>
          <CheckIcon />
          {isDutch ? 'Gekopieerd' : 'Copied'}
        </>
      ) : (
        <>
          <CopyIcon />
          {isDutch ? 'Kopiëren' : 'Copy'}
        </>
      )}
    </button>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M6.5 15H6A1.5 1.5 0 0 1 4.5 13.5v-8A1.5 1.5 0 0 1 6 4h8A1.5 1.5 0 0 1 15.5 5.5V6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5 9.5 17 19 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
