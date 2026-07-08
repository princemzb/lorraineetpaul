'use client'

import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'

export default function Card({
  children,
  className = '',
  style,
  hover = false,
  rounded = 'rounded-2xl',
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  hover?: boolean
  rounded?: string
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, borderColor: 'var(--or)' } : undefined}
      transition={{ duration: 0.3 }}
      className={`${rounded} border ${className}`}
      style={{
        background: 'var(--noir-surface)',
        borderColor: 'var(--noir-border)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}
