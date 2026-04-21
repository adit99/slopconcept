interface AvatarInitialsProps {
  initials: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'w-[18px] h-[18px] text-[10px]',
  md: 'w-[24px] h-[24px] text-[13px]',
  lg: 'w-[44px] h-[44px] text-[18px]',
}

export default function AvatarInitials({ initials, size = 'md' }: AvatarInitialsProps) {
  return (
    <div
      className={`${sizes[size]} rounded-full bg-slop-surface2 border border-slop-border2 flex items-center justify-center font-vt323 text-slop-secondary flex-shrink-0`}
    >
      {initials}
    </div>
  )
}
