'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

type Photo = { id: string; order: number }

const MAX_PHOTOS = 7
const MAX_SIZE = 4 * 1024 * 1024 // 4 Mo — limite des Serverless Functions Vercel

export default function HeroPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/hero-photos')
    const data = await res.json()
    setPhotos(Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpload = async (file: File) => {
    setError('')
    if (file.size > MAX_SIZE) {
      setError(`Image trop volumineuse (${(file.size / 1024 / 1024).toFixed(1)} Mo) — 4 Mo maximum par photo.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append('photo', file)
    const res = await fetch('/api/admin/hero-photos', { method: 'POST', body: formData })
    if (res.ok) {
      await load()
    } else {
      const d = await res.json()
      setError(d.error || 'Erreur lors de l\'envoi')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette photo ?')) return
    await fetch(`/api/admin/hero-photos/${id}`, { method: 'DELETE' })
    await load()
  }

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= photos.length) return
    const a = photos[index]
    const b = photos[target]
    await Promise.all([
      fetch(`/api/admin/hero-photos/${a.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/hero-photos/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: a.order }),
      }),
    ])
    await load()
  }

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-medium" style={{ color: '#8b7355', fontFamily: 'Georgia, serif' }}>
          📷 Photos d&apos;accueil
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Ces photos défilent en fondu (3 secondes chacune) en arrière-plan de la page d&apos;accueil. {photos.length}/{MAX_PHOTOS} photo{photos.length > 1 ? 's' : ''}.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {photos.map((photo, i) => (
          <div key={photo.id} className="rounded-2xl overflow-hidden border shadow-sm bg-white" style={{ borderColor: '#f0e6d3' }}>
            <div className="aspect-square relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/hero-photos/${photo.id}/image`} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="p-2 flex items-center justify-between gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="px-2 py-1 rounded text-xs border disabled:opacity-30"
                style={{ borderColor: '#e8d5b7', color: '#8b7355' }}
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === photos.length - 1}
                className="px-2 py-1 rounded text-xs border disabled:opacity-30"
                style={{ borderColor: '#e8d5b7', color: '#8b7355' }}
              >
                ↓
              </button>
              <button
                onClick={() => handleDelete(photo.id)}
                className="ml-auto px-2 py-1 rounded text-xs border"
                style={{ borderColor: '#fecaca', color: '#dc2626' }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <label
            className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer text-sm text-gray-400 hover:border-gray-400 transition-colors"
            style={{ borderColor: '#e8d5b7' }}
          >
            {uploading ? 'Envoi...' : (
              <>
                <span>+ Ajouter</span>
                <span className="text-xs text-gray-300 mt-1">4 Mo max</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
            />
          </label>
        )}
      </div>
    </div>
  )
}
