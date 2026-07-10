'use client'

import { useState } from 'react'
import Link from 'next/link'
import { adminSignOut } from '@/app/admin/actions'

type CeremonyConfig = { ceremony: string; name: string; emoji: string }

const CEREMONY_HREFS: Record<string, string> = {
  CIVIL: '/admin/invitations/civil',
  RELIGIEUX: '/admin/invitations/religieux',
  VIN_HONNEUR: '/admin/invitations/vin-honneur',
  SOIREE: '/admin/invitations/soiree',
}

export default function AdminSidebar({ ceremonies, email }: { ceremonies: CeremonyConfig[]; email?: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 shadow-md"
        style={{ background: 'linear-gradient(180deg, #8b7355, #6b5a45)' }}
      >
        <span className="text-white font-bold" style={{ fontFamily: 'Georgia, serif' }}>
          Loraine & Paul
        </span>
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="text-white p-2 -mr-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col shadow-lg transform transition-transform duration-300 md:static md:translate-x-0 md:shadow-lg ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'linear-gradient(180deg, #8b7355, #6b5a45)' }}
      >
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Georgia, serif' }}>
              Loraine & Paul
            </h1>
            <p className="text-white/60 text-xs mt-1">Administration</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="md:hidden text-white/70 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" onClick={() => setOpen(false)}>
          <NavLink href="/admin" exact label="Tableau de bord" icon="📊" />
          <div className="pt-3 pb-1">
            <p className="text-white/40 text-xs uppercase tracking-widest px-3">Cérémonies</p>
          </div>
          {ceremonies.map((c) => (
            <NavLink key={c.ceremony} href={CEREMONY_HREFS[c.ceremony]} label={c.name} icon={c.emoji} />
          ))}
          <div className="pt-3 pb-1">
            <p className="text-white/40 text-xs uppercase tracking-widest px-3">Gestion</p>
          </div>
          <NavLink href="/admin/guests" label="Invités" icon="👥" />
          <NavLink href="/admin/menus" label="Menus" icon="🍽️" />
          <NavLink href="/admin/ceremonies" label="Cérémonies" icon="💒" />
          <NavLink href="/admin/hero-photos" label="Photos d'accueil" icon="📷" />
          <NavLink href="/admin/theme-photos" label="Thème & consignes" icon="🎨" />
          <NavLink href="/admin/checkin" label="Check-in invités" icon="✅" />
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-white/60 text-xs mb-3 truncate">{email}</p>
          <form action={adminSignOut}>
            <button
              type="submit"
              className="w-full text-left text-white/70 hover:text-white text-sm transition-colors flex items-center gap-2"
            >
              <span>🚪</span> Se déconnecter
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}

function NavLink({ href, label, icon, exact }: { href: string; label: string; icon: string; exact?: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
