import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const menus = await prisma.menu.findMany({
    where: { ceremony: 'SOIREE' },
    orderBy: { order: 'asc' },
    include: { options: { orderBy: [{ course: 'asc' }, { order: 'asc' }] } },
  })
  return NextResponse.json(menus)
}
