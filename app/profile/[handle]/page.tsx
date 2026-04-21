import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FeedPost, User } from '@/lib/types'
import NavBar from '@/components/NavBar'
import TabBar from '@/components/TabBar'
import AvatarInitials from '@/components/AvatarInitials'
import SlopCard from '@/components/SlopCard'

const SEED_USER: User = {
  id: 'seed-user-1',
  handle: 'aj',
  name: 'Aditya',
  school: 'NYU \'26',
  avatar_initials: 'AJ',
  created_at: new Date().toISOString(),
}

const SEED_USER_POSTS: FeedPost[] = [
  {
    id: 'seed-1',
    user_id: 'seed-user-1',
    content_type: 'chat',
    x_description: "trying to build an app and realizing mid-conversation he didn't know what he was actually building",
    moments: [
      "Nah the solo value is ChatGPT or Claude right",
      "this is not an AI app at all",
    ],
    artifact_url: null,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    handle: 'aj',
    name: 'Aditya',
    avatar_initials: 'AJ',
    school: 'NYU',
    like_count: 24,
    reply_count: 3,
  },
]

async function getProfileData(handle: string): Promise<{ user: User; posts: FeedPost[]; likeTotal: number } | null> {
  if (handle === 'aj') {
    return { user: SEED_USER, posts: SEED_USER_POSTS, likeTotal: 203 }
  }

  try {
    const supabase = await createClient()
    const { data: user } = await supabase.from('users').select('*').eq('handle', handle).single()
    if (!user) return null

    const { data: posts } = await supabase
      .from('feed_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const likeTotal = (posts ?? []).reduce((sum: number, p: FeedPost) => sum + p.like_count, 0)
    const replyTotal = (posts ?? []).reduce((sum: number, p: FeedPost) => sum + p.reply_count, 0)

    return { user: user as User, posts: (posts ?? []) as FeedPost[], likeTotal }
  } catch {
    return null
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const data = await getProfileData(handle)
  if (!data) notFound()

  const { user, posts, likeTotal } = data
  const replyTotal = posts.reduce((s, p) => s + p.reply_count, 0)

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar
        rightAction={
          <button className="font-vt323 text-[18px] text-slop-secondary uppercase hover:text-slop-ink transition-colors">
            edit
          </button>
        }
      />

      <div className="flex-1 pb-[70px] overflow-y-auto">
        {/* Profile header */}
        <div className="px-5 pt-[26px] pb-5 border-b border-slop-border flex flex-col gap-4">
          <div className="flex items-center gap-3.5">
            <AvatarInitials initials={user.avatar_initials} size="lg" />
            <div>
              <div className="font-courier text-[20px] font-bold text-slop-primary">{user.name}</div>
              <div className="font-vt323 text-[15px] text-slop-secondary mt-0.5">
                @{user.handle}{user.school ? ` · ${user.school}` : ''}
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {[
              { n: posts.length, l: 'slops' },
              { n: likeTotal,    l: 'likes' },
              { n: replyTotal,   l: 'replies' },
            ].map(({ n, l }) => (
              <div key={l} className="flex flex-col gap-0.5">
                <span className="font-courier text-[18px] font-bold text-slop-primary">{n}</span>
                <span className="font-vt323 text-[13px] text-slop-dim uppercase tracking-widest">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="flex flex-col">
          {posts.map((post, i) => (
            <SlopCard key={post.id} post={post} index={i} showReplies={false} />
          ))}

          {posts.length === 0 && (
            <div className="py-16 text-center">
              <div className="font-vt323 text-[16px] text-slop-dim uppercase tracking-wide">no slops yet</div>
            </div>
          )}
        </div>
      </div>

      <TabBar userHandle={handle} />
    </div>
  )
}
