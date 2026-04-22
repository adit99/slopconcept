import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code       = searchParams.get('code')
  const tokenHash  = searchParams.get('token_hash')
  const type       = searchParams.get('type') as EmailOtpType | null
  const next       = searchParams.get('next') ?? '/'

  const supabase = await createClient()
  let user = null

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) user = data.user
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) user = data.user
  }

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    return NextResponse.redirect(`${origin}${profile ? next : '/auth/onboarding'}`)
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
