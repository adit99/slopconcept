'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import ChatInterface from '@/components/ChatInterface'
import XPicker from '@/components/XPicker'
import { ChatMessage, ExtractionResult, FeedPost, ToneOption } from '@/lib/types'
import { SEED_POSTS } from '@/lib/seed-data'

type Step = 'chat' | 'extracting' | 'pick' | 'posting'

async function fetchPost(id: string): Promise<FeedPost | null> {
  const seed = SEED_POSTS.find(p => p.id === id)
  if (seed) return seed
  try {
    const res = await fetch(`/api/posts?postId=${id}`)
    if (!res.ok) return null
    const { post } = await res.json()
    return post
  } catch {
    return null
  }
}

export default function ReplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [post, setPost] = useState<FeedPost | null>(null)
  const [postLoaded, setPostLoaded] = useState(false)
  const [step, setStep] = useState<Step>('chat')
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPost(id).then(p => { setPost(p); setPostLoaded(true) })
  }, [id])

  async function handleExtract(messages: ChatMessage[]) {
    setStep('extracting')
    const transcript = messages
      .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
      .join('\n\n')
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })
      if (!res.ok) throw new Error()
      const data: ExtractionResult = await res.json()
      setExtraction(data)
      setStep('pick')
    } catch {
      setError('extraction failed — try chatting a bit more')
      setStep('chat')
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
          parent_post_id: id,
        }),
      })
      if (!res.ok) throw new Error()
      router.push(`/thread/${id}`)
    } catch {
      setError('post failed — try again')
      setStep('pick')
    }
  }

  if (!postLoaded) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <span className="font-vt323 text-[16px] text-slop-dim uppercase tracking-wide">loading...</span>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-5">
        <span className="font-vt323 text-[16px] text-slop-dim uppercase tracking-wide">post not found</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar backHref={`/thread/${id}`} title="your slop" logoSize="small" />

      <div className="flex-1 px-5 py-5 flex flex-col gap-4 overflow-y-auto pb-10">
        {/* Context card */}
        <div className="bg-slop-surface border border-slop-border2 rounded-lg px-4 py-3.5">
          <div className="font-vt323 text-[12px] text-slop-dim uppercase tracking-widest mb-1.5">replying to</div>
          <p className="font-courier text-[13px] leading-[1.6] text-slop-secondary">
            <span className="text-slop-dim">{post.name} had a conversation with Claude about </span>
            {post.x_description}
          </p>
        </div>

        {error && (
          <div className="font-vt323 text-[14px] text-[#6b4a4a] uppercase tracking-wide">{error}</div>
        )}

        {step === 'chat' && (
          <ChatInterface parentPost={post} onReadyToExtract={handleExtract} />
        )}

        {step === 'extracting' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
            <div className="font-vt323 text-[18px] text-slop-secondary uppercase tracking-widest">
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
            submitLabel="post reply slop"
          />
        )}

        {step === 'posting' && (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="font-vt323 text-[18px] text-slop-secondary uppercase tracking-widest">posting...</div>
          </div>
        )}
      </div>
    </div>
  )
}
