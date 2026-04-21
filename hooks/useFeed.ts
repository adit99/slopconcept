'use client'

import { useState, useCallback } from 'react'
import { FeedPost } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const PAGE_SIZE = 20

export function useFeed(initialPosts: FeedPost[]) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length === PAGE_SIZE)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('feed_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(posts.length, posts.length + PAGE_SIZE - 1)

      if (data) {
        setPosts(prev => [...prev, ...data])
        setHasMore(data.length === PAGE_SIZE)
      }
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, posts.length])

  return { posts, loading, hasMore, loadMore }
}
