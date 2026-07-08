import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const menus = await prisma.menu.findMany({
    where: { ceremony: 'SOIREE' },
    orderBy: { order: 'asc' },
    include: {
      options: {
        orderBy: [{ course: 'asc' }, { order: 'asc' }],
      },
    },
  })
  return NextResponse.json(menus)
}
