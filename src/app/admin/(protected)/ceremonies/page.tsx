'use client'

import { useEffect, useState, useCallback } from 'react'
import EmojiPicker from '@/components/admin/EmojiPicker'

type Ceremony = 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE'

type CeremonyConfig = {
  ceremony: Ceremony
  name: string
  emoji: string
  description: string | null
  address: string | null
  date: string | null
  order: number
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function CeremonyForm({ config, onSaved }: { config: CeremonyConfig; onSaved: (c: CeremonyConfig) => void }) {
  const [name, setName] = useState(config.name)
  const [emoji, setEmoji] = useState(config.emoji)
  const [description, setDescription] = useState(config.description || '')
  const [address, setAddress] = useState(config.address || '')
  const [date, setDate] = useState(toLocalInputValue(config.date))
  const [order, setOrder] = useState(config.order)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !emoji.trim()) {
      alert('Nom et emoji requis')
      return
    }
    setSubmitting(true)
    const res = await fetch(`/api/admin/ceremonies/${config.ceremony}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        emoji,
        description: description || null,
        address: address || null,
        date: date ? new Date(date).toISOString() : null,
        order,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      onSaved(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      const d = await res.json()
      alert(d.error)
    }
    setSubmitting(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#f0e6d3' }}>
      <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #f0e6d3', background: '#fdf3e3' }}>
        <span className="text-xl">{emoji || '💍'}</span>
        <h3 className="font-medium" style={{ color: '#8b7355' }}>{name || 'Cérémonie'}</h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-[1fr_5fr] gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#8b7355' }}>Emoji</label>
            <EmojiPicker value={emoji} onChange={setEmoji} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#8b7355' }}>Nom *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: '#e8d5b7' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#8b7355' }}>
            Texte descriptif <span className="font-normal text-gray-400">(optionnel)</span>
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex : Cérémonie suivie d'un vin d'honneur"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: '#e8d5b7' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#8b7355' }}>Adresse</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex : Mairie de..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: '#e8d5b7' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#8b7355' }}>Date et heure</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: '#e8d5b7' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#8b7355' }}>Ordre d&apos;affichage</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-20 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: '#e8d5b7' }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="ml-auto self-end px-4 py-2 rounded-lg text-white text-sm"
            style={{ background: saved ? '#16a34a' : '#8b7355' }}
          >
            {submitting ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CeremoniesPage() {
  const [ceremonies, setCeremonies] = useState<CeremonyConfig[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/ceremonies')
    const data = await res.json()
    setCeremonies(Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSaved = (updated: CeremonyConfig) => {
    setCeremonies((cs) => cs.map((c) => (c.ceremony === updated.ceremony ? updated : c)).sort((a, b) => a.order - b.order))
  }

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-medium" style={{ color: '#8b7355', fontFamily: 'Georgia, serif' }}>
          💒 Cérémonies
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Nom, emoji, texte, adresse et horaire affichés aux invités sur le site et dans les emails.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {ceremonies.map((c) => (
          <CeremonyForm key={c.ceremony} config={c} onSaved={handleSaved} />
        ))}
      </div>
    </div>
  )
}
