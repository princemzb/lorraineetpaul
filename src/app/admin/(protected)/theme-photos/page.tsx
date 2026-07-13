'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import RichTextEditor from '@/components/admin/RichTextEditor'

type Photo = { id: string; description: string | null; order: number }

const MAX_SIZE = 4 * 1024 * 1024 // 4 Mo — limite des Serverless Functions Vercel

function PhotoCard({
  photo,
  isFirst,
  isLast,
  onMove,
  onDelete,
  onSaveDescription,
}: {
  photo: Photo
  isFirst: boolean
  isLast: boolean
  onMove: (direction: -1 | 1) => void
  onDelete: () => void
  onSaveDescription: (description: string) => Promise<void>
}) {
  const [description, setDescription] = useState(photo.description || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const dirty = description !== (photo.description || '')

  const handleSave = async () => {
    setSaving(true)
    await onSaveDescription(description)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="rounded-2xl overflow-hidden border shadow-sm bg-white flex" style={{ borderColor: '#f0e6d3' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/theme-photos/${photo.id}/image`} alt="" className="w-40 h-40 object-cover flex-shrink-0" />
      <div className="p-4 flex-1 flex flex-col">
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Texte décrivant le thème pour cette photo (tenue attendue, couleurs, ambiance...)"
          rows={3}
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onMove(-1)}
            disabled={isFirst}
            className="px-2 py-1 rounded text-xs border disabled:opacity-30"
            style={{ borderColor: '#e8d5b7', color: '#8b7355' }}
          >
            ↑
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={isLast}
            className="px-2 py-1 rounded text-xs border disabled:opacity-30"
            style={{ borderColor: '#e8d5b7', color: '#8b7355' }}
          >
            ↓
          </button>
          {dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 rounded text-xs text-white"
              style={{ background: saved ? '#16a34a' : '#8b7355' }}
            >
              {saving ? '...' : saved ? '✓ Enregistré' : 'Enregistrer le texte'}
            </button>
          )}
          <button
            onClick={onDelete}
            className="ml-auto px-2 py-1 rounded text-xs border"
            style={{ borderColor: '#fecaca', color: '#dc2626' }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ThemePhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [newDescription, setNewDescription] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/theme-photos')
    const data = await res.json()
    setPhotos(Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError('Choisissez une photo à envoyer.')
      return
    }
    setError('')
    if (file.size > MAX_SIZE) {
      setError(`Image trop volumineuse (${(file.size / 1024 / 1024).toFixed(1)} Mo) — 4 Mo maximum par photo.`)
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append('photo', file)
    formData.append('description', newDescription)
    const res = await fetch('/api/admin/theme-photos', { method: 'POST', body: formData })
    if (res.ok) {
      setNewDescription('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await load()
    } else {
      const d = await res.json()
      setError(d.error || 'Erreur lors de l\'envoi')
    }
    setUploading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette photo ?')) return
    await fetch(`/api/admin/theme-photos/${id}`, { method: 'DELETE' })
    await load()
  }

  const saveDescription = async (id: string, description: string) => {
    await fetch(`/api/admin/theme-photos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    })
    await load()
  }

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= photos.length) return
    const a = photos[index]
    const b = photos[target]
    await Promise.all([
      fetch(`/api/admin/theme-photos/${a.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/theme-photos/${b.id}`, {
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
          🎨 Thème &amp; consignes
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Photos illustrant le thème du mariage (dress code, ambiance), présentées avec leur texte aux invités sur la page dédiée.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6" style={{ borderColor: '#f0e6d3' }}>
        <h3 className="font-medium mb-4" style={{ color: '#8b7355' }}>Ajouter une photo</h3>
        <div className="flex gap-4 items-start">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="text-sm text-gray-500 flex-shrink-0 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:text-white file:cursor-pointer file:bg-[#8b7355] hover:file:bg-[#6b5a45] cursor-pointer"
          />
          <div className="flex-1">
            <RichTextEditor
              value={newDescription}
              onChange={setNewDescription}
              placeholder="Texte décrivant le thème pour cette photo (optionnel, modifiable ensuite)"
              rows={2}
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 rounded-lg text-white text-sm flex-shrink-0"
            style={{ background: '#8b7355' }}
          >
            {uploading ? 'Envoi...' : '+ Ajouter'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">4 Mo max par photo — JPEG, PNG ou WebP.</p>
      </div>

      <div className="space-y-4">
        {photos.length === 0 && (
          <p className="text-gray-400 text-sm">Aucune photo pour le moment.</p>
        )}
        {photos.map((photo, i) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isFirst={i === 0}
            isLast={i === photos.length - 1}
            onMove={(direction) => move(i, direction)}
            onDelete={() => handleDelete(photo.id)}
            onSaveDescription={(description) => saveDescription(photo.id, description)}
          />
        ))}
      </div>
    </div>
  )
}
