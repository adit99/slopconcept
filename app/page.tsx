import { createClient } from '@/lib/supabase/server'
import { SEED_POSTS, SEED_REPLIES } from '@/lib/seed-data'
import { FeedPost } from '@/lib/types'
import FeedClient from './FeedClient'

async function getFeedPosts(): Promise<{ posts: FeedPost[]; usingSeed: boolean }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('feed_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error || !data || data.length === 0) {
      return { posts: SEED_POSTS, usingSeed: true }
    }
    return { posts: data as FeedPost[], usingSeed: false }
  } catch {
    return { posts: SEED_POSTS, usingSeed: true }
  }
}

export default async function FeedPage() {
  const { posts, usingSeed } = await getFeedPosts()
  const seedReplies = usingSeed ? SEED_REPLIES : {}

  return <FeedClient initialPosts={posts} seedReplies={seedReplies} />
}
