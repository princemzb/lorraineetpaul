'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Pagination from '@/components/admin/Pagination'

const PAGE_SIZE = 10

type Guest = {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  table?: string
  adminNote?: string
  invitations: Array<{
    id: string
    ceremony: 'CIVIL' | 'SOIREE'
  }>
}

const CEREMONY_LABELS: Record<string, string> = { CIVIL: 'Civil', SOIREE: 'Soirée' }

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editGuest, setEditGuest] = useState<Guest | null>(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', table: '', adminNote: '' })
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/guests')
    const data = await res.json()
    setGuests(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setEditGuest(null)
    setForm({ firstName: '', lastName: '', email: '', phone: '', table: '', adminNote: '' })
    setShowForm(true)
  }

  const openEdit = (g: Guest) => {
    setEditGuest(g)
    setForm({
      firstName: g.firstName,
      lastName: g.lastName,
      email: g.email || '',
      phone: g.phone || '',
      table: g.table || '',
      adminNote: g.adminNote || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName) { alert('Prénom et nom requis'); return }
    setSubmitting(true)
    const url = editGuest ? `/api/admin/guests/${editGuest.id}` : '/api/admin/guests'
    const method = editGuest ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setShowForm(false); await load() }
    else { const d = await res.json(); alert(d.error) }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet invité et toutes ses invitations ?')) return
    await fetch(`/api/admin/guests/${id}`, { method: 'DELETE' })
    await load()
  }

  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return guests
    return guests.filter((g) =>
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) ||
      `${g.lastName} ${g.firstName}`.toLowerCase().includes(q)
    )
  }, [guests, search])

  const pageCount = Math.ceil(filteredGuests.length / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(1, pageCount))
  const pageGuests = filteredGuests.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium" style={{ color: '#8b7355', fontFamily: 'Georgia, serif' }}>
            👥 Gestion des invités
          </h1>
          <p className="text-gray-500 text-sm mt-1">{guests.length} invité{guests.length > 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#8b7355' }}>
          + Ajouter
        </button>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="🔍 Rechercher un invité (nom ou prénom)"
          className="w-full max-w-md border rounded-lg px-4 py-2 text-sm focus:outline-none"
          style={{ borderColor: '#e8d5b7' }}
        />
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6" style={{ borderColor: '#f0e6d3' }}>
          <h3 className="font-medium mb-4" style={{ color: '#8b7355' }}>
            {editGuest ? 'Modifier l\'invité' : 'Nouvel invité'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Prénom *" className="border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: '#e8d5b7' }} />
            <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Nom *" className="border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: '#e8d5b7' }} />
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" type="email" className="border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: '#e8d5b7' }} />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Téléphone" className="border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: '#e8d5b7' }} />
            <input value={form.table} onChange={e => setForm(f => ({ ...f, table: e.target.value }))} placeholder="Table (ex: Table 5, Table des mariés...)" className="border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: '#e8d5b7' }} />
            <input value={form.adminNote} onChange={e => setForm(f => ({ ...f, adminNote: e.target.value }))} placeholder="Note interne (visible au check-in)" className="border rounded-lg px-3 py-2 text-sm focus:outline-none sm:col-span-2" style={{ borderColor: '#e8d5b7' }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            La table et la note interne apparaîtront lors du scan du QR code de l&apos;invité le jour J.
          </p>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#8b7355' }}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: '#e8d5b7', color: '#8b7355' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#f0e6d3' }}>
        {filteredGuests.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">👥</div>
            <p>{search ? 'Aucun invité ne correspond à la recherche' : 'Aucun invité pour l\'instant'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr style={{ background: '#fdf3e3', borderBottom: '2px solid #f0e6d3' }}>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Cérémonies</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Table</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageGuests.map((g, i) => (
                <tr key={g.id} style={{ borderBottom: i < pageGuests.length - 1 ? '1px solid #f0e6d3' : 'none' }}>
                  <td className="px-4 py-3 font-medium text-gray-800">{g.lastName} {g.firstName}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {g.email && <div>{g.email}</div>}
                    {g.phone && <div>{g.phone}</div>}
                    {!g.email && !g.phone && <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {g.invitations.length === 0 ? (
                        <span className="text-gray-300 text-xs">Aucune invitation</span>
                      ) : (
                        g.invitations.map(inv => (
                          <span key={inv.id} className="px-2 py-0.5 rounded-full text-xs border" style={{ borderColor: '#e8d5b7', color: '#8b7355' }}>
                            {CEREMONY_LABELS[inv.ceremony]}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {g.table || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(g)} className="px-2 py-1 rounded text-xs border" style={{ borderColor: '#e8d5b7', color: '#8b7355' }}>
                        ✏️ Modifier
                      </button>
                      <button onClick={() => handleDelete(g.id)} className="px-2 py-1 rounded text-xs border" style={{ borderColor: '#fecaca', color: '#dc2626' }}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
      </div>
    </div>
  )
}
