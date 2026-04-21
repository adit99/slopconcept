export type ContentType = 'chat' | 'image' | 'voice' | 'doc'

export interface User {
  id: string
  handle: string
  name: string
  school: string | null
  avatar_initials: string
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  content_type: ContentType
  x_description: string
  moments: string[]
  artifact_url: string | null
  created_at: string
}

export interface FeedPost extends Post {
  handle: string
  name: string
  avatar_initials: string
  school: string | null
  like_count: number
  reply_count: number
}

export interface ToneOption {
  tone: 'honest' | 'confessional' | 'declarative' | 'open' | 'expansive'
  text: string
}

export interface ExtractionResult {
  moments: string[]
  options: ToneOption[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ReplyPost extends FeedPost {
  reply_post_id: string
  parent_post_id: string
}
