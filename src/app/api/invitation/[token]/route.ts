import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      guest: true,
      menuItem: true,
      menu: true,
      entreeOption: true,
      platOption: true,
      dessertOption: true,
    },
  })

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation introuvable' }, { status: 404 })
  }

  if (invitation.ceremony === 'SOIREE') {
    const menus = await prisma.menu.findMany({
      where: { ceremony: 'SOIREE' },
      orderBy: { order: 'asc' },
      include: { options: { orderBy: [{ course: 'asc' }, { order: 'asc' }] } },
    })
    return NextResponse.json({ invitation, menus })
  }

  const menuItems = await prisma.menuItem.findMany({
    where: { ceremony: invitation.ceremony },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ invitation, menuItems })
}
