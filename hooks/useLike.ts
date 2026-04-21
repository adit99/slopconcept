'use client'

import { useState } from 'react'

export function useLike(initialLikedIds: string[] = []) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(initialLikedIds))
  const [pending, setPending] = useState<Set<string>>(new Set())

  async function toggleLike(postId: string, liked: boolean) {
    if (pending.has(postId)) return
    setPending(p => new Set(p).add(postId))
    setLikedIds(prev => {
      const next = new Set(prev)
      liked ? next.add(postId) : next.delete(postId)
      return next
    })

    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, liked }),
      })
    } catch {
      // Revert optimistic update on failure
      setLikedIds(prev => {
        const next = new Set(prev)
        liked ? next.delete(postId) : next.add(postId)
        return next
      })
    } finally {
      setPending(p => { const next = new Set(p); next.delete(postId); return next })
    }
  }

  return { likedIds, toggleLike }
}
