import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCeremonyConfigs } from '@/lib/ceremonies'
import { formatDateRange } from '@/lib/format'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const ceremonies = await getCeremonyConfigs()
  const dateRangeLabel = formatDateRange(
    ceremonies.map((c) => c.date).filter((d): d is Date => !!d)
  )

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#f8f5f0' }}>
      <AdminSidebar ceremonies={ceremonies} email={session.user?.email} />

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col min-w-0">
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
