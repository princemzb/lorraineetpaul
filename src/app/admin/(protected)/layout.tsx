import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/auth'
import { getCeremonyConfigs } from '@/lib/ceremonies'
import { formatDateRange } from '@/lib/format'

const CEREMONY_HREFS: Record<string, string> = {
  CIVIL: '/admin/invitations/civil',
  RELIGIEUX: '/admin/invitations/religieux',
  VIN_HONNEUR: '/admin/invitations/vin-honneur',
  SOIREE: '/admin/invitations/soiree',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const ceremonies = await getCeremonyConfigs()
  const dateRangeLabel = formatDateRange(
    ceremonies.map((c) => c.date).filter((d): d is Date => !!d)
  )

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f5f0' }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col shadow-lg"
        style={{ background: 'linear-gradient(180deg, #8b7355, #6b5a45)' }}
      >
        <div className="p-6 border-b border-white/10">
          <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Georgia, serif' }}>
            Loraine & Paul
          </h1>
          <p className="text-white/60 text-xs mt-1">Administration</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
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
          <p className="text-white/60 text-xs mb-3">{session.user?.email}</p>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/admin/login' }) }}>
            <button
              type="submit"
              className="w-full text-left text-white/70 hover:text-white text-sm transition-colors flex items-center gap-2"
            >
              <span>🚪</span> Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1">{children}</div>

        <footer className="px-8 py-4 text-center border-t" style={{ borderColor: '#f0e6d3' }}>
          <p className="text-xs" style={{ color: '#a8987d' }}>Loraine &amp; Paul — {dateRangeLabel}</p>
          <p className="text-[11px] mt-1" style={{ color: '#c4b8a3' }}>
            Conçu par{' '}
            <Link href="/contact" className="hover:opacity-70 transition-opacity" style={{ color: '#8b7355' }}>
              Premices &amp; Associés Consulting (PAC)
            </Link>
          </p>
        </footer>
      </main>
    </div>
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
