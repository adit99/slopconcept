'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage, FeedPost } from '@/lib/types'

interface ChatInterfaceProps {
  parentPost: FeedPost
  onReadyToExtract: (messages: ChatMessage[]) => void
}

const EXTRACT_THRESHOLD = 2 // min user messages before extract button shows

export default function ChatInterface({ parentPost, onReadyToExtract }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `someone was working through something about ${parentPost.x_description}. what does that bring up for you?`,
    },
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const msgsRef = useRef<HTMLDivElement>(null)

  const userMessages = messages.filter(m => m.role === 'user').length
  const canExtract = userMessages >= EXTRACT_THRESHOLD

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }
  }, [messages, streamingText])

  async function send() {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    const userMsg: ChatMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setStreaming(true)
    setStreamingText('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          xDescription: parentPost.x_description,
          moments: parentPost.moments,
        }),
      })

      if (!res.body) throw new Error('no stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamingText(accumulated)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulated }])
      setStreamingText('')
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '...' }])
    } finally {
      setStreaming(false)
    }
  }

  function buildTranscript(): string {
    return messages
      .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
      .join('\n\n')
  }

  return (
    <div className="flex flex-col flex-1 border border-slop-border rounded-lg overflow-hidden min-h-[320px]">
      {/* Messages */}
      <div
        ref={msgsRef}
        className="flex-1 p-3.5 flex flex-col gap-2.5 bg-slop-surface overflow-y-auto max-h-[320px]"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-0.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`font-vt323 text-[11px] uppercase tracking-widest text-slop-dim ${msg.role === 'user' ? 'text-right' : ''}`}>
              {msg.role === 'user' ? 'you' : 'slop · claude'}
            </div>
            <div
              className={`font-courier text-[13px] leading-[1.65] px-3 py-2 rounded-lg max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-slop-surface2 text-slop-ink rounded-br-sm'
                  : 'bg-slop-bg text-slop-secondary border border-slop-border rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {streaming && streamingText && (
          <div className="flex flex-col gap-0.5 items-start">
            <div className="font-vt323 text-[11px] uppercase tracking-widest text-slop-dim">slop · claude</div>
            <div className="font-courier text-[13px] leading-[1.65] px-3 py-2 rounded-lg rounded-bl-sm max-w-[85%] bg-slop-bg text-slop-secondary border border-slop-border">
              {streamingText}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 p-2.5 bg-slop-bg border-t border-slop-border">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="say something..."
          rows={1}
          className="flex-1 bg-slop-surface border border-slop-border2 rounded-md px-2.5 py-2 font-courier text-[13px] text-slop-ink placeholder:text-slop-dim outline-none resize-none"
        />
        <button
          onClick={send}
          disabled={!input.trim() || streaming}
          className="font-vt323 text-[18px] text-slop-secondary hover:text-slop-primary transition-colors px-2 py-1 disabled:opacity-30"
        >
          →
        </button>
      </div>

      {/* Extract button */}
      {canExtract && (
        <button
          onClick={() => onReadyToExtract(messages)}
          className="mx-2.5 mb-2.5 py-2.5 border border-slop-border2 rounded-lg font-vt323 text-[15px] text-slop-secondary uppercase tracking-wide hover:text-slop-ink hover:border-slop-secondary transition-colors"
        >
          extract this conversation →
        </button>
      )}
    </div>
  )
}
