import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ContentType } from '@/lib/types'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const userId = searchParams.get('userId')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  try {
    const supabase = await createClient()
    let query = supabase
      .from('feed_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ posts: data })
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      x_description,
      moments,
      content_type = 'chat' as ContentType,
      artifact_url = null,
      parent_post_id = null,
    } = body

    if (!x_description || !moments) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    const { data: post, error: postErr } = await supabase
      .from('posts')
      .insert({ user_id: user.id, x_description, moments, content_type, artifact_url })
      .select('id')
      .single()

    if (postErr) throw postErr

    if (parent_post_id) {
      await supabase.from('replies').insert({
        parent_post_id,
        reply_post_id: post.id,
      })
    }

    return NextResponse.json({ postId: post.id })
  } catch (err) {
    console.error('post create error:', err)
    return NextResponse.json({ error: 'create failed' }, { status: 500 })
  }
}
