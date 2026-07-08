'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { GoldLink } from '@/components/public/Buttons'

type ThemePhoto = { id: string; description: string | null; order: number }

export default function ThemeCarousel({
  emptyFallback,
  showBackLink,
}: {
  emptyFallback?: ReactNode
  showBackLink?: boolean
}) {
  const [photos, setPhotos] = useState<ThemePhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    fetch('/api/theme-photos')
      .then((r) => r.json())
      .then((data) => setPhotos(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const goTo = (newIndex: number) => {
    setDirection(newIndex > index ? 1 : -1)
    setIndex((newIndex + photos.length) % photos.length)
  }

  const current = photos[index]

  if (loading) return null
  if (photos.length === 0) return emptyFallback ?? null

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="sync">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          key={current.id}
          src={`/api/theme-photos/${current.id}/image`}
          alt=""
          custom={direction}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
      </AnimatePresence>

      {/* Dark shape on the right to carry the text */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, transparent 38%, rgba(3,3,3,0.5) 55%, rgba(3,3,3,0.88) 75%, rgba(3,3,3,0.93) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-56 -z-10"
        style={{ background: 'linear-gradient(180deg, rgba(3,3,3,0.65) 0%, transparent 100%)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 -z-10"
        style={{ background: 'linear-gradient(0deg, rgba(3,3,3,0.75) 0%, transparent 100%)' }}
      />

      {/* Header */}
      <div className="relative pt-12 px-6 text-center">
        {showBackLink && (
          <Link href="/" className="text-sm mb-4 inline-block transition-opacity hover:opacity-80" style={{ color: 'var(--or-light)' }}>
            ← Retour à l&apos;accueil
          </Link>
        )}
        <h2 className="font-display text-3xl md:text-4xl mb-4 text-gold-shine">Le Thème</h2>
        <p
          className="inline-block text-sm md:text-base uppercase tracking-[0.15em] font-medium px-5 py-2 rounded-full border"
          style={{ color: 'var(--or-light)', borderColor: 'rgba(212,175,55,0.45)', background: 'rgba(212,175,55,0.1)' }}
        >
          Dress code et consignes pour notre grand jour
        </p>
      </div>

      {/* Text */}
      <div className="absolute inset-y-0 right-0 w-full sm:w-3/5 lg:w-1/2 flex items-center px-8 sm:px-12 lg:px-16">
        <AnimatePresence initial={false} mode="wait">
          <motion.p
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-xl md:text-2xl leading-relaxed font-display"
            style={{ color: 'var(--ivoire)' }}
          >
            {current.description || 'Aucune description pour cette photo.'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Navigation + CTA, overlaid at the bottom */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-6">
        {photos.length > 1 && (
          <div className="flex items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => goTo(index - 1)}
              className="w-11 h-11 rounded-full border flex items-center justify-center backdrop-blur-sm"
              style={{ borderColor: 'rgba(246,242,233,0.35)', color: 'var(--ivoire)', background: 'rgba(3,3,3,0.3)' }}
              aria-label="Photo précédente"
            >
              ←
            </motion.button>

            <div className="flex gap-2">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => goTo(i)}
                  aria-label={`Aller à la photo ${i + 1}`}
                  className="w-2.5 h-2.5 rounded-full transition-all"
                  style={{
                    background: i === index ? 'var(--or)' : 'rgba(246,242,233,0.4)',
                    transform: i === index ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => goTo(index + 1)}
              className="w-11 h-11 rounded-full border flex items-center justify-center backdrop-blur-sm"
              style={{ borderColor: 'rgba(246,242,233,0.35)', color: 'var(--ivoire)', background: 'rgba(3,3,3,0.3)' }}
              aria-label="Photo suivante"
            >
              →
            </motion.button>
          </div>
        )}

        <GoldLink href="/rsvp">Confirmer ma présence</GoldLink>
      </div>
    </div>
  )
}
