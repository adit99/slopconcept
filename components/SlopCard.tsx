'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FeedPost } from '@/lib/types'
import AvatarInitials from './AvatarInitials'
import TypeBadge from './TypeBadge'
import MomentChip from './MomentChip'
import { formatRelativeTime } from '@/lib/utils'

interface SlopCardProps {
  post: FeedPost
  index?: number
  likedPostIds?: Set<string>
  onLikeToggle?: (postId: string, liked: boolean) => void
  showReplies?: boolean
  replyPreviews?: FeedPost[]
}

export default function SlopCard({
  post,
  index = 0,
  likedPostIds = new Set(),
  onLikeToggle,
  showReplies = true,
  replyPreviews = [],
}: SlopCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isLiked = likedPostIds.has(post.id)
  const [localLikeCount, setLocalLikeCount] = useState(post.like_count)
  const [localLiked, setLocalLiked] = useState(isLiked)

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation()
    const next = !localLiked
    setLocalLiked(next)
    setLocalLikeCount(c => next ? c + 1 : c - 1)
    onLikeToggle?.(post.id, next)
  }

  const cardBg = index % 2 === 0 ? 'bg-[#0f0f0e]' : 'bg-[#141412]'

  return (
    <div
      className={`border-b border-slop-border cursor-pointer transition-colors ${expanded ? 'bg-slop-surface cursor-default' : `${cardBg} hover:bg-slop-surface2`}`}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Card top */}
      <div className="px-5 pt-4 pb-2.5 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <AvatarInitials initials={post.avatar_initials} size="md" />
          <span className="font-vt323 text-[15px] text-slop-secondary">@{post.handle}</span>
          <span className="font-vt323 text-[14px] text-slop-dim ml-auto">
            {formatRelativeTime(post.created_at)}
          </span>
          <TypeBadge type={post.content_type} />
        </div>
        <p className="font-courier text-[16px] leading-[1.65] text-slop-ink">
          <span className="text-slop-secondary">{post.name} had a conversation with Claude about </span>
          {post.x_description}
        </p>
      </div>

      {/* Social row */}
      <div className="px-5 py-2 pb-3 flex items-center gap-[18px]">
        <button
          className={`flex items-center gap-1 font-vt323 text-[15px] uppercase tracking-wide transition-colors ${localLiked ? 'text-slop-ink' : 'text-slop-secondary hover:text-slop-ink'}`}
          onClick={handleLike}
        >
          {localLiked ? '♥' : '♡'} <span>{localLikeCount}</span>
        </button>
        <Link
          href={`/thread/${post.id}`}
          className="flex items-center gap-1 font-vt323 text-[15px] text-slop-secondary uppercase tracking-wide hover:text-slop-ink transition-colors"
          onClick={e => e.stopPropagation()}
        >
          ↩ <span>{post.reply_count}</span>
        </Link>
        <span
          className={`font-vt323 text-[15px] text-slop-dim ml-auto transition-transform duration-300 inline-block ${expanded ? 'rotate-180' : ''}`}
        >
          ∨
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div onClick={e => e.stopPropagation()}>
          <ExpandedContent post={post} replyPreviews={replyPreviews} showReplies={showReplies} />
        </div>
      )}
    </div>
  )
}

function ExpandedContent({
  post,
  replyPreviews,
  showReplies,
}: {
  post: FeedPost
  replyPreviews: FeedPost[]
  showReplies: boolean
}) {
  return (
    <>
      {/* Content-type-specific preview */}
      {post.content_type === 'image' && <ImagePreview />}
      {post.content_type === 'voice' && <VoicePreview />}
      {post.content_type === 'doc' && <DocPreview />}

      {/* Moments */}
      {post.moments.length > 0 && (
        <div className="border-t border-slop-border px-5 pt-0.5 pb-0">
          {post.moments.map((m, i) => (
            <MomentChip key={i} text={m} highlight={i === 0 || i === 2} />
          ))}
        </div>
      )}

      {/* Go deep */}
      <Link
        href={`/post/${post.id}`}
        className="block w-full text-left px-5 py-[11px] font-vt323 text-[15px] text-slop-secondary uppercase tracking-wide border-t border-slop-border hover:text-slop-primary transition-colors"
      >
        {post.content_type === 'chat'  && 'read full conversation →'}
        {post.content_type === 'image' && 'view full image →'}
        {post.content_type === 'voice' && 'listen to full conversation →'}
        {post.content_type === 'doc'   && 'read the document →'}
      </Link>

      {/* Reply previews */}
      {showReplies && replyPreviews.length > 0 && (
        <div className="border-t border-slop-border">
          {replyPreviews.map(reply => (
            <ReplyPreviewCard key={reply.id} reply={reply} />
          ))}
        </div>
      )}
    </>
  )
}

function ReplyPreviewCard({ reply }: { reply: FeedPost }) {
  return (
    <div className="px-5 py-3 pl-9 border-b border-slop-border last:border-b-0 relative">
      <div className="absolute left-[22px] top-0 bottom-0 w-px bg-slop-border2" />
      <div className="flex items-center gap-[7px] mb-1.5">
        <AvatarInitials initials={reply.avatar_initials} size="sm" />
        <span className="font-vt323 text-[13px] text-slop-secondary">@{reply.handle}</span>
        <span className="font-vt323 text-[12px] text-slop-dim ml-auto">
          {formatRelativeTime(reply.created_at)}
        </span>
      </div>
      <p className="font-courier text-[13px] leading-[1.6] text-slop-secondary">
        <span className="text-slop-dim">{reply.name} had a conversation with Claude about </span>
        {reply.x_description}
      </p>
      <div className="font-vt323 text-[12px] text-slop-dim mt-1">♡ {reply.like_count}</div>
    </div>
  )
}

function ImagePreview() {
  return (
    <>
      <div className="w-full h-[180px] bg-gradient-to-br from-[#141412] via-[#1a1916] to-[#141210] flex flex-col items-center justify-center gap-2">
        <div className="grid grid-cols-2 gap-0.5 w-[140px] h-[100px] opacity-40">
          <div className="rounded-sm bg-gradient-to-br from-[#2a2820] to-[#1e1c18]" />
          <div className="rounded-sm bg-gradient-to-br from-[#1c1a16] to-[#252220]" />
          <div className="rounded-sm bg-gradient-to-br from-[#201e1a] to-[#2a2620]" />
          <div className="rounded-sm bg-gradient-to-br from-[#181614] to-[#221e1a]" />
        </div>
        <span className="font-vt323 text-[11px] text-slop-dim uppercase tracking-widest">generated · claude</span>
      </div>
    </>
  )
}

function VoicePreview() {
  const bars = Array.from({ length: 32 }, (_, i) => {
    const h = 8 + Math.sin(i * 0.7) * 8 + Math.random() * 8
    return Math.max(4, Math.round(h))
  })

  return (
    <div className="px-5 py-3.5 border-t border-slop-border flex flex-col gap-2.5">
      <div className="flex items-center gap-0.5 h-8">
        {bars.map((h, i) => (
          <div
            key={i}
            className="bg-slop-border2 rounded-sm w-[3px]"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-slop-ink flex items-center justify-center text-[11px] text-slop-bg flex-shrink-0">
          ▶
        </div>
        <span className="font-vt323 text-[13px] text-slop-secondary">1:24</span>
        <div className="flex-1 h-0.5 bg-slop-border2 rounded-sm">
          <div className="w-[35%] h-full bg-slop-ink rounded-sm" />
        </div>
        <span className="font-vt323 text-[13px] text-slop-dim">4:07</span>
      </div>
    </div>
  )
}

function DocPreview() {
  return (
    <div className="border-t border-slop-border">
      <div
        className="px-5 py-3.5 bg-slop-surface flex flex-col gap-1.5"
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
      >
        <div className="font-courier text-[13px] font-bold text-slop-ink">Subject: Office Hours — Question About My Final Paper</div>
        <div className="font-courier text-[12px] text-slop-secondary leading-[1.65]">
          Hi Professor Chen,<br />
          I hope you're doing well. I'm writing about my final paper on behavioral economics. I've been struggling with the framing of my central argument and wanted to ask if I could come to office hours this week…
        </div>
      </div>
      <div className="font-vt323 text-[12px] text-slop-dim px-5 py-1.5 flex gap-3 border-t border-slop-border">
        <span>email · 147 words</span>
        <span>drafted with claude</span>
      </div>
    </div>
  )
}
