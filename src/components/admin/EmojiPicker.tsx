'use client'

import { useEffect, useRef, useState } from 'react'
import Picker, { EmojiClickData } from 'emoji-picker-react'

export default function EmojiPicker({ value, onChange }: { value: string; onChange: (emoji: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full border rounded-lg px-3 py-2 text-lg text-center focus:outline-none"
        style={{ borderColor: '#e8d5b7' }}
      >
        {value || '💍'}
      </button>

      {open && (
        <div className="absolute z-20 mt-2">
          <Picker
            onEmojiClick={(data: EmojiClickData) => {
              onChange(data.emoji)
              setOpen(false)
            }}
            width={300}
            height={360}
            searchPlaceholder="Rechercher un emoji..."
          />
        </div>
      )}
    </div>
  )
}
