'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.endsWith('.edu')) {
      setError('only .edu emails for now')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      })
      if (err) throw err
      setSent(true)
    } catch {
      setError('something went wrong. try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5">
      <div className="font-vt323 text-[48px] text-slop-primary mb-2">slop.</div>
      <div className="font-courier italic text-[15px] text-slop-secondary mb-12 text-center">
        share your AI conversations
      </div>

      {sent ? (
        <div className="text-center">
          <div className="font-vt323 text-[20px] text-slop-ink mb-3 uppercase tracking-wide">check your email</div>
          <div className="font-courier text-[14px] text-slop-secondary">
            we sent a link to <span className="text-slop-ink">{email}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <div className="border border-slop-border2 rounded-lg p-4 bg-slop-surface flex flex-col gap-2">
            <label className="font-vt323 text-[13px] text-slop-dim uppercase tracking-widest">
              your .edu email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@school.edu"
              className="bg-transparent border-none outline-none font-courier text-[15px] text-slop-ink placeholder:text-slop-dim"
              autoComplete="email"
              required
            />
          </div>

          {error && (
            <div className="font-vt323 text-[14px] text-[#6b4a4a] uppercase tracking-wide px-1">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[13px] bg-slop-ink text-slop-bg font-vt323 text-[18px] uppercase tracking-widest rounded-lg transition-colors hover:bg-slop-primary disabled:opacity-50"
          >
            {loading ? 'sending...' : 'get link'}
          </button>

          <div className="font-courier text-[12px] text-slop-dim text-center italic">
            school email only for now. expanding soon.
          </div>
        </form>
      )}
    </div>
  )
}
