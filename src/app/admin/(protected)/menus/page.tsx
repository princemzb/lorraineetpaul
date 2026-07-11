'use client'

import { useEffect, useState, useCallback } from 'react'

type CourseType = 'ENTREE' | 'PLAT' | 'DESSERT'
type MenuOption = { id: string; menuId: string; course: CourseType; name: string; description?: string; order: number }
type ComposableMenu = { id: string; name: string; options: MenuOption[] }

const COURSE_LABELS: Record<CourseType, string> = { ENTREE: 'Entrées', PLAT: 'Plats', DESSERT: 'Desserts' }
const COURSES: CourseType[] = ['ENTREE', 'PLAT', 'DESSERT']

function OptionForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: { name: string; description: string; order: number }
  onCancel: () => void
  onSave: (v: { name: string; description: string; order: number }) => Promise<void>
}) {
  const [name, setName] = useState(initial.name)
  const [description, setDescription] = useState(initial.description)
  const [order, setOrder] = useState(initial.order)
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className="p-3 rounded-lg border space-y-2" style={{ borderColor: '#e8d5b7', background: '#fdf3e3' }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom du plat *"
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
        style={{ borderColor: '#e8d5b7' }}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
        style={{ borderColor: '#e8d5b7' }}
      />
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
          placeholder="Ordre"
          className="w-20 border rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={{ borderColor: '#e8d5b7' }}
        />
        <button
          disabled={submitting || !name.trim()}
          onClick={async () => {
            setSubmitting(true)
            await onSave({ name, description, order })
            setSubmitting(false)
          }}
          className="px-3 py-2 rounded-lg text-white text-xs"
          style={{ background: '#8b7355' }}
        >
          {submitting ? '...' : 'Enregistrer'}
        </button>
        <button onClick={onCancel} className="px-3 py-2 rounded-lg text-xs border" style={{ borderColor: '#e8d5b7', color: '#8b7355' }}>
          Annuler
        </button>
      </div>
    </div>
  )
}

function SoireeMenuManager() {
  const [menus, setMenus] = useState<ComposableMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [addingFor, setAddingFor] = useState<{ menuId: string; course: CourseType } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/menus/soiree')
    const data = await res.json()
    setMenus(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const createOption = async (menuId: string, course: CourseType, v: { name: string; description: string; order: number }) => {
    const res = await fetch('/api/admin/menus/soiree/options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuId, course, name: v.name, description: v.description || null, order: v.order }),
    })
    if (res.ok) {
      setAddingFor(null)
      await load()
    } else {
      const d = await res.json()
      alert(d.error)
    }
  }

  const updateOption = async (id: string, v: { name: string; description: string; order: number }) => {
    const res = await fetch(`/api/admin/menus/soiree/options/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: v.name, description: v.description || null, order: v.order }),
    })
    if (res.ok) {
      setEditingId(null)
      await load()
    } else {
      const d = await res.json()
      alert(d.error)
    }
  }

  const deleteOption = async (id: string) => {
    if (!confirm('Supprimer cette option ?')) return
    await fetch(`/api/admin/menus/soiree/options/${id}`, { method: 'DELETE' })
    await load()
  }

  if (loading) return <div className="text-gray-400 text-sm p-4">Chargement...</div>

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {menus.map((menu) => (
        <div key={menu.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#f0e6d3' }}>
          <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #f0e6d3', background: '#fdf3e3' }}>
            <span>🥂</span>
            <h3 className="font-medium" style={{ color: '#8b7355' }}>{menu.name}</h3>
          </div>
          <div className="p-6 space-y-6">
            {COURSES.map((course) => {
              const options = menu.options.filter((o) => o.course === course).sort((a, b) => a.order - b.order)
              return (
                <div key={course}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-600">{COURSE_LABELS[course]}</h4>
                    <button
                      onClick={() => setAddingFor({ menuId: menu.id, course })}
                      className="text-xs px-2 py-1 rounded border"
                      style={{ borderColor: '#e8d5b7', color: '#8b7355' }}
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {options.length === 0 && <p className="text-xs text-gray-400">Aucune option</p>}
                    {options.map((o) =>
                      editingId === o.id ? (
                        <OptionForm
                          key={o.id}
                          initial={{ name: o.name, description: o.description || '', order: o.order }}
                          onCancel={() => setEditingId(null)}
                          onSave={(v) => updateOption(o.id, v)}
                        />
                      ) : (
                        <div key={o.id} className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ borderColor: '#f0e6d3' }}>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{o.name}</div>
                            {o.description && <div className="text-xs text-gray-500">{o.description}</div>}
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setEditingId(o.id)} className="px-2 py-1 rounded text-xs border" style={{ borderColor: '#e8d5b7', color: '#8b7355' }}>
                              ✏️
                            </button>
                            <button onClick={() => deleteOption(o.id)} className="px-2 py-1 rounded text-xs border" style={{ borderColor: '#fecaca', color: '#dc2626' }}>
                              🗑️
                            </button>
                          </div>
                        </div>
                      )
                    )}
                    {addingFor?.menuId === menu.id && addingFor.course === course && (
                      <OptionForm
                        initial={{ name: '', description: '', order: options.length + 1 }}
                        onCancel={() => setAddingFor(null)}
                        onSave={(v) => createOption(menu.id, course, v)}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MenusPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-medium" style={{ color: '#8b7355', fontFamily: 'Georgia, serif' }}>
          🍽️ Gestion des menus
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Seule la Soirée de Mariage propose un choix de menu à ses invités.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4" style={{ color: '#8b7355', fontFamily: 'Georgia, serif' }}>
          🥂 Soirée de Mariage — Menus composables
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Les invités choisissent un menu (Paul ou Lorraine) puis composent leur repas parmi les entrées, plats et desserts proposés.
        </p>
        <SoireeMenuManager />
      </div>
    </div>
  )
}
