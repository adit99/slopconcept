import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SEED_POSTS, SEED_REPLIES } from '@/lib/seed-data'
import { FeedPost } from '@/lib/types'
import NavBar from '@/components/NavBar'
import AvatarInitials from '@/components/AvatarInitials'
import TabBar from '@/components/TabBar'
import { formatRelativeTime } from '@/lib/utils'

async function getThreadData(id: string): Promise<{ op: FeedPost; replies: FeedPost[] } | null> {
  const seed = SEED_POSTS.find(p => p.id === id)
  if (seed) {
    return { op: seed, replies: SEED_REPLIES[id] ?? [] }
  }

  try {
    const supabase = await createClient()
    const { data: op } = await supabase.from('feed_posts').select('*').eq('id', id).single()
    if (!op) return null

    const { data: replyRows } = await supabase
      .from('replies')
      .select('reply_post_id')
      .eq('parent_post_id', id)

    const replyIds = (replyRows ?? []).map((r: { reply_post_id: string }) => r.reply_post_id)
    let replies: FeedPost[] = []
    if (replyIds.length > 0) {
      const { data: replyPosts } = await supabase
        .from('feed_posts')
        .select('*')
        .in('id', replyIds)
        .order('created_at', { ascending: true })
      replies = (replyPosts ?? []) as FeedPost[]
    }

    return { op: op as FeedPost, replies }
  } catch {
    return null
  }
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getThreadData(id)
  if (!data) notFound()

  const { op, replies } = data

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar
        backHref="/"
        title="thread"
        logoSize="small"
        rightAction={
          <Link
            href={`/reply/${op.id}`}
            className="font-vt323 text-[18px] text-slop-secondary uppercase hover:text-slop-ink transition-colors"
          >
            reply →
          </Link>
        }
      />

      <div className="flex-1 pb-[70px] overflow-y-auto">
        {/* OP */}
        <div className="px-5 pt-4 pb-[14px] border-b-2 border-slop-border2">
          <div className="flex items-center gap-2 mb-2.5">
            <AvatarInitials initials={op.avatar_initials} size="md" />
            <span className="font-vt323 text-[15px] text-slop-secondary">@{op.handle}</span>
            <span className="font-vt323 text-[14px] text-slop-dim ml-auto">
              {formatRelativeTime(op.created_at)}
            </span>
          </div>
          <p className="font-courier text-[16px] leading-[1.65] text-slop-ink mb-3">
            <span className="text-slop-secondary">{op.name} had a conversation with Claude about </span>
            {op.x_description}
          </p>
          <div className="flex gap-4">
            <span className="font-vt323 text-[15px] text-slop-secondary">♡ {op.like_count}</span>
            <Link
              href={`/reply/${op.id}`}
              className="font-vt323 text-[15px] text-slop-secondary hover:text-slop-ink transition-colors uppercase"
            >
              ↩ reply with your slop
            </Link>
          </div>
        </div>

        {/* Replies */}
        <div className="flex flex-col">
          {replies.map(reply => (
            <div
              key={reply.id}
              className="px-5 py-[14px] pl-9 border-b border-slop-border relative hover:bg-slop-surface transition-colors"
            >
              <div className="absolute left-[22px] top-0 bottom-0 w-px bg-slop-border2" />
              <div className="flex items-center gap-[7px] mb-[7px]">
                <AvatarInitials initials={reply.avatar_initials} size="sm" />
                <span className="font-vt323 text-[13px] text-slop-secondary">@{reply.handle}</span>
                <span className="font-vt323 text-[12px] text-slop-dim ml-auto">
                  {formatRelativeTime(reply.created_at)}
                </span>
              </div>
              <p className="font-courier text-[14px] leading-[1.6] text-slop-secondary">
                <span className="text-slop-dim">{reply.name} had a conversation with Claude about </span>
                {reply.x_description}
              </p>
              <div className="flex gap-3.5 mt-2">
                <span className="font-vt323 text-[12px] text-slop-dim">♡ {reply.like_count}</span>
              </div>
            </div>
          ))}

          {replies.length === 0 && (
            <div className="px-5 py-12 text-center">
              <div className="font-vt323 text-[16px] text-slop-dim uppercase tracking-wide mb-2">
                no replies yet
              </div>
              <Link
                href={`/reply/${op.id}`}
                className="font-vt323 text-[15px] text-slop-secondary hover:text-slop-ink transition-colors uppercase tracking-wide"
              >
                be the first →
              </Link>
            </div>
          )}
        </div>
      </div>

      <TabBar />
    </div>
  )
}
