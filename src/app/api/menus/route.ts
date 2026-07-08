import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ceremony = searchParams.get('ceremony') as 'CIVIL' | 'SOIREE' | null

  const menus = await prisma.menuItem.findMany({
    where: ceremony ? { ceremony } : undefined,
    orderBy: [{ ceremony: 'asc' }, { order: 'asc' }],
    select: { id: true, name: true, description: true, ceremony: true },
  })
  return NextResponse.json(menus)
}
