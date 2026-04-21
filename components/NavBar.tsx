'use client'

import Link from 'next/link'

interface NavBarProps {
  title?: string
  backHref?: string
  backLabel?: string
  rightAction?: React.ReactNode
  logoSize?: 'full' | 'small'
}

export default function NavBar({
  title,
  backHref,
  backLabel = '← back',
  rightAction,
  logoSize = 'full',
}: NavBarProps) {
  return (
    <nav className="sticky top-0 z-100 bg-slop-bg border-b border-slop-border h-[50px] px-5 flex items-center justify-between">
      {backHref ? (
        <Link
          href={backHref}
          className="font-vt323 text-[18px] text-slop-secondary uppercase tracking-wide"
        >
          {backLabel}
        </Link>
      ) : (
        <div className="font-vt323 text-[22px] text-slop-primary">slop.</div>
      )}

      {title && (
        <div
          className={`font-vt323 text-slop-primary ${logoSize === 'small' ? 'text-[15px] opacity-35' : 'text-[22px]'}`}
        >
          {title}
        </div>
      )}

      {rightAction ? (
        <div>{rightAction}</div>
      ) : (
        <div className="w-12" />
      )}
    </nav>
  )
}
