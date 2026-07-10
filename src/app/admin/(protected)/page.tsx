import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { getCeremonyConfigs } from '@/lib/ceremonies'
import { formatDateRange } from '@/lib/format'

const CEREMONY_HREFS: Record<string, string> = {
  CIVIL: '/admin/invitations/civil',
  RELIGIEUX: '/admin/invitations/religieux',
  VIN_HONNEUR: '/admin/invitations/vin-honneur',
  SOIREE: '/admin/invitations/soiree',
}

async function getStats() {
  const [civilTotal, religieuxTotal, vinHonneurTotal, soireeTotal, totalGuests] = await Promise.all([
    prisma.invitation.count({ where: { ceremony: 'CIVIL' } }),
    prisma.invitation.count({ where: { ceremony: 'RELIGIEUX' } }),
    prisma.invitation.count({ where: { ceremony: 'VIN_HONNEUR' } }),
    prisma.invitation.count({ where: { ceremony: 'SOIREE' } }),
    prisma.guest.count(),
  ])

  return {
    civil: { total: civilTotal },
    religieux: { total: religieuxTotal },
    vinHonneur: { total: vinHonneurTotal },
    soiree: { total: soireeTotal },
    totalGuests,
  }
}

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: '#f0e6d3' }}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function CeremonySection({
  title,
  total,
  href,
  icon,
}: {
  title: string
  total: number
  href: string
  icon: string
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: '#f0e6d3' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-xl font-medium" style={{ color: '#8b7355' }}>{title}</h3>
        </div>
        <Link
          href={href}
          title="Gérer les invités"
          aria-label="Gérer les invités"
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-110"
          style={{ background: '#fdf3e3' }}
        >
          ⚙️
        </Link>
      </div>

      <div className="mt-6 text-center p-4 rounded-lg" style={{ background: '#f0fdf4' }}>
        <div className="text-3xl font-bold text-green-600">{total}</div>
        <div className="text-xs text-gray-500 mt-1">invité{total > 1 ? 's' : ''} inscrit{total > 1 ? 's' : ''}</div>
      </div>
    </div>
  )
}

export default async function AdminDashboard() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const [stats, ceremonyConfigs] = await Promise.all([getStats(), getCeremonyConfigs()])
  const dateRangeLabel = formatDateRange(ceremonyConfigs.map((c) => c.date).filter((d): d is Date => !!d))
  const totalsByCeremony = {
    CIVIL: stats.civil.total,
    RELIGIEUX: stats.religieux.total,
    VIN_HONNEUR: stats.vinHonneur.total,
    SOIREE: stats.soiree.total,
  } as const

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-medium" style={{ color: '#8b7355', fontFamily: 'Georgia, serif' }}>
          Tableau de bord
        </h1>
        <p className="text-gray-500 mt-1">Mariage Lorraine &amp; Paul — {dateRangeLabel}</p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatCard label="Total invités (personnes)" value={stats.totalGuests} color="#8b7355" />
        <StatCard
          label="Total invitations (toutes cérémonies)"
          value={stats.civil.total + stats.religieux.total + stats.vinHonneur.total + stats.soiree.total}
          color="#16a34a"
        />
      </div>

      {/* Per ceremony */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {ceremonyConfigs.map((config) => (
          <CeremonySection
            key={config.ceremony}
            title={config.name}
            total={totalsByCeremony[config.ceremony]}
            href={CEREMONY_HREFS[config.ceremony]}
            icon={config.emoji}
          />
        ))}
      </div>
    </div>
  )
}
