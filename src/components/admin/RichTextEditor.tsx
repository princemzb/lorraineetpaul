'use client'

import { useRef } from 'react'

const SWATCHES = ['#dc2626', '#d97706', '#16a34a', '#2563eb', '#8b7355', '#000000']

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const wrap = (before: string, after: string) => {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end) || 'texte'
    const next = value.slice(0, start) + before + selected + after + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = start + before.length
      el.selectionEnd = start + before.length + selected.length
    })
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <button
          type="button"
          onClick={() => wrap('**', '**')}
          title="Gras"
          className="w-7 h-7 rounded border font-bold text-sm flex items-center justify-center"
          style={{ borderColor: '#e8d5b7', color: '#8b7355' }}
        >
          B
        </button>
        {SWATCHES.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => wrap(`[color=${hex}]`, '[/color]')}
            title={`Colorer en ${hex}`}
            className="w-5 h-5 rounded-full border"
            style={{ background: hex, borderColor: '#e8d5b7' }}
          />
        ))}
        <input
          type="color"
          onChange={(e) => wrap(`[color=${e.target.value}]`, '[/color]')}
          title="Autre couleur"
          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
        />
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none font-mono"
        style={{ borderColor: '#e8d5b7' }}
      />
      <p className="text-xs text-gray-400 mt-1">
        Sélectionnez du texte puis cliquez sur B ou une couleur. Les retours à la ligne sont conservés.
      </p>
    </div>
  )
}
