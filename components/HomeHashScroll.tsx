'use client'

import {useEffect} from 'react'

/** Scroll to a hash target after the home page mounts (e.g. visiting `/#work`). */
export function HomeHashScroll() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash || hash === '#') return undefined
    const id = decodeURIComponent(hash.slice(1))
    const target = document.getElementById(id)
    if (!target) return undefined
    // Wait a tick for layout/images
    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({behavior: 'smooth', block: 'start'})
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return null
}
