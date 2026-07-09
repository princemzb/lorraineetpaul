'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import LuxeBackground from '@/components/public/LuxeBackground'
import HeroCarousel from '@/components/public/HeroCarousel'
import Reveal from '@/components/public/Reveal'
import Card from '@/components/public/Card'
import { GoldLink } from '@/components/public/Buttons'
import ThemeCarousel from '@/components/public/ThemeCarousel'
import { formatCeremonyDate, formatDateRange } from '@/lib/format'

type CeremonyConfig = {
  ceremony: string
  name: string
  emoji: string
  description: string | null
  address: string | null
  date: string | null
  order: number
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div
        className="relative w-20 h-20 flex items-center justify-center rounded-2xl overflow-hidden border"
        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--noir-border)' }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-4xl font-display absolute"
            style={{ color: 'var(--or-light)' }}
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <div
        className="text-xs mt-3 tracking-[0.2em] uppercase"
        style={{ color: 'var(--pomme-light)' }}
      >
        {label}
      </div>
    </div>
  )
}

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const diff = targetDate.getTime() - now.getTime()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <div className="flex gap-4 sm:gap-6 justify-center">
      <CountdownUnit value={timeLeft.days} label="Jours" />
      <CountdownUnit value={timeLeft.hours} label="Heures" />
      <CountdownUnit value={timeLeft.minutes} label="Minutes" />
      <CountdownUnit value={timeLeft.seconds} label="Secondes" />
    </div>
  )
}

export default function HomePage() {
  const [ceremonies, setCeremonies] = useState<CeremonyConfig[]>([])
  const [heroPhotoIds, setHeroPhotoIds] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/ceremonies')
      .then((r) => r.json())
      .then((data) => setCeremonies(Array.isArray(data) ? data : []))
    fetch('/api/hero-photos')
      .then((r) => r.json())
      .then((data) => setHeroPhotoIds(Array.isArray(data) ? data.map((p: { id: string }) => p.id) : []))
  }, [])

  const weddingDate = useMemo(() => {
    const dates = ceremonies.map((c) => c.date).filter((d): d is string => !!d)
    if (dates.length === 0) return new Date('2026-08-14T11:00:00')
    return new Date(Math.min(...dates.map((d) => new Date(d).getTime())))
  }, [ceremonies])

  const dateRangeLabel = useMemo(
    () => formatDateRange(ceremonies.map((c) => c.date).filter((d): d is string => !!d).map((d) => new Date(d))),
    [ceremonies]
  )

  return (
    <main className="min-h-screen font-accent" style={{ color: 'var(--ivoire)' }}>
      <LuxeBackground />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <HeroCarousel photoIds={heroPhotoIds} fallbackSrc="/images/hero-couple.png" />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(180deg, rgba(3,3,3,0.5) 0%, rgba(3,3,3,0.55) 45%, rgba(3,3,3,0.85) 80%, var(--noir) 100%)',
          }}
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="tracking-[0.3em] uppercase text-xs sm:text-sm mb-6"
          style={{ color: 'var(--pomme-light)' }}
        >
          Vous êtes cordialement invités au mariage de
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-6xl md:text-8xl mb-2 text-gold-shine"
        >
          Loraine
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="font-display italic text-3xl mb-2"
          style={{ color: 'var(--pomme-light)' }}
        >
          &amp;
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-6xl md:text-8xl mb-8 text-gold-shine"
        >
          Paul
        </motion.h1>

        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 96, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="h-px mx-auto mb-8"
          style={{ background: 'linear-gradient(90deg, transparent, var(--or), transparent)' }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="text-lg sm:text-xl mb-12"
          style={{ color: 'var(--ivoire-dim)' }}
        >
          {dateRangeLabel}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
        >
          <Countdown targetDate={weddingDate} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="mt-12"
        >
          <GoldLink href="/rsvp">Confirmer ma présence</GoldLink>
        </motion.div>

        <motion.a
          href="#ceremonies"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.2 }}
          className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 hover:opacity-100 transition-opacity mx-auto w-fit"
          style={{ color: 'var(--pomme-light)', opacity: 0.75 }}
        >
          <span className="text-xs tracking-[0.3em]">DÉCOUVRIR</span>
          <motion.svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.a>
      </section>

      {/* Ceremonies */}
      <section id="ceremonies" className="relative min-h-screen flex flex-col items-center px-6 pt-20 pb-24">
        <div className="max-w-5xl mx-auto w-full">
          <Reveal className="text-center mb-16">
            <h2 className="font-display text-4xl mb-4 text-gold-shine">Les Cérémonies</h2>
            <p style={{ color: 'var(--ivoire-dim)' }}>
              Quatre moments inoubliables pour célébrer notre amour
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {ceremonies.map((c, i) => (
              <Reveal key={c.ceremony} delay={i * 0.1}>
                <Card hover rounded="rounded-lg" className="overflow-hidden h-full">
                  <div
                    className="h-1.5"
                    style={{ background: 'linear-gradient(90deg, var(--pomme), var(--or))' }}
                  />
                  <div className="p-10 md:p-12 text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto"
                      style={{ background: 'linear-gradient(135deg, var(--pomme-deep), var(--pomme))' }}
                    >
                      {c.emoji}
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl mb-3" style={{ color: 'var(--or-light)' }}>
                      {c.name}
                    </h3>
                    {c.description && (
                      <p className="text-base mb-5" style={{ color: 'var(--ivoire-dim)' }}>
                        {c.description}
                      </p>
                    )}
                    <div className="space-y-4 text-base" style={{ color: 'var(--ivoire-dim)' }}>
                      {c.date && (
                        <div className="flex items-center justify-center gap-3">
                          <svg
                            className="w-5 h-5 flex-shrink-0"
                            style={{ color: 'var(--pomme-light)' }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{formatCeremonyDate(c.date)}</span>
                        </div>
                      )}
                      {c.address && (
                        <div className="flex items-center justify-center gap-3">
                          <svg
                            className="w-5 h-5 flex-shrink-0"
                            style={{ color: 'var(--pomme-light)' }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{c.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Theme */}
      <section className="relative">
        <Reveal>
          <ThemeCarousel />
        </Reveal>
      </section>

      {/* Footer */}
      <footer
        className="relative py-8 text-center text-sm border-t"
        style={{ borderColor: 'var(--noir-border)', color: 'var(--ivoire-dim)' }}
      >
        <p>Loraine &amp; Paul — {dateRangeLabel}</p>
        <p className="mt-3 text-xs opacity-60">
          Conçu par{' '}
          <Link href="/contact" className="hover:opacity-100 transition-opacity" style={{ color: 'var(--or-light)' }}>
            Premices &amp; Associés Consulting (PAC)
          </Link>
        </p>
      </footer>
    </main>
  )
}
