'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import LuxeBackground from '@/components/public/LuxeBackground'
import Card from '@/components/public/Card'
import { GoldButton, GoldLink, OutlineButton } from '@/components/public/Buttons'
import GuestQRCode from '@/components/public/GuestQRCode'
import { formatCeremonyDate, formatDateRange } from '@/lib/format'


type CeremonyKey = 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE'
type CeremonyConfig = {
  ceremony: CeremonyKey
  name: string
  emoji: string
  description: string | null
  address: string | null
  date: string | null
}

type CourseType = 'ENTREE' | 'PLAT' | 'DESSERT'
type MenuOption = { id: string; course: CourseType; name: string; description?: string }
type ComposableMenu = { id: string; name: string; options: MenuOption[] }

type CeremonyForm = {
  selected: boolean
}

type SoireeForm = {
  selected: boolean
  menuId: string
  entreeOptionId: string
  platOptionId: string
  dessertOptionId: string
}

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  civil: CeremonyForm
  religieux: CeremonyForm
  vinHonneur: CeremonyForm
  soiree: SoireeForm
  notes: string
}

const COURSE_LABELS: Record<CourseType, string> = { ENTREE: 'Entrée', PLAT: 'Plat', DESSERT: 'Dessert' }

const OR = 'var(--or-light)'
const POMME = 'var(--pomme)'
const POMME_LIGHT = 'var(--pomme-light)'
const BORDER = 'var(--noir-border)'
const IVOIRE = 'var(--ivoire)'
const IVOIRE_DIM = 'var(--ivoire-dim)'

function Step({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={{
          background: done ? POMME : active ? OR : 'transparent',
          borderColor: done ? POMME : active ? OR : BORDER,
          color: done || active ? '#050505' : IVOIRE_DIM,
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border"
      >
        {done ? '✓' : n}
      </motion.div>
      <span className="text-sm hidden sm:block" style={{ color: active ? OR : IVOIRE_DIM }}>
        {label}
      </span>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: OR }}>
        {label} {required && <span style={{ color: '#f87171' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors bg-transparent"
        style={{ borderColor: BORDER, color: IVOIRE }}
        onFocus={(e) => (e.target.style.borderColor = POMME_LIGHT)}
        onBlur={(e) => (e.target.style.borderColor = BORDER)}
      />
    </div>
  )
}

function CeremonyCard({
  config,
  data,
  onChange,
}: {
  config: CeremonyConfig
  data: CeremonyForm
  onChange: (d: Partial<CeremonyForm>) => void
}) {
  return (
    <div
      className="rounded-2xl border overflow-hidden transition-colors"
      style={{ borderColor: data.selected ? POMME : BORDER }}
    >
      <button
        type="button"
        onClick={() => onChange({ selected: !data.selected })}
        className="w-full flex items-center gap-4 p-5 text-left transition-colors"
        style={{ background: data.selected ? 'rgba(124,179,66,0.08)' : 'transparent' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-colors"
          style={{ background: data.selected ? 'linear-gradient(135deg, var(--pomme-deep), var(--pomme))' : 'rgba(255,255,255,0.05)' }}
        >
          {config.emoji}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg" style={{ color: OR }}>
            {config.name}
          </div>
          <div className="text-sm" style={{ color: IVOIRE_DIM }}>
            {[formatCeremonyDate(config.date), config.address].filter(Boolean).join(' — ')}
          </div>
        </div>
        <div
          className="w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0"
          style={{
            borderColor: data.selected ? POMME : BORDER,
            background: data.selected ? POMME : 'transparent',
          }}
        >
          {data.selected && <span className="text-sm" style={{ color: '#050505' }}>✓</span>}
        </div>
      </button>
    </div>
  )
}

function CourseOptions({
  course,
  options,
  selectedId,
  onSelect,
}: {
  course: CourseType
  options: MenuOption[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  if (options.length === 0) return null
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: OR }}>
        {COURSE_LABELS[course]} <span style={{ color: '#f87171' }}>*</span>
      </label>
      <div className="space-y-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(o.id)}
            className="w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center gap-3"
            style={{
              borderColor: selectedId === o.id ? OR : BORDER,
              background: selectedId === o.id ? 'rgba(212,175,55,0.08)' : 'transparent',
            }}
          >
            <div
              className="w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center"
              style={{
                borderColor: selectedId === o.id ? OR : BORDER,
                background: selectedId === o.id ? OR : 'transparent',
              }}
            >
              {selectedId === o.id && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#050505' }} />}
            </div>
            <div>
              <div className="font-medium text-sm" style={{ color: IVOIRE }}>
                {o.name}
              </div>
              {o.description && <div className="text-xs" style={{ color: IVOIRE_DIM }}>{o.description}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function SoireeMenuCard({
  config,
  data,
  menus,
  onChange,
}: {
  config: CeremonyConfig
  data: SoireeForm
  menus: ComposableMenu[]
  onChange: (d: Partial<SoireeForm>) => void
}) {
  const selectedMenu = menus.find((m) => m.id === data.menuId)
  const byCourse = (course: CourseType) => selectedMenu?.options.filter((o) => o.course === course) || []

  const chooseMenu = (menuId: string) => {
    if (menuId === data.menuId) return
    onChange({ menuId, entreeOptionId: '', platOptionId: '', dessertOptionId: '' })
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-colors"
      style={{ borderColor: data.selected ? POMME : BORDER }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => onChange({ selected: !data.selected })}
        className="w-full flex items-center gap-4 p-5 text-left transition-colors"
        style={{ background: data.selected ? 'rgba(124,179,66,0.08)' : 'transparent' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-colors"
          style={{ background: data.selected ? 'linear-gradient(135deg, var(--pomme-deep), var(--pomme))' : 'rgba(255,255,255,0.05)' }}
        >
          {config.emoji}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg" style={{ color: OR }}>
            {config.name}
          </div>
          <div className="text-sm" style={{ color: IVOIRE_DIM }}>
            {[formatCeremonyDate(config.date), config.address].filter(Boolean).join(' — ')}
          </div>
        </div>
        <div
          className="w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0"
          style={{
            borderColor: data.selected ? POMME : BORDER,
            background: data.selected ? POMME : 'transparent',
          }}
        >
          {data.selected && <span className="text-sm" style={{ color: '#050505' }}>✓</span>}
        </div>
      </button>

      {/* Details (when selected) */}
      {data.selected && (
        <div className="px-5 pb-5 space-y-4" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '16px' }}>
          {menus.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: OR }}>
                Votre menu <span style={{ color: '#f87171' }}>*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {menus.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => chooseMenu(m.id)}
                    className="px-4 py-3 rounded-xl border text-center font-medium transition-colors"
                    style={{
                      borderColor: data.menuId === m.id ? POMME : BORDER,
                      background: data.menuId === m.id ? 'rgba(124,179,66,0.1)' : 'transparent',
                      color: data.menuId === m.id ? POMME_LIGHT : IVOIRE,
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedMenu && (
            <>
              <CourseOptions
                course="ENTREE"
                options={byCourse('ENTREE')}
                selectedId={data.entreeOptionId}
                onSelect={(id) => onChange({ entreeOptionId: id })}
              />
              <CourseOptions
                course="PLAT"
                options={byCourse('PLAT')}
                selectedId={data.platOptionId}
                onSelect={(id) => onChange({ platOptionId: id })}
              />
              <CourseOptions
                course="DESSERT"
                options={byCourse('DESSERT')}
                selectedId={data.dessertOptionId}
                onSelect={(id) => onChange({ dessertOptionId: id })}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

const FALLBACK_CONFIG = (ceremony: CeremonyKey): CeremonyConfig => ({
  ceremony,
  name: ceremony,
  emoji: '💍',
  description: null,
  address: null,
  date: null,
})

export default function RsvpClient() {
  const [step, setStep] = useState(1)
  const [ceremonyConfigs, setCeremonyConfigs] = useState<CeremonyConfig[]>([])
  const [soireeMenus, setSoireeMenus] = useState<ComposableMenu[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [guestId, setGuestId] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    civil: { selected: false },
    religieux: { selected: false },
    vinHonneur: { selected: false },
    soiree: { selected: false, menuId: '', entreeOptionId: '', platOptionId: '', dessertOptionId: '' },
    notes: '',
  })

  useEffect(() => {
    const load = async () => {
      const [ceremoniesRes, soireeRes] = await Promise.all([
        fetch('/api/ceremonies'),
        fetch('/api/menus/soiree'),
      ])
      const [configs, s] = await Promise.all([ceremoniesRes.json(), soireeRes.json()])
      setCeremonyConfigs(Array.isArray(configs) ? configs : [])
      setSoireeMenus(Array.isArray(s) ? s : [])
    }
    load()
  }, [])

  const configFor = (ceremony: CeremonyKey): CeremonyConfig =>
    ceremonyConfigs.find((c) => c.ceremony === ceremony) || FALLBACK_CONFIG(ceremony)

  const dateRangeLabel = useMemo(
    () => formatDateRange(ceremonyConfigs.map((c) => c.date).filter((d): d is string => !!d).map((d) => new Date(d))),
    [ceremonyConfigs]
  )

  const updateCivil = (d: Partial<CeremonyForm>) =>
    setForm((f) => ({ ...f, civil: { ...f.civil, ...d } }))
  const updateReligieux = (d: Partial<CeremonyForm>) =>
    setForm((f) => ({ ...f, religieux: { ...f.religieux, ...d } }))
  const updateVinHonneur = (d: Partial<CeremonyForm>) =>
    setForm((f) => ({ ...f, vinHonneur: { ...f.vinHonneur, ...d } }))
  const updateSoiree = (d: Partial<SoireeForm>) =>
    setForm((f) => ({ ...f, soiree: { ...f.soiree, ...d } }))

  const validateStep1 = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Adresse email invalide.')
      return false
    }
    setError('')
    return true
  }

  const validateStep2 = () => {
    if (!form.civil.selected && !form.religieux.selected && !form.vinHonneur.selected && !form.soiree.selected) {
      setError('Veuillez sélectionner au moins une cérémonie.')
      return false
    }
    if (form.soiree.selected && soireeMenus.length > 0) {
      const menu = soireeMenus.find((m) => m.id === form.soiree.menuId)
      if (!menu) {
        setError('Veuillez choisir un menu pour la Soirée.')
        return false
      }
      const hasCourse = (course: CourseType) => menu.options.some((o) => o.course === course)
      if (hasCourse('ENTREE') && !form.soiree.entreeOptionId) {
        setError('Veuillez choisir une entrée pour la Soirée.')
        return false
      }
      if (hasCourse('PLAT') && !form.soiree.platOptionId) {
        setError('Veuillez choisir un plat pour la Soirée.')
        return false
      }
      if (hasCourse('DESSERT') && !form.soiree.dessertOptionId) {
        setError('Veuillez choisir un dessert pour la Soirée.')
        return false
      }
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    const ceremonies = []
    if (form.civil.selected) {
      ceremonies.push({ ceremony: 'CIVIL' })
    }
    if (form.religieux.selected) {
      ceremonies.push({ ceremony: 'RELIGIEUX' })
    }
    if (form.vinHonneur.selected) {
      ceremonies.push({ ceremony: 'VIN_HONNEUR' })
    }
    if (form.soiree.selected) {
      ceremonies.push({
        ceremony: 'SOIREE',
        menuId: form.soiree.menuId || null,
        entreeOptionId: form.soiree.entreeOptionId || null,
        platOptionId: form.soiree.platOptionId || null,
        dessertOptionId: form.soiree.dessertOptionId || null,
      })
    }

    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        ceremonies,
        notes: form.notes,
      }),
    })

    const data = await res.json()
    if (res.ok) {
      setGuestId(data.guestId || '')
      setSubmitted(true)
    } else {
      setError(data.error || 'Une erreur est survenue.')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 relative font-accent" style={{ color: IVOIRE }}>
        <LuxeBackground />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg w-full text-center"
        >
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="font-display text-3xl mb-4 text-gold-shine">Merci, {form.firstName} !</h1>
          <p className="text-lg leading-relaxed mb-4" style={{ color: IVOIRE_DIM }}>
            Votre confirmation a bien été enregistrée. Nous sommes ravis de vous compter parmi nous !
          </p>
          <p className="text-sm mb-8" style={{ color: IVOIRE_DIM, opacity: 0.7 }}>
            Un email de confirmation a été envoyé à <strong style={{ color: IVOIRE }}>{form.email}</strong>
          </p>
          <Card className="p-6 mb-8 text-left">
            <h3 className="font-semibold mb-3" style={{ color: OR }}>Récapitulatif</h3>
            {form.civil.selected && (
              <div className="mb-2 text-sm" style={{ color: IVOIRE }}>
                <strong>{configFor('CIVIL').emoji} {configFor('CIVIL').name}</strong>
              </div>
            )}
            {form.religieux.selected && (
              <div className="mb-2 text-sm" style={{ color: IVOIRE }}>
                <strong>{configFor('RELIGIEUX').emoji} {configFor('RELIGIEUX').name}</strong>
              </div>
            )}
            {form.vinHonneur.selected && (
              <div className="mb-2 text-sm" style={{ color: IVOIRE }}>
                <strong>{configFor('VIN_HONNEUR').emoji} {configFor('VIN_HONNEUR').name}</strong>
              </div>
            )}
            {form.soiree.selected && (
              <div className="text-sm" style={{ color: IVOIRE }}>
                <strong>{configFor('SOIREE').emoji} {configFor('SOIREE').name}</strong>
                {form.soiree.menuId && (
                  <div style={{ color: IVOIRE_DIM }}>
                    {soireeMenus.find((m) => m.id === form.soiree.menuId)?.name}
                    {' — '}
                    {[
                      soireeMenus.flatMap((m) => m.options).find((o) => o.id === form.soiree.entreeOptionId)?.name,
                      soireeMenus.flatMap((m) => m.options).find((o) => o.id === form.soiree.platOptionId)?.name,
                      soireeMenus.flatMap((m) => m.options).find((o) => o.id === form.soiree.dessertOptionId)?.name,
                    ]
                      .filter(Boolean)
                      .join(' / ')}
                  </div>
                )}
              </div>
            )}
          </Card>

          {guestId && (
            <Card className="p-6 mb-8">
              <GuestQRCode guestId={guestId} guestName={`${form.firstName} ${form.lastName}`} />
            </Card>
          )}

          <GoldLink href="/">Retour à l&apos;accueil</GoldLink>

          <footer className="mt-12 text-sm" style={{ color: IVOIRE_DIM, opacity: 0.6 }}>
            <p>Lorraine &amp; Paul — {dateRangeLabel}</p>
            <p className="mt-2 text-xs opacity-70">
              Conçu par{' '}
              <Link href="/contact" className="hover:opacity-100 transition-opacity" style={{ color: OR }}>
                Premices &amp; Associés Consulting (PAC)
              </Link>
            </p>
          </footer>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-10 px-6 relative font-accent" style={{ color: IVOIRE }}>
      <LuxeBackground />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto mb-8 text-center"
      >
        <Link href="/" className="text-sm mb-4 inline-block transition-opacity hover:opacity-80" style={{ color: OR }}>
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="font-display text-4xl mb-2 text-gold-shine">Lorraine &amp; Paul</h1>
        <p style={{ color: IVOIRE_DIM }}>Confirmez votre présence à notre mariage</p>
      </motion.div>

      {/* Steps indicator */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-4">
          <Step n={1} label="Vos informations" active={step === 1} done={step > 1} />
          <div className="flex-1 h-px max-w-12" style={{ background: BORDER }} />
          <Step n={2} label="Cérémonies & menus" active={step === 2} done={step > 2} />
          <div className="flex-1 h-px max-w-12" style={{ background: BORDER }} />
          <Step n={3} label="Confirmation" active={step === 3} done={false} />
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <Card className="p-8">
          <AnimatePresence mode="wait">
            {/* Step 1 — Personal info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
              >
                <h2 className="text-xl font-medium mb-6" style={{ color: OR }}>
                  Vos informations
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Prénom"
                    value={form.firstName}
                    onChange={(v) => setForm((f) => ({ ...f, firstName: v }))}
                    required
                    placeholder="Marie"
                  />
                  <Input
                    label="Nom"
                    value={form.lastName}
                    onChange={(v) => setForm((f) => ({ ...f, lastName: v }))}
                    required
                    placeholder="Dupont"
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  required
                  placeholder="marie@exemple.fr"
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                  placeholder="06 12 34 56 78"
                />
              </motion.div>
            )}

            {/* Step 2 — Ceremonies & menus */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-medium mb-6" style={{ color: OR }}>
                  Quelle(s) cérémonie(s) ?
                </h2>
                <CeremonyCard config={configFor('CIVIL')} data={form.civil} onChange={updateCivil} />
                <CeremonyCard config={configFor('RELIGIEUX')} data={form.religieux} onChange={updateReligieux} />
                <CeremonyCard config={configFor('VIN_HONNEUR')} data={form.vinHonneur} onChange={updateVinHonneur} />
                <SoireeMenuCard config={configFor('SOIREE')} data={form.soiree} menus={soireeMenus} onChange={updateSoiree} />
                <div className="pt-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: OR }}>
                    Notes ou informations particulières
                    <span className="font-normal ml-1" style={{ color: IVOIRE_DIM }}>
                      (allergies, régime…)
                    </span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="Ex : allergique aux noix, végétarien, chaise haute nécessaire…"
                    className="w-full border rounded-xl px-4 py-3 resize-none focus:outline-none bg-transparent"
                    style={{ borderColor: BORDER, color: IVOIRE }}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3 — Review & submit */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="text-xl font-medium mb-6" style={{ color: OR }}>
                  Récapitulatif
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-xl border" style={{ borderColor: BORDER }}>
                    <p className="text-sm mb-1" style={{ color: IVOIRE_DIM }}>Participant</p>
                    <p className="font-semibold" style={{ color: IVOIRE }}>
                      {form.firstName} {form.lastName}
                    </p>
                    <p className="text-sm" style={{ color: IVOIRE_DIM }}>{form.email}</p>
                    {form.phone && <p className="text-sm" style={{ color: IVOIRE_DIM }}>{form.phone}</p>}
                  </div>

                  {form.civil.selected && (
                    <div className="p-4 rounded-xl border" style={{ borderColor: BORDER }}>
                      <p className="font-medium" style={{ color: OR }}>{configFor('CIVIL').emoji} {configFor('CIVIL').name}</p>
                    </div>
                  )}

                  {form.religieux.selected && (
                    <div className="p-4 rounded-xl border" style={{ borderColor: BORDER }}>
                      <p className="font-medium" style={{ color: OR }}>{configFor('RELIGIEUX').emoji} {configFor('RELIGIEUX').name}</p>
                    </div>
                  )}

                  {form.vinHonneur.selected && (
                    <div className="p-4 rounded-xl border" style={{ borderColor: BORDER }}>
                      <p className="font-medium" style={{ color: OR }}>{configFor('VIN_HONNEUR').emoji} {configFor('VIN_HONNEUR').name}</p>
                    </div>
                  )}
                  {form.soiree.selected && (
                    <div className="p-4 rounded-xl border" style={{ borderColor: BORDER }}>
                      <p className="font-medium mb-1" style={{ color: OR }}>{configFor('SOIREE').emoji} {configFor('SOIREE').name}</p>
                      {form.soiree.menuId && (
                        <p className="text-sm" style={{ color: IVOIRE_DIM }}>
                          {soireeMenus.find((m) => m.id === form.soiree.menuId)?.name} —{' '}
                          {[
                            soireeMenus.flatMap((m) => m.options).find((o) => o.id === form.soiree.entreeOptionId)?.name,
                            soireeMenus.flatMap((m) => m.options).find((o) => o.id === form.soiree.platOptionId)?.name,
                            soireeMenus.flatMap((m) => m.options).find((o) => o.id === form.soiree.dessertOptionId)?.name,
                          ]
                            .filter(Boolean)
                            .join(' / ')}
                        </p>
                      )}
                    </div>
                  )}

                  {form.notes && (
                    <div className="p-4 rounded-xl border" style={{ borderColor: BORDER }}>
                      <p className="text-sm mb-1" style={{ color: IVOIRE_DIM }}>Notes</p>
                      <p className="text-sm" style={{ color: IVOIRE }}>{form.notes}</p>
                    </div>
                  )}
                </div>

                <p className="text-sm mb-6" style={{ color: IVOIRE_DIM }}>
                  Un email de confirmation sera envoyé à <strong style={{ color: IVOIRE }}>{form.email}</strong>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div
              className="mt-4 p-3 rounded-xl text-sm border"
              style={{ background: 'rgba(220,38,38,0.1)', borderColor: 'rgba(220,38,38,0.3)', color: '#f87171' }}
            >
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <OutlineButton
                onClick={() => { setError(''); setStep((s) => s - 1) }}
                className="flex-1 py-3"
              >
                Précédent
              </OutlineButton>
            )}
            {step < 3 ? (
              <GoldButton onClick={handleNext} className="flex-1 py-3">
                Suivant →
              </GoldButton>
            ) : (
              <GoldButton onClick={handleSubmit} disabled={submitting} className="flex-1 py-3">
                {submitting ? 'Envoi en cours…' : '✓ Confirmer ma présence'}
              </GoldButton>
            )}
          </div>
        </Card>

        <footer className="mt-8 text-center text-sm" style={{ color: IVOIRE_DIM, opacity: 0.6 }}>
          <p>Lorraine &amp; Paul — {dateRangeLabel}</p>
          <p className="mt-2 text-xs opacity-70">
            Conçu par{' '}
            <Link href="/contact" className="hover:opacity-100 transition-opacity" style={{ color: OR }}>
              Premices &amp; Associés Consulting (PAC)
            </Link>
          </p>
        </footer>
      </div>
    </main>
  )
}
