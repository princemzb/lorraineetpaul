import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { getCeremonyConfigs } from '@/lib/ceremonies'

async function loadGuestDetails(id: string) {
  const guest = await prisma.guest.findUnique({
    where: { id },
    include: {
      invitations: {
        include: { menuItem: true, menu: true, entreeOption: true, platOption: true, dessertOption: true },
      },
    },
  })
  if (!guest) return null

  const ceremonyConfigs = await getCeremonyConfigs()
  const configByCeremony = new Map(ceremonyConfigs.map((c) => [c.ceremony, c]))

  return {
    id: guest.id,
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email,
    phone: guest.phone,
    checkedInAt: guest.checkedInAt,
    table: guest.table,
    adminNote: guest.adminNote,
    invitations: guest.invitations.map((inv) => {
      const config = configByCeremony.get(inv.ceremony)
      const menu =
        inv.ceremony === 'SOIREE'
          ? inv.menu
            ? `${inv.menu.name} — ${[inv.entreeOption?.name, inv.platOption?.name, inv.dessertOption?.name].filter(Boolean).join(' / ')}`
            : null
          : inv.menuItem?.name || null
      return {
        ceremony: inv.ceremony,
        ceremonyName: config?.name || inv.ceremony,
        ceremonyEmoji: config?.emoji || '💍',
        status: inv.status,
        accompanistCount: inv.accompanistCount,
        notes: inv.notes,
        menu,
      }
    }),
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const guest = await loadGuestDetails(id)
  if (!guest) return NextResponse.json({ error: 'Invité introuvable' }, { status: 404 })

  return NextResponse.json(guest)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const existing = await prisma.guest.findUnique({ where: { id }, select: { checkedInAt: true } })
  if (!existing) return NextResponse.json({ error: 'Invité introuvable' }, { status: 404 })

  const alreadyCheckedIn = !!existing.checkedInAt
  if (!alreadyCheckedIn) {
    await prisma.guest.update({ where: { id }, data: { checkedInAt: new Date() } })
  }

  const guest = await loadGuestDetails(id)
  return NextResponse.json({ ...guest, alreadyCheckedIn })
}
