import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { postId, liked } = await request.json()
    if (!postId) return NextResponse.json({ error: 'missing postId' }, { status: 400 })

    if (liked) {
      await supabase.from('likes').upsert({ user_id: user.id, post_id: postId })
    } else {
      await supabase.from('likes').delete().match({ user_id: user.id, post_id: postId })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'like failed' }, { status: 500 })
  }
}
