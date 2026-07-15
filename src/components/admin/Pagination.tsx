'use client'

export default function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number
  pageCount: number
  onChange: (page: number) => void
}) {
  if (pageCount <= 1) return null

  const pages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(pageCount, start + 4)
  for (let p = Math.max(1, end - 4); p <= end; p++) pages.push(p)

  const btnStyle = (active: boolean) => ({
    borderColor: active ? '#8b7355' : '#e8d5b7',
    background: active ? '#8b7355' : 'white',
    color: active ? 'white' : '#8b7355',
  })

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-sm border transition-all disabled:opacity-30"
        style={btnStyle(false)}
      >
        ←
      </button>
      {pages[0] > 1 && <span className="px-1 text-gray-400 text-sm">…</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className="w-8 h-8 rounded-lg text-sm border transition-all"
          style={btnStyle(p === page)}
        >
          {p}
        </button>
      ))}
      {pages[pages.length - 1] < pageCount && <span className="px-1 text-gray-400 text-sm">…</span>}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        className="px-3 py-1.5 rounded-lg text-sm border transition-all disabled:opacity-30"
        style={btnStyle(false)}
      >
        →
      </button>
    </div>
  )
}
