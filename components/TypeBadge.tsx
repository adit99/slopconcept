import { ContentType } from '@/lib/types'

const styles: Record<ContentType, string> = {
  chat:  'text-slop-dim',
  image: 'text-[#4a5a6b]',
  voice: 'text-[#4a6b4a]',
  doc:   'text-[#6b5a4a]',
}

export default function TypeBadge({ type }: { type: ContentType }) {
  return (
    <span
      className={`font-vt323 text-[14px] border-l border-slop-border2 pl-1.5 ml-0.5 uppercase ${styles[type]}`}
    >
      {type}
    </span>
  )
}
