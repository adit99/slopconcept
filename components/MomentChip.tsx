interface MomentChipProps {
  text: string
  highlight?: boolean
}

export default function MomentChip({ text, highlight }: MomentChipProps) {
  return (
    <div
      className={`py-2.5 border-b border-slop-border last:border-b-0 font-courier text-[13px] leading-[1.7] ${
        highlight
          ? 'text-slop-ink font-normal text-[14px]'
          : 'text-slop-secondary italic'
      }`}
    >
      {text}
    </div>
  )
}
