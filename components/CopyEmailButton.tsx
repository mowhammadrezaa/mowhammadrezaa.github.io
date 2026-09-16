'use client'

import {CopyButton} from '@/components/CopyButton'

const EMAIL = 'm.hosseini.eng@outlook.com'

export function CopyEmailButton({email = EMAIL}: {email?: string}) {
  return (
    <div className="mt-10 border-t border-black/[0.08] pt-8">
      <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
        Email
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${email}`}
          className="font-mono text-sm text-gray-700 transition hover:text-black md:text-[0.95rem]"
        >
          {email}
        </a>
        <CopyButton value={email} label="email" />
      </div>
    </div>
  )
}
