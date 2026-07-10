'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function HeroCarousel({
  photoIds,
  fallbackSrc,
}: {
  photoIds: string[]
  fallbackSrc: string
}) {
  const slides = photoIds.length > 0 ? photoIds.map((id) => `/api/hero-photos/${id}/image`) : [fallbackSrc]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 3000)
    return () => clearInterval(id)
  }, [slides.length])

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <AnimatePresence>
        <motion.img
          key={slides[index]}
          src={slides[index]}
          alt="Lorraine et Paul"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover object-[50%_40%]"
        />
      </AnimatePresence>
    </div>
  )
}
