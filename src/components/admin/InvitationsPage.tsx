'use client'

import { useEffect, useState, useCallback } from 'react'

type Guest = { id: string; firstName: string; lastName: string; email?: string; phone?: string }
type MenuItem = { id: string; name: string }
type Invitation = {
  id: string
  token: string
  ceremony: 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE'
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED'
  notes?: string
  emailSent: boolean
  respondedAt?: string
  accompanistCount: number
  guest: Guest
  menuItem?: MenuItem
  menu?: MenuItem
  entreeOption?: MenuItem
  platOption?: MenuItem
  dessertOption?: MenuItem
}

function menuLabel(inv: Invitation): string {
  if (inv.ceremony === 'SOIREE') {
    if (!inv.menu) return '—'
    const courses = [inv.entreeOption?.name, inv.platOption?.name, inv.dessertOption?.name].filter(Boolean).join(' / ')
    return courses ? `${inv.menu.name} — ${courses}` : inv.menu.name
  }
  return inv.menuItem?.name || '—'
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'En attente', color: '#d97706', bg: '#fef9f0' },
  CONFIRMED: { label: 'Confirmé', color: '#16a34a', bg: '#f0fdf4' },
  DECLINED: { label: 'Décliné', color: '#dc2626', bg: '#fef2f2' },
}

export default function InvitationsPage({ ceremony }: { ceremony: 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE' }) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGuestId, setNewGuestId] = useState('')
  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [addMode, setAddMode] = useState<'existing' | 'new'>('new')
  const [submitting, setSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [ceremonyLabel, setCeremonyLabel] = useState<string>(ceremony)
  const [ceremonyEmoji, setCeremonyEmoji] = useState('💒')

  useEffect(() => {
    fetch('/api/admin/ceremonies')
      .then((r) => r.json())
      .then((configs: Array<{ ceremony: string; name: string; emoji: string }>) => {
        const config = configs.find((c) => c.ceremony === ceremony)
        if (config) {
          setCeremonyLabel(config.name)
          setCeremonyEmoji(config.emoji)
        }
      })
  }, [ceremony])

  const load = useCallback(async () => {
    const [invRes, guestRes] = await Promise.all([
      fetch(`/api/admin/invitations?ceremony=${ceremony}`),
      fetch('/api/admin/guests'),
    ])
    const [invData, guestData] = await Promise.all([invRes.json(), guestRes.json()])
    setInvitations(Array.isArray(invData) ? invData : [])
    setGuests(Array.isArray(guestData) ? guestData : [])
    setLoading(false)
  }, [ceremony])

  useEffect(() => { load() }, [load])

  const filteredInvitations = invitations.filter(
    (inv) => filter === 'ALL' || inv.status === filter
  )

  const copyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/invitation/${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const sendEmail = async (id: string) => {
    setSendingId(id)
    const res = await fetch(`/api/admin/invitations/${id}/send`, { method: 'POST' })
    if (res.ok) {
      await load()
    } else {
      const data = await res.json()
      alert(data.error || 'Erreur lors de l\'envoi')
    }
    setSendingId(null)
  }


  const deleteInvitation = async (id: string) => {
    if (!confirm('Supprimer cette invitation ?')) return
    await fetch(`/api/admin/invitations/${id}`, { method: 'DELETE' })
    await load()
  }

  const handleAdd = async () => {
    setSubmitting(true)
    try {
      let guestId = newGuestId
      if (addMode === 'new') {
        if (!newFirstName || !newLastName) {
          alert('Prénom et nom requis')
          setSubmitting(false)
          return
        }
        const gRes = await fetch('/api/admin/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName: newFirstName, lastName: newLastName, email: newEmail || null, phone: newPhone || null }),
        })
        const gData = await gRes.json()
        if (!gRes.ok) { alert(gData.error); setSubmitting(false); return }
        guestId = gData.id
      }
      const iRes = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, ceremony }),
      })
      const iData = await iRes.json()
      if (!iRes.ok) { alert(iData.error); setSubmitting(false); return }
      setShowAddForm(false)
      setNewFirstName(''); setNewLastName(''); setNewEmail(''); setNewPhone(''); setNewGuestId('')
      await load()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium" style={{ color: '#8b7355', fontFamily: 'Georgia, serif' }}>
            {ceremonyEmoji} {ceremonyLabel}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{invitations.length} invitation{invitations.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <a
            href={`/api/admin/export/${ceremony.toLowerCase()}`}
            className="px-4 py-2 rounded-lg border text-sm font-medium transition-all"
            style={{ borderColor: '#8b7355', color: '#8b7355' }}
          >
            📥 Exporter CSV
          </a>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: '#8b7355' }}
          >
            + Ajouter un invité
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {[['ALL', 'Tous'], ['PENDING', 'En attente'], ['CONFIRMED', 'Confirmés'], ['DECLINED', 'Déclinés']].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: filter === val ? '#8b7355' : 'white',
              color: filter === val ? 'white' : '#8b7355',
              border: `1px solid ${filter === val ? '#8b7355' : '#e8d5b7'}`,
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6" style={{ borderColor: '#f0e6d3' }}>
          <h3 className="font-medium mb-4" style={{ color: '#8b7355' }}>Nouvel invité pour {ceremonyLabel}</h3>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setAddMode('new')}
              className="px-4 py-2 rounded-lg text-sm border transition-all"
              style={{ background: addMode === 'new' ? '#8b7355' : 'white', color: addMode === 'new' ? 'white' : '#8b7355', borderColor: '#8b7355' }}
            >
              Nouveau
            </button>
            <button
              onClick={() => setAddMode('existing')}
              className="px-4 py-2 rounded-lg text-sm border transition-all"
              style={{ background: addMode === 'existing' ? '#8b7355' : 'white', color: addMode === 'existing' ? 'white' : '#8b7355', borderColor: '#8b7355' }}
            >
              Invité existant
            </button>
          </div>
          {addMode === 'new' ? (
            <div className="grid grid-cols-2 gap-4">
              <input value={newFirstName} onChange={e => setNewFirstName(e.target.value)} placeholder="Prénom *" className="border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: '#e8d5b7' }} />
              <input value={newLastName} onChange={e => setNewLastName(e.target.value)} placeholder="Nom *" className="border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: '#e8d5b7' }} />
              <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" type="email" className="border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: '#e8d5b7' }} />
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Téléphone" className="border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: '#e8d5b7' }} />
            </div>
          ) : (
            <select value={newGuestId} onChange={e => setNewGuestId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none" style={{ borderColor: '#e8d5b7' }}>
              <option value="">Choisir un invité</option>
              {guests.map(g => (
                <option key={g.id} value={g.id}>{g.lastName} {g.firstName}</option>
              ))}
            </select>
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={submitting} className="px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#8b7355' }}>
              {submitting ? 'Ajout...' : 'Ajouter'}
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: '#e8d5b7', color: '#8b7355' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#f0e6d3' }}>
        {filteredInvitations.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p>Aucune invitation trouvée</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#fdf3e3', borderBottom: '2px solid #f0e6d3' }}>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Invité</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Menu</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Accomp.</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Notes</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Répondu le</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvitations.map((inv, i) => {
                const s = STATUS_LABELS[inv.status]
                return (
                  <tr key={inv.id} style={{ borderBottom: i < filteredInvitations.length - 1 ? '1px solid #f0e6d3' : 'none' }}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">
                        {inv.guest.lastName} {inv.guest.firstName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {inv.guest.email && <div>{inv.guest.email}</div>}
                      {inv.guest.phone && <div>{inv.guest.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ color: s.color, background: s.bg }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{menuLabel(inv)}</td>
                    <td className="px-4 py-3 text-gray-600 text-center">
                      {inv.accompanistCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#fdf3e3', color: '#8b7355' }}>
                          +{inv.accompanistCount}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-32 truncate" title={inv.notes || ''}>{inv.notes || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {inv.respondedAt ? new Date(inv.respondedAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyLink(inv.token, inv.id)}
                          className="px-2 py-1 rounded text-xs border transition-all"
                          style={{ borderColor: '#e8d5b7', color: copiedId === inv.id ? '#16a34a' : '#8b7355' }}
                          title="Copier le lien"
                        >
                          {copiedId === inv.id ? '✓ Copié' : '🔗 Lien'}
                        </button>
                        {inv.guest.email && (
                          <button
                            onClick={() => sendEmail(inv.id)}
                            disabled={sendingId === inv.id}
                            className="px-2 py-1 rounded text-xs border transition-all"
                            style={{ borderColor: '#e8d5b7', color: inv.emailSent ? '#16a34a' : '#8b7355' }}
                            title={inv.emailSent ? 'Email déjà envoyé' : 'Envoyer le lien par email'}
                          >
                            {sendingId === inv.id ? '...' : inv.emailSent ? '✓ Email' : '📧 Email'}
                          </button>
                        )}
                        <button
                          onClick={() => deleteInvitation(inv.id)}
                          className="px-2 py-1 rounded text-xs border transition-all"
                          style={{ borderColor: '#fecaca', color: '#dc2626' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
