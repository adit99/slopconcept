'use client'

import { useState } from 'react'
import { ToneOption } from '@/lib/types'

interface XPickerProps {
  options: ToneOption[]
  userName?: string
  onSubmit: (selected: ToneOption) => void
  isSubmitting: boolean
  submitLabel?: string
}

export default function XPicker({ options, userName = 'You', onSubmit, isSubmitting, submitLabel = 'post slop' }: XPickerProps) {
  const [selected, setSelected] = useState<ToneOption>(options[0])
  const [editValue, setEditValue] = useState(options[0]?.text ?? '')

  function pickOption(opt: ToneOption) {
    setSelected(opt)
    setEditValue(opt.text)
  }

  return (
    <div className="flex flex-col gap-[18px] flex-1">
      <div className="font-courier italic text-[16px] text-slop-secondary leading-[1.55]">
        pick how it reads
      </div>

      {/* Edit box */}
      <div className="border border-slop-border2 rounded-lg px-4 py-3.5 bg-slop-surface flex flex-col gap-1.5">
        <div className="font-vt323 text-[13px] text-slop-dim uppercase tracking-widest">edit</div>
        <textarea
          value={editValue}
          onChange={e => {
            setEditValue(e.target.value)
            setSelected({ ...selected, text: e.target.value })
          }}
          rows={3}
          className="bg-transparent border-none outline-none font-courier text-[14px] text-slop-ink leading-[1.65] resize-none w-full"
        />
      </div>

      {/* Preview */}
      <div className="px-4 py-3.5 bg-slop-surface border border-slop-border rounded-lg">
        <div className="font-vt323 text-[12px] text-slop-dim uppercase tracking-widest mb-1.5">your slop</div>
        <p className="font-courier text-[15px] leading-[1.65] text-slop-primary">
          <span className="text-slop-secondary">{userName} had a conversation with Claude about </span>
          {editValue}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-0.5">
        {options.map(opt => {
          const isSel = selected.tone === opt.tone
          return (
            <button
              key={opt.tone}
              onClick={() => pickOption(opt)}
              className={`w-full text-left px-3.5 py-3 rounded-lg border transition-all flex gap-2.5 items-start ${
                isSel
                  ? 'bg-slop-surface border-slop-border2'
                  : 'border-transparent hover:bg-slop-surface'
              }`}
            >
              <div
                className={`w-[5px] h-[5px] rounded-full flex-shrink-0 mt-2 transition-colors ${
                  isSel ? 'bg-slop-primary' : 'bg-slop-dim'
                }`}
              />
              <div className="flex flex-col gap-0.5">
                <div className={`font-vt323 text-[12px] uppercase tracking-widest ${isSel ? 'text-slop-secondary' : 'text-slop-dim'}`}>
                  {opt.tone}
                </div>
                <div className={`font-courier text-[13px] leading-[1.6] transition-colors ${
                  isSel ? 'text-slop-ink font-normal' : 'text-slop-secondary italic'
                }`}>
                  {opt.text}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onSubmit({ ...selected, text: editValue })}
        disabled={isSubmitting || !editValue}
        className="w-full py-[13px] bg-slop-ink text-slop-bg font-vt323 text-[18px] uppercase tracking-widest rounded-lg transition-colors hover:bg-slop-primary disabled:opacity-50 mt-auto"
      >
        {isSubmitting ? 'posting...' : submitLabel}
      </button>
    </div>
  )
}
