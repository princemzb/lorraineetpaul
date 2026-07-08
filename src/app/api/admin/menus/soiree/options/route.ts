import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { menuId, course, name, description, order } = body

  if (!menuId || !course || !name) {
    return NextResponse.json({ error: 'Menu, service et nom requis' }, { status: 400 })
  }
  if (!['ENTREE', 'PLAT', 'DESSERT'].includes(course)) {
    return NextResponse.json({ error: 'Service invalide' }, { status: 400 })
  }

  const option = await prisma.menuOption.create({
    data: { menuId, course, name, description: description || null, order: order || 0 },
  })
  return NextResponse.json(option, { status: 201 })
}
