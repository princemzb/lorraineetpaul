import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const ceremony = searchParams.get('ceremony') as 'CIVIL' | 'SOIREE' | null

  const menus = await prisma.menuItem.findMany({
    where: ceremony ? { ceremony } : undefined,
    orderBy: [{ ceremony: 'asc' }, { order: 'asc' }],
  })
  return NextResponse.json(menus)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { name, description, ceremony, order } = body

  if (!name || !ceremony) {
    return NextResponse.json({ error: 'Nom et cérémonie requis' }, { status: 400 })
  }

  const menu = await prisma.menuItem.create({
    data: { name, description: description || null, ceremony, order: order || 0 },
  })
  return NextResponse.json(menu, { status: 201 })
}
