'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'email' | 'code'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (err) throw err
      setStep('code')
    } catch {
      setError('something went wrong. try again.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'magiclink',
      })
      if (err) throw err

      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user!.id)
        .single()

      router.push(profile ? '/' : '/auth/onboarding')
    } catch {
      setError('invalid code. try again.')
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

      {step === 'email' ? (
        <form onSubmit={sendCode} className="w-full flex flex-col gap-3">
          <div className="border border-slop-border2 rounded-lg p-4 bg-slop-surface flex flex-col gap-2">
            <label className="font-vt323 text-[13px] text-slop-dim uppercase tracking-widest">your email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="bg-transparent border-none outline-none font-courier text-[15px] text-slop-ink placeholder:text-slop-dim"
              autoComplete="email"
              required
            />
          </div>
          {error && <div className="font-vt323 text-[14px] text-[#6b4a4a] uppercase tracking-wide px-1">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-[13px] bg-slop-ink text-slop-bg font-vt323 text-[18px] uppercase tracking-widest rounded-lg transition-colors hover:bg-slop-primary disabled:opacity-50"
          >
            {loading ? 'sending...' : 'get code'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="w-full flex flex-col gap-3">
          <div className="font-courier text-[14px] text-slop-secondary text-center mb-1">
            code sent to <span className="text-slop-ink">{email}</span>
          </div>
          <div className="border border-slop-border2 rounded-lg p-4 bg-slop-surface flex flex-col gap-2">
            <label className="font-vt323 text-[13px] text-slop-dim uppercase tracking-widest">6-digit code</label>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="bg-transparent border-none outline-none font-courier text-[24px] text-slop-ink placeholder:text-slop-dim tracking-widest"
              autoComplete="one-time-code"
              autoFocus
              required
            />
          </div>
          {error && <div className="font-vt323 text-[14px] text-[#6b4a4a] uppercase tracking-wide px-1">{error}</div>}
          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full py-[13px] bg-slop-ink text-slop-bg font-vt323 text-[18px] uppercase tracking-widest rounded-lg transition-colors hover:bg-slop-primary disabled:opacity-50"
          >
            {loading ? 'verifying...' : 'enter'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('email'); setCode(''); setError('') }}
            className="font-vt323 text-[14px] text-slop-dim uppercase tracking-wide text-center"
          >
            ← use different email
          </button>
        </form>
      )}
    </div>
  )
}
