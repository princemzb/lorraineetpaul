'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import LuxeBackground from '@/components/public/LuxeBackground'
import Card from '@/components/public/Card'
import { GoldButton } from '@/components/public/Buttons'
import GuestQRCode from '@/components/public/GuestQRCode'
import { formatCeremonyDate } from '@/lib/format'

type MenuItem = {
  id: string
  name: string
  description?: string
}

type CourseType = 'ENTREE' | 'PLAT' | 'DESSERT'
type MenuOption = { id: string; course: CourseType; name: string; description?: string }
type ComposableMenu = { id: string; name: string; options: MenuOption[] }

const COURSE_LABELS: Record<CourseType, string> = { ENTREE: 'Entrée', PLAT: 'Plat', DESSERT: 'Dessert' }

type Guest = {
  id: string
  firstName: string
  lastName: string
  email?: string
}

type Invitation = {
  id: string
  token: string
  ceremony: 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE'
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED'
  menuItemId?: string
  menuId?: string
  entreeOptionId?: string
  platOptionId?: string
  dessertOptionId?: string
  notes?: string
  guest: Guest
  menuItem?: MenuItem
}

type CeremonyConfig = {
  ceremony: Invitation['ceremony']
  name: string
  emoji: string
  description: string | null
  address: string | null
  date: string | null
}

export default function InvitationClient() {
  const { token } = useParams<{ token: string }>()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [ceremonyConfig, setCeremonyConfig] = useState<CeremonyConfig | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [composableMenus, setComposableMenus] = useState<ComposableMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [selectedStatus, setSelectedStatus] = useState<'CONFIRMED' | 'DECLINED' | null>(null)
  const [selectedMenu, setSelectedMenu] = useState('')
  const [selectedMenuId, setSelectedMenuId] = useState('')
  const [selectedEntreeId, setSelectedEntreeId] = useState('')
  const [selectedPlatId, setSelectedPlatId] = useState('')
  const [selectedDessertId, setSelectedDessertId] = useState('')
  const [notes, setNotes] = useState('')

  const isSoiree = invitation?.ceremony === 'SOIREE'

  useEffect(() => {
    fetch(`/api/invitation/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setInvitation(data.invitation)
          setMenuItems(data.menuItems || [])
          setComposableMenus(data.menus || [])
          fetch('/api/ceremonies')
            .then((r) => r.json())
            .then((configs: CeremonyConfig[]) => {
              setCeremonyConfig(configs.find((c) => c.ceremony === data.invitation.ceremony) || null)
            })
          if (data.invitation.status !== 'PENDING') {
            setSelectedStatus(data.invitation.status)
            setSelectedMenu(data.invitation.menuItemId || '')
            setSelectedMenuId(data.invitation.menuId || '')
            setSelectedEntreeId(data.invitation.entreeOptionId || '')
            setSelectedPlatId(data.invitation.platOptionId || '')
            setSelectedDessertId(data.invitation.dessertOptionId || '')
            setNotes(data.invitation.notes || '')
          }
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Erreur lors du chargement')
        setLoading(false)
      })
  }, [token])

  const selectedComposableMenu = composableMenus.find((m) => m.id === selectedMenuId)
  const optionsFor = (course: CourseType) => selectedComposableMenu?.options.filter((o) => o.course === course) || []

  const chooseComposableMenu = (menuId: string) => {
    setSelectedMenuId(menuId)
    setSelectedEntreeId('')
    setSelectedPlatId('')
    setSelectedDessertId('')
  }

  const handleSubmit = async () => {
    if (!selectedStatus) return

    if (selectedStatus === 'CONFIRMED') {
      if (isSoiree && composableMenus.length > 0) {
        if (!selectedMenuId) {
          alert('Veuillez choisir un menu')
          return
        }
        if (optionsFor('ENTREE').length > 0 && !selectedEntreeId) {
          alert('Veuillez choisir une entrée')
          return
        }
        if (optionsFor('PLAT').length > 0 && !selectedPlatId) {
          alert('Veuillez choisir un plat')
          return
        }
        if (optionsFor('DESSERT').length > 0 && !selectedDessertId) {
          alert('Veuillez choisir un dessert')
          return
        }
      } else if (!isSoiree && menuItems.length > 0 && !selectedMenu) {
        alert('Veuillez choisir un menu')
        return
      }
    }

    setSubmitting(true)
    const res = await fetch(`/api/invitation/${token}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: selectedStatus,
        menuItemId: selectedStatus === 'CONFIRMED' && !isSoiree ? selectedMenu || null : null,
        menuId: selectedStatus === 'CONFIRMED' && isSoiree ? selectedMenuId || null : null,
        entreeOptionId: selectedStatus === 'CONFIRMED' && isSoiree ? selectedEntreeId || null : null,
        platOptionId: selectedStatus === 'CONFIRMED' && isSoiree ? selectedPlatId || null : null,
        dessertOptionId: selectedStatus === 'CONFIRMED' && isSoiree ? selectedDessertId || null : null,
        notes,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setInvitation(data.invitation)
      setSubmitted(true)
    } else {
      alert(data.error || 'Erreur lors de la soumission')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <LuxeBackground />
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 rounded-full mx-auto mb-4"
            style={{ borderColor: 'var(--or)', borderTopColor: 'transparent' }}
          />
          <p style={{ color: 'var(--ivoire-dim)' }}>Chargement de votre invitation...</p>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 relative">
        <LuxeBackground />
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😔</div>
          <h1 className="font-display text-2xl mb-4 text-gold-shine">Invitation introuvable</h1>
          <p style={{ color: 'var(--ivoire-dim)' }}>
            Ce lien d&apos;invitation n&apos;est pas valide ou a expiré.
            <br />
            Contactez les mariés si vous pensez qu&apos;il y a une erreur.
          </p>
        </div>
      </div>
    )
  }

  const ceremonyLabel = ceremonyConfig?.name || invitation.ceremony
  const guestName = `${invitation.guest.firstName} ${invitation.guest.lastName}`
  const isEditing = invitation.status !== 'PENDING' && !submitted

  return (
    <main className="min-h-screen py-12 px-6 relative font-accent" style={{ color: 'var(--ivoire)' }}>
      <LuxeBackground />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto mb-8"
      >
        <Card className="overflow-hidden">
          <div
            className="h-1"
            style={{ background: 'linear-gradient(90deg, var(--pomme), var(--or))' }}
          />
          <div className="p-10 text-center">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: 'var(--pomme-light)' }}
            >
              Invitation personnelle
            </p>
            <h1 className="font-display text-4xl mb-2 text-gold-shine">Lorraine &amp; Paul</h1>
            <div
              className="w-16 h-px mx-auto my-4"
              style={{ background: 'linear-gradient(90deg, transparent, var(--or), transparent)' }}
            />
            <p className="text-lg" style={{ color: 'var(--ivoire)' }}>
              {ceremonyConfig?.emoji} {ceremonyLabel}
            </p>
            {ceremonyConfig?.date && (
              <p className="text-sm mt-1" style={{ color: 'var(--ivoire-dim)' }}>
                {formatCeremonyDate(ceremonyConfig.date)}
              </p>
            )}
            {ceremonyConfig?.address && (
              <p className="text-sm" style={{ color: 'var(--ivoire-dim)' }}>
                {ceremonyConfig.address}
              </p>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="max-w-2xl mx-auto"
      >
        {/* Guest name */}
        <Card className="p-8 mb-6">
          <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--or-light)' }}>
            Cher(e) {guestName},
          </h2>
          <p style={{ color: 'var(--ivoire-dim)' }} className="leading-relaxed">
            Nous vous avons réservé une place à notre{' '}
            <strong style={{ color: 'var(--ivoire)' }}>{ceremonyLabel}</strong>.
            <br />
            Merci de nous confirmer votre présence en remplissant ce formulaire.
          </p>
        </Card>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-10 text-center">
                <div className="text-5xl mb-4">{selectedStatus === 'CONFIRMED' ? '🎉' : '💔'}</div>
                <h3 className="font-display text-2xl mb-3 text-gold-shine">
                  {selectedStatus === 'CONFIRMED' ? 'À très bientôt !' : 'Réponse enregistrée'}
                </h3>
                <p className="mb-4" style={{ color: 'var(--ivoire-dim)' }}>
                  {selectedStatus === 'CONFIRMED'
                    ? 'Votre présence a été confirmée. Nous sommes ravis de vous compter parmi nous !'
                    : 'Votre réponse a bien été enregistrée. Nous espérons vous voir bientôt.'}
                </p>
                {invitation.guest.email && (
                  <p className="text-sm mb-6" style={{ color: 'var(--ivoire-dim)', opacity: 0.7 }}>
                    Un email de confirmation a été envoyé à {invitation.guest.email}
                  </p>
                )}
                {selectedStatus === 'CONFIRMED' && (
                  <div className="pt-2 border-t mb-2" style={{ borderColor: 'var(--noir-border)' }}>
                    <div className="pt-6">
                      <GuestQRCode guestId={invitation.guest.id} guestName={guestName} />
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm underline"
                  style={{ color: 'var(--or-light)' }}
                >
                  Modifier ma réponse
                </button>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <Card className="p-8">
                {isEditing && (
                  <div
                    className="mb-6 p-4 rounded-lg text-sm"
                    style={{ background: 'rgba(124,179,66,0.1)', color: 'var(--pomme-light)' }}
                  >
                    Vous avez déjà répondu à cette invitation. Vous pouvez modifier votre réponse.
                  </div>
                )}

                {/* RSVP Choice */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--or-light)' }}>
                    Serez-vous présent(e) ?
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedStatus('CONFIRMED')}
                      className="py-4 px-6 rounded-xl border text-center transition-colors"
                      style={{
                        borderColor: selectedStatus === 'CONFIRMED' ? 'var(--pomme)' : 'var(--noir-border)',
                        background: selectedStatus === 'CONFIRMED' ? 'var(--pomme-deep)' : 'transparent',
                        color: selectedStatus === 'CONFIRMED' ? 'var(--pomme-light)' : 'var(--ivoire-dim)',
                      }}
                    >
                      <div className="text-2xl mb-1">✓</div>
                      <div className="font-medium">Je confirme</div>
                      <div className="text-sm opacity-70">ma présence</div>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedStatus('DECLINED')}
                      className="py-4 px-6 rounded-xl border text-center transition-colors"
                      style={{
                        borderColor: selectedStatus === 'DECLINED' ? '#dc2626' : 'var(--noir-border)',
                        background: selectedStatus === 'DECLINED' ? 'rgba(220,38,38,0.15)' : 'transparent',
                        color: selectedStatus === 'DECLINED' ? '#f87171' : 'var(--ivoire-dim)',
                      }}
                    >
                      <div className="text-2xl mb-1">✗</div>
                      <div className="font-medium">Je décline</div>
                      <div className="text-sm opacity-70">avec regrets</div>
                    </motion.button>
                  </div>
                </div>

                {/* Menu Choice — cérémonies à menu simple */}
                {selectedStatus === 'CONFIRMED' && !isSoiree && menuItems.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--or-light)' }}>
                      Choisissez votre menu
                    </h3>
                    <div className="space-y-3">
                      {menuItems.map((item) => (
                        <motion.button
                          key={item.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedMenu(item.id)}
                          className="w-full text-left py-4 px-5 rounded-xl border transition-colors"
                          style={{
                            borderColor: selectedMenu === item.id ? 'var(--or)' : 'var(--noir-border)',
                            background: selectedMenu === item.id ? 'rgba(212,175,55,0.08)' : 'transparent',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0"
                              style={{
                                borderColor: selectedMenu === item.id ? 'var(--or)' : 'var(--noir-border)',
                                background: selectedMenu === item.id ? 'var(--or)' : 'transparent',
                              }}
                            >
                              {selectedMenu === item.id && (
                                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--noir)' }} />
                              )}
                            </div>
                            <div>
                              <div className="font-medium" style={{ color: 'var(--ivoire)' }}>
                                {item.name}
                              </div>
                              {item.description && (
                                <div className="text-sm" style={{ color: 'var(--ivoire-dim)' }}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Menu composable — Soirée : choix du menu puis entrée/plat/dessert */}
                {selectedStatus === 'CONFIRMED' && isSoiree && composableMenus.length > 0 && (
                  <div className="mb-8 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--or-light)' }}>
                        Choisissez votre menu
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {composableMenus.map((m) => (
                          <motion.button
                            key={m.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => chooseComposableMenu(m.id)}
                            className="px-4 py-3 rounded-xl border text-center font-medium transition-colors"
                            style={{
                              borderColor: selectedMenuId === m.id ? 'var(--pomme)' : 'var(--noir-border)',
                              background: selectedMenuId === m.id ? 'rgba(124,179,66,0.1)' : 'transparent',
                              color: selectedMenuId === m.id ? 'var(--pomme-light)' : 'var(--ivoire)',
                            }}
                          >
                            {m.name}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {selectedComposableMenu &&
                      (['ENTREE', 'PLAT', 'DESSERT'] as CourseType[]).map((course) => {
                        const options = optionsFor(course)
                        if (options.length === 0) return null
                        const selectedId =
                          course === 'ENTREE' ? selectedEntreeId : course === 'PLAT' ? selectedPlatId : selectedDessertId
                        const setSelectedId =
                          course === 'ENTREE' ? setSelectedEntreeId : course === 'PLAT' ? setSelectedPlatId : setSelectedDessertId
                        return (
                          <div key={course}>
                            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--or-light)' }}>
                              {COURSE_LABELS[course]}
                            </h3>
                            <div className="space-y-3">
                              {options.map((o) => (
                                <motion.button
                                  key={o.id}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  onClick={() => setSelectedId(o.id)}
                                  className="w-full text-left py-4 px-5 rounded-xl border transition-colors"
                                  style={{
                                    borderColor: selectedId === o.id ? 'var(--or)' : 'var(--noir-border)',
                                    background: selectedId === o.id ? 'rgba(212,175,55,0.08)' : 'transparent',
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0"
                                      style={{
                                        borderColor: selectedId === o.id ? 'var(--or)' : 'var(--noir-border)',
                                        background: selectedId === o.id ? 'var(--or)' : 'transparent',
                                      }}
                                    >
                                      {selectedId === o.id && (
                                        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--noir)' }} />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-medium" style={{ color: 'var(--ivoire)' }}>
                                        {o.name}
                                      </div>
                                      {o.description && (
                                        <div className="text-sm" style={{ color: 'var(--ivoire-dim)' }}>
                                          {o.description}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}

                {/* Notes */}
                {selectedStatus && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--or-light)' }}>
                      Informations complémentaires
                      <span className="text-sm font-normal ml-2" style={{ color: 'var(--ivoire-dim)' }}>
                        (optionnel)
                      </span>
                    </h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Allergies, régime particulier, accessibilité..."
                      rows={3}
                      className="w-full border rounded-xl p-4 resize-none focus:outline-none bg-transparent"
                      style={{ borderColor: 'var(--noir-border)', color: 'var(--ivoire)' }}
                    />
                  </div>
                )}

                {/* Submit */}
                <GoldButton onClick={handleSubmit} disabled={!selectedStatus || submitting} className="w-full py-4 text-lg">
                  {submitting ? 'Envoi en cours...' : 'Confirmer ma réponse'}
                </GoldButton>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  )
}
