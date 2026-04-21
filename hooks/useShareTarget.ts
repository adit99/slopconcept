'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export function useShareTarget() {
  const params = useSearchParams()

  return useMemo(() => {
    const title = params.get('title') ?? ''
    const text  = params.get('text')  ?? ''
    const url   = params.get('url')   ?? ''

    // Try to detect if text looks like a transcript
    const looksLikeTranscript =
      text.length > 200 &&
      (text.includes('Human:') || text.includes('Assistant:') ||
       text.includes('\n\n') || text.split('\n').length > 4)

    const rawTranscript = looksLikeTranscript ? text : ''
    const sourceUrl     = url || ''
    const shareTitle    = title

    return { rawTranscript, sourceUrl, shareTitle, rawText: text, hasData: !!(text || url) }
  }, [params])
}
