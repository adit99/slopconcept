'use client'

import { useEffect, useRef } from 'react'
import { FeedPost } from '@/lib/types'
import { useFeed } from '@/hooks/useFeed'
import { useLike } from '@/hooks/useLike'
import NavBar from '@/components/NavBar'
import TabBar from '@/components/TabBar'
import SlopCard from '@/components/SlopCard'

interface FeedClientProps {
  initialPosts: FeedPost[]
  seedReplies: Record<string, FeedPost[]>
}

export default function FeedClient({ initialPosts, seedReplies }: FeedClientProps) {
  const { posts, loading, hasMore, loadMore } = useFeed(initialPosts)
  const { likedIds, toggleLike } = useLike()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar />

      <div className="flex-1 pb-[70px]">
        <div className="flex flex-col">
          {posts.map((post, i) => (
            <SlopCard
              key={post.id}
              post={post}
              index={i}
              likedPostIds={likedIds}
              onLikeToggle={toggleLike}
              replyPreviews={seedReplies[post.id] ?? []}
            />
          ))}
        </div>

        {hasMore && (
          <div ref={sentinelRef} className="py-8 flex justify-center">
            {loading && (
              <span className="font-vt323 text-[14px] text-slop-dim uppercase tracking-wide">
                loading...
              </span>
            )}
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="py-8 text-center font-vt323 text-[13px] text-slop-dim uppercase tracking-wide">
            you've seen it all
          </div>
        )}
      </div>

      <TabBar />
    </div>
  )
}
