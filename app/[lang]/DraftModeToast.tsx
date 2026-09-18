'use client'

import {useIsPresentationTool} from 'next-sanity/hooks'
import {useEffect} from 'react'
import {toast} from 'sonner'

export function DraftModeToast({
  action,
  locale,
}: {
  action: () => Promise<void>
  locale: 'nl' | 'en'
}) {
  const isPresentationTool = useIsPresentationTool()
  const isDutch = locale === 'nl'

  useEffect(() => {
    /**
     * We don't want to show the toast if we're inside the Presentation Tool iframe or a preview popup window.
     * `useIsPresentationTool` is `null` initially, and then `false` when it's determined that we're not in Presentation Tool
     */
    if (isPresentationTool !== false) {
      return () => {}
    }

    const toastId = toast(isDutch ? 'Conceptmodus ingeschakeld' : 'Draft Mode Enabled', {
      id: 'draft-mode-toast',
      description: isDutch
        ? 'Inhoud wordt live en automatisch bijgewerkt'
        : 'Content is live, refreshing automatically',
      duration: Infinity,
      action: {
        label: isDutch ? 'Uitschakelen' : 'Disable',
        onClick: () =>
          toast.promise(action(), {
            loading: isDutch ? 'Conceptmodus uitschakelen…' : 'Disabling draft mode…',
          }),
      },
    })
    return () => {
      // If this component is unmounted we assume it's because draft mode is no longer enabled
      toast.dismiss(toastId)
    }
  }, [action, isDutch, isPresentationTool])

  return null
}
