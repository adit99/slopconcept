'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [school, setSchool] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!/^[a-z0-9_]{2,20}$/.test(handle)) {
      setError('handle: 2–20 chars, lowercase letters/numbers/underscores only')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('not authenticated')

      const { error: err } = await supabase.from('users').insert({
        id: user.id,
        handle,
        name,
        school: school || null,
        avatar_initials: getInitials(name),
      })

      if (err) {
        if (err.code === '23505') {
          setError('that handle is taken')
        } else {
          throw err
        }
        return
      }

      router.push('/')
    } catch {
      setError('something went wrong. try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-5 py-12">
      <div className="font-vt323 text-[32px] text-slop-primary mb-2">set up your slop.</div>
      <div className="font-courier italic text-[14px] text-slop-secondary mb-10">
        just a name and a handle
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {[
          { label: 'your name', value: name, onChange: setName, placeholder: 'Aditya', type: 'text' },
          { label: 'handle', value: handle, onChange: (v: string) => setHandle(v.toLowerCase().replace(/[^a-z0-9_]/g, '')), placeholder: 'aj', type: 'text' },
          { label: 'school (optional)', value: school, onChange: setSchool, placeholder: 'NYU', type: 'text' },
        ].map(({ label, value, onChange, placeholder, type }) => (
          <div key={label} className="border border-slop-border2 rounded-lg p-4 bg-slop-surface flex flex-col gap-2">
            <label className="font-vt323 text-[13px] text-slop-dim uppercase tracking-widest">{label}</label>
            <input
              type={type}
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              className="bg-transparent border-none outline-none font-courier text-[15px] text-slop-ink placeholder:text-slop-dim"
            />
          </div>
        ))}

        {error && (
          <div className="font-vt323 text-[14px] text-[#6b4a4a] uppercase tracking-wide px-1">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !name || !handle}
          className="w-full py-[13px] bg-slop-ink text-slop-bg font-vt323 text-[18px] uppercase tracking-widest rounded-lg transition-colors hover:bg-slop-primary disabled:opacity-50 mt-2"
        >
          {loading ? 'saving...' : 'start slopping'}
        </button>
      </form>
    </div>
  )
}
