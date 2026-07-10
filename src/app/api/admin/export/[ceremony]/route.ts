import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { generateCSV } from '@/lib/csv'
import { getCeremonyConfig } from '@/lib/ceremonies'

export async function GET(req: Request, { params }: { params: Promise<{ ceremony: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { ceremony } = await params
  const ceremonyUpper = ceremony.toUpperCase() as 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE'
  const ceremonyConfig = await getCeremonyConfig(ceremonyUpper)

  const invitations = await prisma.invitation.findMany({
    where: { ceremony: ceremonyUpper },
    include: { guest: true, menuItem: true, menu: true, entreeOption: true, platOption: true, dessertOption: true },
    orderBy: [{ guest: { lastName: 'asc' } }],
  })

  const rows = invitations.map((inv) => {
    const menu =
      ceremonyUpper === 'SOIREE'
        ? inv.menu
          ? `${inv.menu.name}${
              [inv.entreeOption?.name, inv.platOption?.name, inv.dessertOption?.name].filter(Boolean).length > 0
                ? ' — ' + [inv.entreeOption?.name, inv.platOption?.name, inv.dessertOption?.name].filter(Boolean).join(' / ')
                : ''
            }`
          : ''
        : inv.menuItem?.name || ''

    return {
      nom: inv.guest.lastName,
      prenom: inv.guest.firstName,
      email: inv.guest.email || '',
      telephone: inv.guest.phone || '',
      ceremonie: ceremonyConfig?.name || ceremonyUpper,
      menu,
      notes: inv.notes || '',
      date_reponse: inv.respondedAt ? inv.respondedAt.toLocaleDateString('fr-FR') : '',
      email_envoye: inv.emailSent ? 'Oui' : 'Non',
    }
  })

  const csv = generateCSV(rows)
  const filename = `invitations-${ceremonyUpper.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
