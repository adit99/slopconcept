'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import XPicker from '@/components/XPicker'
import { useShareTarget } from '@/hooks/useShareTarget'
import { ExtractionResult, ToneOption } from '@/lib/types'

type Step = 'paste' | 'extracting' | 'pick' | 'posting'

function ShareFlow() {
  const router = useRouter()
  const { rawTranscript, rawText, hasData } = useShareTarget()

  const [step, setStep] = useState<Step>(rawTranscript ? 'extracting' : 'paste')
  const [transcript, setTranscript] = useState(rawTranscript || rawText || '')
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null)
  const [error, setError] = useState('')

  // Auto-extract if we got a transcript from share sheet
  useEffect(() => {
    if (rawTranscript) {
      extractTranscript(rawTranscript)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function extractTranscript(text: string) {
    setStep('extracting')
    setError('')
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data: ExtractionResult = await res.json()
      setExtraction(data)
      setStep('pick')
    } catch {
      setError('extraction failed. try pasting a longer transcript.')
      setStep('paste')
    }
  }

  async function handlePost(selected: ToneOption) {
    if (!extraction) return
    setStep('posting')
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x_description: selected.text,
          moments: extraction.moments,
          content_type: 'chat',
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { postId } = await res.json()
      router.push(`/post/${postId}`)
    } catch {
      setError('post failed. try again.')
      setStep('pick')
    }
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar
        backHref="/"
        backLabel="← cancel"
        title={step === 'pick' ? 'your slop' : 'share a slop'}
        logoSize="small"
      />

      <div className="flex-1 px-5 py-[22px] flex flex-col gap-4 overflow-y-auto pb-10">
        {step === 'paste' && (
          <>
            <div className="font-courier italic text-[16px] text-slop-secondary leading-[1.55]">
              paste your conversation transcript, or{' '}
              <span className="text-slop-ink">open Claude or ChatGPT</span> and share directly.
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => { window.location.href = 'claude://' }}
                className="flex items-center justify-between px-[18px] py-[15px] bg-slop-surface2 border border-slop-border2 rounded-[10px] hover:border-slop-secondary transition-colors"
              >
                <div>
                  <div className="font-vt323 text-[18px] text-slop-ink tracking-wide text-left">OPEN CLAUDE</div>
                  <div className="font-courier text-[11px] text-slop-dim text-left">share your conversation from there</div>
                </div>
                <span className="font-vt323 text-[22px] text-slop-secondary">→</span>
              </button>

              <button
                onClick={() => { window.location.href = 'chatgpt://' }}
                className="flex items-center justify-between px-[18px] py-[15px] bg-slop-surface2 border border-slop-border2 rounded-[10px] hover:border-slop-secondary transition-colors"
              >
                <div>
                  <div className="font-vt323 text-[18px] text-slop-ink tracking-wide text-left">OPEN CHATGPT</div>
                  <div className="font-courier text-[11px] text-slop-dim text-left">share your conversation from there</div>
                </div>
                <span className="font-vt323 text-[22px] text-slop-secondary">→</span>
              </button>
            </div>

            <div className="border border-slop-border2 rounded-lg p-4 bg-slop-surface flex flex-col gap-2">
              <label className="font-vt323 text-[13px] text-slop-dim uppercase tracking-widest">
                or paste transcript
              </label>
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                rows={8}
                placeholder="paste your conversation here..."
                className="bg-transparent border-none outline-none font-courier text-[13px] text-slop-ink leading-[1.65] resize-none w-full placeholder:text-slop-dim"
              />
            </div>

            {error && (
              <div className="font-vt323 text-[14px] text-[#6b4a4a] uppercase tracking-wide">{error}</div>
            )}

            <button
              onClick={() => extractTranscript(transcript)}
              disabled={transcript.trim().length < 50}
              className="w-full py-[13px] bg-slop-ink text-slop-bg font-vt323 text-[18px] uppercase tracking-widest rounded-lg transition-colors hover:bg-slop-primary disabled:opacity-50"
            >
              extract →
            </button>
          </>
        )}

        {step === 'extracting' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="font-vt323 text-[20px] text-slop-secondary uppercase tracking-widest">
              reading the conversation...
            </div>
            <div className="font-courier text-[13px] text-slop-dim italic">
              finding what was actually happening
            </div>
          </div>
        )}

        {step === 'pick' && extraction && (
          <XPicker
            options={extraction.options}
            onSubmit={handlePost}
            isSubmitting={false}
          />
        )}

        {step === 'posting' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="font-vt323 text-[20px] text-slop-secondary uppercase tracking-widest">posting...</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <span className="font-vt323 text-[16px] text-slop-dim uppercase tracking-wide">loading...</span>
      </div>
    }>
      <ShareFlow />
    </Suspense>
  )
}
