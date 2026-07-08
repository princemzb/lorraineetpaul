import type { Metadata } from 'next'
import Link from 'next/link'
import { Playfair_Display, Manrope } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Mariage Loraine & Paul',
  description: 'Site officiel du mariage de Loraine et Paul',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${manrope.variable}`}>
      <body className="min-h-screen" style={{ background: 'var(--background)' }}>
        {children}
        <Link
          href="/contact"
          aria-label="Contacter Premices & Associés Consulting"
          title="Contacter Premices & Associés Consulting"
          className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-transform hover:scale-110"
          style={{
            background: '#050505',
            color: '#f6f2e9',
            border: '1px solid rgba(246,242,233,0.25)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
          }}
        >
          P
        </Link>
      </body>
    </html>
  )
}
