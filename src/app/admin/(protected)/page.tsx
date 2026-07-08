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
  const [
    civilTotal, civilConfirmed, civilDeclined,
    religieuxTotal, religieuxConfirmed, religieuxDeclined,
    vinHonneurTotal, vinHonneurConfirmed, vinHonneurDeclined,
    soireeTotal, soireeConfirmed, soireeDeclined,
    totalGuests,
  ] = await Promise.all([
    prisma.invitation.count({ where: { ceremony: 'CIVIL' } }),
    prisma.invitation.count({ where: { ceremony: 'CIVIL', status: 'CONFIRMED' } }),
    prisma.invitation.count({ where: { ceremony: 'CIVIL', status: 'DECLINED' } }),
    prisma.invitation.count({ where: { ceremony: 'RELIGIEUX' } }),
    prisma.invitation.count({ where: { ceremony: 'RELIGIEUX', status: 'CONFIRMED' } }),
    prisma.invitation.count({ where: { ceremony: 'RELIGIEUX', status: 'DECLINED' } }),
    prisma.invitation.count({ where: { ceremony: 'VIN_HONNEUR' } }),
    prisma.invitation.count({ where: { ceremony: 'VIN_HONNEUR', status: 'CONFIRMED' } }),
    prisma.invitation.count({ where: { ceremony: 'VIN_HONNEUR', status: 'DECLINED' } }),
    prisma.invitation.count({ where: { ceremony: 'SOIREE' } }),
    prisma.invitation.count({ where: { ceremony: 'SOIREE', status: 'CONFIRMED' } }),
    prisma.invitation.count({ where: { ceremony: 'SOIREE', status: 'DECLINED' } }),
    prisma.guest.count(),
  ])

  return {
    civil: { total: civilTotal, confirmed: civilConfirmed, declined: civilDeclined, pending: civilTotal - civilConfirmed - civilDeclined },
    religieux: { total: religieuxTotal, confirmed: religieuxConfirmed, declined: religieuxDeclined, pending: religieuxTotal - religieuxConfirmed - religieuxDeclined },
    vinHonneur: { total: vinHonneurTotal, confirmed: vinHonneurConfirmed, declined: vinHonneurDeclined, pending: vinHonneurTotal - vinHonneurConfirmed - vinHonneurDeclined },
    soiree: { total: soireeTotal, confirmed: soireeConfirmed, declined: soireeDeclined, pending: soireeTotal - soireeConfirmed - soireeDeclined },
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
  stats,
  href,
  icon,
}: {
  title: string
  stats: { total: number; confirmed: number; declined: number; pending: number }
  href: string
  icon: string
}) {
  const pct = stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: '#f0e6d3' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-xl font-medium" style={{ color: '#8b7355' }}>{title}</h3>
        </div>
        <Link
          href={href}
          className="text-sm px-4 py-2 rounded-lg text-white transition-all"
          style={{ background: '#8b7355' }}
        >
          Gérer →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg" style={{ background: '#f0fdf4' }}>
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          <div className="text-xs text-gray-500">Confirmés</div>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ background: '#fef2f2' }}>
          <div className="text-2xl font-bold text-red-500">{stats.declined}</div>
          <div className="text-xs text-gray-500">Déclinés</div>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ background: '#fef9f0' }}>
          <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
          <div className="text-xs text-gray-500">En attente</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Taux de confirmation</span>
          <span>{pct}% ({stats.total} invitations)</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: '#f0e6d3' }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #8b7355, #c9a96e)' }}
          />
        </div>
      </div>
    </div>
  )
}

export default async function AdminDashboard() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const [stats, ceremonyConfigs] = await Promise.all([getStats(), getCeremonyConfigs()])
  const dateRangeLabel = formatDateRange(ceremonyConfigs.map((c) => c.date).filter((d): d is Date => !!d))
  const statsByCeremony = {
    CIVIL: stats.civil,
    RELIGIEUX: stats.religieux,
    VIN_HONNEUR: stats.vinHonneur,
    SOIREE: stats.soiree,
  } as const

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-medium" style={{ color: '#8b7355', fontFamily: 'Georgia, serif' }}>
          Tableau de bord
        </h1>
        <p className="text-gray-500 mt-1">Mariage Loraine &amp; Paul — {dateRangeLabel}</p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total invités (personnes)" value={stats.totalGuests} color="#8b7355" />
        <StatCard
          label="Confirmations (toutes cérémonies)"
          value={stats.civil.confirmed + stats.religieux.confirmed + stats.vinHonneur.confirmed + stats.soiree.confirmed}
          color="#16a34a"
        />
        <StatCard
          label="En attente de réponse"
          value={stats.civil.pending + stats.religieux.pending + stats.vinHonneur.pending + stats.soiree.pending}
          color="#d97706"
        />
      </div>

      {/* Per ceremony */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {ceremonyConfigs.map((config) => (
          <CeremonySection
            key={config.ceremony}
            title={config.name}
            stats={statsByCeremony[config.ceremony]}
            href={CEREMONY_HREFS[config.ceremony]}
            icon={config.emoji}
          />
        ))}
      </div>
    </div>
  )
}
