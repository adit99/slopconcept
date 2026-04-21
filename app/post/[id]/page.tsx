import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SEED_POSTS } from '@/lib/seed-data'
import { FeedPost } from '@/lib/types'
import NavBar from '@/components/NavBar'
import AvatarInitials from '@/components/AvatarInitials'
import TabBar from '@/components/TabBar'
import { formatRelativeTime } from '@/lib/utils'

async function getPost(id: string): Promise<FeedPost | null> {
  // Check seed data first
  const seed = SEED_POSTS.find(p => p.id === id)
  if (seed) return seed

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('feed_posts')
      .select('*')
      .eq('id', id)
      .single()
    return data as FeedPost | null
  } catch {
    return null
  }
}

// Seed transcript for demo
const SEED_TRANSCRIPT: Record<string, Array<{ role: 'human' | 'ai'; text: string; highlight?: boolean }>> = {
  'seed-1': [
    { role: 'human', text: 'High concept I know', highlight: true },
    { role: 'ai',    text: 'What\'s the core tension you\'re sitting with?...' },
    { role: 'human', text: 'Help me concept it' },
    { role: 'ai',    text: 'Young adults already use chatbots as a kind of private thinking space...' },
    { role: 'human', text: 'Nah the solo value is ChatGPT or Claude right', highlight: true },
    { role: 'ai',    text: 'Exactly. You can\'t win that fight...' },
    { role: 'human', text: 'Okay stop you\'re just asking me more questions be more helpful', highlight: true },
    { role: 'ai',    text: 'Fair. Let me just build it out...' },
    { role: 'human', text: 'this is not an AI app at all. so it\'s just about sharing', highlight: true },
    { role: 'ai',    text: 'The AI is the pencil, not the painting...' },
    { role: 'human', text: 'Not young adults specific', highlight: true },
    { role: 'ai',    text: 'Good catch. This works for anyone...' },
  ],
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)
  if (!post) notFound()

  const transcript = SEED_TRANSCRIPT[id] ?? []

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar
        backHref="/"
        title="slop."
        logoSize="small"
        rightAction={<div className="w-12" />}
      />

      <div className="flex-1 pb-[70px] overflow-y-auto">
        <div className="px-5 py-[22px]">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-[18px]">
            <AvatarInitials initials={post.avatar_initials} size="lg" />
            <div>
              <div className="font-vt323 text-[16px] text-slop-secondary">@{post.handle}</div>
              <div className="font-vt323 text-[13px] text-slop-muted">
                {formatRelativeTime(post.created_at)}{post.school ? ` · ${post.school}` : ''}
              </div>
            </div>
          </div>

          {/* Headline */}
          <p className="font-courier text-[18px] leading-[1.65] text-slop-primary pb-[18px] border-b border-slop-border mb-4">
            <span className="text-slop-secondary">{post.name} had a conversation with Claude about </span>
            {post.x_description}
          </p>

          {/* Social */}
          <div className="flex gap-[18px] pb-[18px] border-b border-slop-border mb-[18px]">
            <span className="font-vt323 text-[15px] text-slop-secondary">♡ {post.like_count}</span>
            <Link
              href={`/thread/${post.id}`}
              className="font-vt323 text-[15px] text-slop-secondary hover:text-slop-ink transition-colors"
            >
              ↩ {post.reply_count} replies
            </Link>
          </div>

          {/* Transcript */}
          {transcript.length > 0 ? (
            <div className="flex flex-col">
              {transcript.map((turn, i) => (
                <div key={i} className="py-[13px] border-b border-slop-border last:border-b-0 flex flex-col gap-1">
                  <div className={`font-vt323 text-[13px] uppercase tracking-widest ${turn.role === 'human' ? 'text-slop-secondary' : 'text-slop-dim'}`}>
                    {turn.role === 'human' ? post.handle.toUpperCase() : 'Claude'}
                  </div>
                  <div
                    className={`font-courier text-[13px] leading-[1.7] ${
                      turn.role === 'ai'
                        ? 'text-slop-dim text-[12px]'
                        : turn.highlight
                        ? 'text-slop-primary border-l-2 border-slop-secondary pl-3 -ml-[14px]'
                        : 'text-slop-ink'
                    }`}
                  >
                    {turn.text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="font-courier text-[14px] text-slop-secondary italic">
              transcript not available
            </div>
          )}
        </div>
      </div>

      <TabBar />
    </div>
  )
}
