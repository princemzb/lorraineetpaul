'use client'

import LuxeBackground from '@/components/public/LuxeBackground'
import ThemeCarousel from '@/components/public/ThemeCarousel'

export default function ThemePage() {
  return (
    <main className="relative font-accent" style={{ color: 'var(--ivoire)' }}>
      <LuxeBackground />

      <ThemeCarousel
        showBackLink
        emptyFallback={
          <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ color: 'var(--ivoire-dim)' }}>
            Le thème sera bientôt dévoilé, revenez plus tard !
          </div>
        }
      />
    </main>
  )
}
