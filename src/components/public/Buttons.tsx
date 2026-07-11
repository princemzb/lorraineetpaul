'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { ReactNode } from 'react'

const goldGradient = 'linear-gradient(135deg, var(--or-deep), var(--or) 55%, var(--or-light))'

export function GoldLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <motion.span
      className="inline-block"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <Link
        href={href}
        className={`inline-block px-10 py-4 rounded-lg font-medium tracking-wide ${className}`}
        style={{
          background: goldGradient,
          color: 'var(--noir)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.28)',
        }}
      >
        {children}
      </Link>
    </motion.span>
  )
}

export function GoldButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`rounded-full font-medium tracking-wide disabled:cursor-not-allowed ${className}`}
      style={{
        background: disabled ? 'rgba(212,175,55,0.25)' : goldGradient,
        color: disabled ? 'var(--ivoire-dim)' : 'var(--noir)',
        boxShadow: disabled ? 'none' : '0 8px 24px rgba(212,175,55,0.22)',
      }}
    >
      {children}
    </motion.button>
  )
}

export function OutlineButton({
  children,
  onClick,
  className = '',
  style,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02, borderColor: 'var(--pomme-light)' }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-full font-medium tracking-wide border transition-colors ${className}`}
      style={{ borderColor: 'var(--noir-border)', color: 'var(--ivoire)', ...style }}
    >
      {children}
    </motion.button>
  )
}
