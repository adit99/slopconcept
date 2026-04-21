'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface TabBarProps {
  userHandle?: string | null
  onNewSlop?: () => void
}

export default function TabBar({ userHandle, onNewSlop }: TabBarProps) {
  const pathname = usePathname()

  const isFeed = pathname === '/'
  const isProfile = pathname.startsWith('/profile')

  return (
    <div className="fixed bottom-0 left-0 right-0 z-200 bg-slop-bg border-t border-slop-border h-[54px] flex items-center justify-around max-w-[430px] mx-auto">
      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 px-6 py-1.5 transition-opacity ${isFeed ? 'opacity-100' : 'opacity-25'}`}
      >
        <span className="font-vt323 text-[20px] text-slop-primary">◈</span>
        <span className="font-vt323 text-[13px] text-slop-primary uppercase tracking-wide">feed</span>
      </Link>

      <Link
        href="/share"
        onClick={onNewSlop}
        className="flex flex-col items-center gap-0.5 px-6 py-1.5 opacity-60 hover:opacity-100 transition-opacity"
      >
        <span className="font-vt323 text-[20px] text-slop-primary">+</span>
        <span className="font-vt323 text-[13px] text-slop-primary uppercase tracking-wide">slop</span>
      </Link>

      <Link
        href={userHandle ? `/profile/${userHandle}` : '/auth/login'}
        className={`flex flex-col items-center gap-0.5 px-6 py-1.5 transition-opacity ${isProfile ? 'opacity-100' : 'opacity-25'}`}
      >
        <span className="font-vt323 text-[20px] text-slop-primary">◉</span>
        <span className="font-vt323 text-[13px] text-slop-primary uppercase tracking-wide">me</span>
      </Link>
    </div>
  )
}
