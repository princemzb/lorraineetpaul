'use client'

import { useEffect, useState, useCallback } from 'react'
import GuestQRCode from '@/components/public/GuestQRCode'

type Guest = { id: string; firstName: string; lastName: string; email?: string; phone?: string }
type MenuItem = { id: string; name: string; description?: string }
type CourseType = 'ENTREE' | 'PLAT' | 'DESSERT'
type MenuOption = { id: string; course: CourseType; name: string; description?: string }
type ComposableMenu = { id: string; name: string; options: MenuOption[] }

type Invitation = {
  id: string
  ceremony: 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE'
  status: 'PENDING' | 'CONFIRMED'
  notes?: string
  respondedAt?: string
  guest: Guest
  menuItem?: MenuItem
  menu?: MenuItem
  entreeOption?: MenuItem
  platOption?: MenuItem
  dessertOption?: MenuItem
}

const COURSE_LABELS: Record<CourseType, string> = { ENTREE: 'Entrée', PLAT: 'Plat', DESSERT: 'Dessert' }

function menuLabel(inv: Invitation): string {
  if (inv.ceremony === 'SOIREE') {
    if (!inv.menu) return '—'
    const courses = [inv.entreeOption?.name, inv.platOption?.name, inv.dessertOption?.name].filter(Boolean).join(' / ')
    return courses ? `${inv.menu.name} — ${courses}` : inv.menu.name
  }
  return inv.menuItem?.name || '—'
}

export default function InvitationsPage({ ceremony }: { ceremony: 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE' }) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [composableMenus, setComposableMenus] = useState<ComposableMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGuestId, setNewGuestId] = useState('')
  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [addMode, setAddMode] = useState<'existing' | 'new'>('new')
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('')
  const [selectedMenuId, setSelectedMenuId] = useState('')
  const [selectedEntreeId, setSelectedEntreeId] = useState('')
  const [selectedPlatId, setSelectedPlatId] = useState('')
  const [selectedDessertId, setSelectedDessertId] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ceremonyLabel, setCeremonyLabel] = useState<string>(ceremony)
  const [ceremonyEmoji, setCeremonyEmoji] = useState('💒')
  const [createdGuest, setCreatedGuest] = useState<{ id: string; firstName: string; lastName: string } | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'menu' | 'respondedAt' | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const isSoiree = ceremony === 'SOIREE'

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
    if (isSoiree) {
      fetch('/api/menus/soiree')
        .then((r) => r.json())
        .then((data) => setComposableMenus(Array.isArray(data) ? data : []))
    } else {
      fetch(`/api/menus?ceremony=${ceremony}`)
        .then((r) => r.json())
        .then((data) => setMenuItems(Array.isArray(data) ? data : []))
    }
  }, [ceremony, isSoiree])

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

  const selectedComposableMenu = composableMenus.find((m) => m.id === selectedMenuId)
  const optionsFor = (course: CourseType) => selectedComposableMenu?.options.filter((o) => o.course === course) || []

  const chooseComposableMenu = (menuId: string) => {
    setSelectedMenuId(menuId)
    setSelectedEntreeId('')
    setSelectedPlatId('')
    setSelectedDessertId('')
  }

  const resetForm = () => {
    setNewFirstName(''); setNewLastName(''); setNewEmail(''); setNewPhone(''); setNewGuestId('')
    setSelectedMenuItemId(''); setSelectedMenuId(''); setSelectedEntreeId(''); setSelectedPlatId(''); setSelectedDessertId('')
    setNewNotes('')
  }

  const deleteInvitation = async (id: string) => {
    if (!confirm('Supprimer cette invitation ?')) return
    await fetch(`/api/admin/invitations/${id}`, { method: 'DELETE' })
    await load()
  }

  const handleAdd = async () => {
    if (addMode === 'new' && (!newFirstName || !newLastName)) {
      alert('Prénom et nom requis')
      return
    }
    if (addMode === 'existing' && !newGuestId) {
      alert('Choisissez un invité')
      return
    }

    if (isSoiree && composableMenus.length > 0) {
      if (!selectedMenuId) { alert('Veuillez choisir un menu'); return }
      if (optionsFor('ENTREE').length > 0 && !selectedEntreeId) { alert('Veuillez choisir une entrée'); return }
      if (optionsFor('PLAT').length > 0 && !selectedPlatId) { alert('Veuillez choisir un plat'); return }
      if (optionsFor('DESSERT').length > 0 && !selectedDessertId) { alert('Veuillez choisir un dessert'); return }
    } else if (!isSoiree && menuItems.length > 0 && !selectedMenuItemId) {
      alert('Veuillez choisir un menu')
      return
    }

    setSubmitting(true)
    try {
      let guestId = newGuestId
      let guestFirstName = newFirstName
      let guestLastName = newLastName
      if (addMode === 'new') {
        const gRes = await fetch('/api/admin/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName: newFirstName, lastName: newLastName, email: newEmail || null, phone: newPhone || null }),
        })
        const gData = await gRes.json()
        if (!gRes.ok) { alert(gData.error); setSubmitting(false); return }
        guestId = gData.id
      } else {
        const existingGuest = guests.find((g) => g.id === newGuestId)
        guestFirstName = existingGuest?.firstName || ''
        guestLastName = existingGuest?.lastName || ''
      }

      const iRes = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId,
          ceremony,
          menuItemId: !isSoiree ? selectedMenuItemId || null : null,
          menuId: isSoiree ? selectedMenuId || null : null,
          entreeOptionId: isSoiree ? selectedEntreeId || null : null,
          platOptionId: isSoiree ? selectedPlatId || null : null,
          dessertOptionId: isSoiree ? selectedDessertId || null : null,
          notes: newNotes || null,
        }),
      })
      const iData = await iRes.json()
      if (!iRes.ok) { alert(iData.error); setSubmitting(false); return }

      setShowAddForm(false)
      setCreatedGuest({ id: guestId, firstName: guestFirstName, lastName: guestLastName })
      resetForm()
      await load()
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSort = (col: 'name' | 'menu' | 'respondedAt') => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col)
      setSortDir('asc')
    }
  }

  const sortedInvitations = [...invitations].sort((a, b) => {
    if (!sortBy) return 0
    let cmp = 0
    if (sortBy === 'name') {
      cmp = `${a.guest.lastName} ${a.guest.firstName}`.localeCompare(`${b.guest.lastName} ${b.guest.firstName}`)
    } else if (sortBy === 'menu') {
      cmp = menuLabel(a).localeCompare(menuLabel(b))
    } else if (sortBy === 'respondedAt') {
      const aTime = a.respondedAt ? new Date(a.respondedAt).getTime() : 0
      const bTime = b.respondedAt ? new Date(b.respondedAt).getTime() : 0
      cmp = aTime - bTime
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const SortHeader = ({ col, label }: { col: 'name' | 'menu' | 'respondedAt'; label: string }) => (
    <th
      className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none hover:text-gray-800"
      onClick={() => toggleSort(col)}
    >
      {label} {sortBy === col && (sortDir === 'asc' ? '▲' : '▼')}
    </th>
  )

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
            onClick={() => { setCreatedGuest(null); setShowAddForm(true) }}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: '#8b7355' }}
          >
            + Ajouter un invité
          </button>
        </div>
      </div>

      {/* QR code confirmation after adding */}
      {createdGuest && (
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6 text-center" style={{ borderColor: '#f0e6d3' }}>
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="font-medium text-lg mb-1" style={{ color: '#8b7355' }}>
            {createdGuest.firstName} {createdGuest.lastName} est inscrit(e) et confirmé(e)
          </h3>
          <p className="text-gray-500 text-sm mb-6">Voici son QR code, à présenter le jour J pour le check-in.</p>
          <div className="max-w-xs mx-auto">
            <GuestQRCode guestId={createdGuest.id} guestName={`${createdGuest.firstName} ${createdGuest.lastName}`} light />
          </div>
          <button
            onClick={() => setCreatedGuest(null)}
            className="mt-6 px-4 py-2 rounded-lg text-sm border"
            style={{ borderColor: '#e8d5b7', color: '#8b7355' }}
          >
            Fermer
          </button>
        </div>
      )}

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

          {/* Menu selection — simple ceremonies */}
          {!isSoiree && menuItems.length > 0 && (
            <div className="mt-5">
              <label className="block text-sm font-medium mb-2" style={{ color: '#8b7355' }}>Menu *</label>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedMenuItemId(item.id)}
                    className="w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all"
                    style={{
                      borderColor: selectedMenuItemId === item.id ? '#8b7355' : '#e8d5b7',
                      background: selectedMenuItemId === item.id ? '#fdf3e3' : 'white',
                    }}
                  >
                    <div className="font-medium">{item.name}</div>
                    {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Menu selection — Soirée composable */}
          {isSoiree && composableMenus.length > 0 && (
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#8b7355' }}>Menu *</label>
                <div className="grid grid-cols-2 gap-2">
                  {composableMenus.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => chooseComposableMenu(m.id)}
                      className="px-4 py-2.5 rounded-lg border text-sm font-medium transition-all"
                      style={{
                        borderColor: selectedMenuId === m.id ? '#8b7355' : '#e8d5b7',
                        background: selectedMenuId === m.id ? '#fdf3e3' : 'white',
                      }}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedComposableMenu &&
                (['ENTREE', 'PLAT', 'DESSERT'] as CourseType[]).map((course) => {
                  const options = optionsFor(course)
                  if (options.length === 0) return null
                  const selectedId = course === 'ENTREE' ? selectedEntreeId : course === 'PLAT' ? selectedPlatId : selectedDessertId
                  const setSelectedId = course === 'ENTREE' ? setSelectedEntreeId : course === 'PLAT' ? setSelectedPlatId : setSelectedDessertId
                  return (
                    <div key={course}>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#8b7355' }}>{COURSE_LABELS[course]} *</label>
                      <div className="space-y-2">
                        {options.map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => setSelectedId(o.id)}
                            className="w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all"
                            style={{
                              borderColor: selectedId === o.id ? '#8b7355' : '#e8d5b7',
                              background: selectedId === o.id ? '#fdf3e3' : 'white',
                            }}
                          >
                            <div className="font-medium">{o.name}</div>
                            {o.description && <div className="text-xs text-gray-500">{o.description}</div>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          <div className="mt-5">
            <label className="block text-sm font-medium mb-2" style={{ color: '#8b7355' }}>
              Notes <span className="font-normal text-gray-400">(allergies, régime...)</span>
            </label>
            <input
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              placeholder="Ex : allergique aux noix"
              className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none"
              style={{ borderColor: '#e8d5b7' }}
            />
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={handleAdd} disabled={submitting} className="px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#8b7355' }}>
              {submitting ? 'Ajout...' : '✓ Confirmer l\'inscription'}
            </button>
            <button onClick={() => { setShowAddForm(false); resetForm() }} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: '#e8d5b7', color: '#8b7355' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#f0e6d3' }}>
        {invitations.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p>Aucune invitation trouvée</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#fdf3e3', borderBottom: '2px solid #f0e6d3' }}>
                <SortHeader col="name" label="Invité" />
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                <SortHeader col="menu" label="Menu" />
                <th className="text-left px-4 py-3 font-medium text-gray-600">Notes</th>
                <SortHeader col="respondedAt" label="Répondu le" />
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedInvitations.map((inv, i) => {
                return (
                  <tr key={inv.id} style={{ borderBottom: i < sortedInvitations.length - 1 ? '1px solid #f0e6d3' : 'none' }}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">
                        {inv.guest.lastName} {inv.guest.firstName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {inv.guest.email && <div>{inv.guest.email}</div>}
                      {inv.guest.phone && <div>{inv.guest.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{menuLabel(inv)}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-32 truncate" title={inv.notes || ''}>{inv.notes || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {inv.respondedAt ? new Date(inv.respondedAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
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
