import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const guests = await prisma.guest.findMany({
    include: { invitations: { include: { menuItem: true } } },
    orderBy: { lastName: 'asc' },
  })
  return NextResponse.json(guests)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { firstName, lastName, email, phone } = body

  if (!firstName || !lastName) {
    return NextResponse.json({ error: 'Prénom et nom requis' }, { status: 400 })
  }

  const guest = await prisma.guest.create({
    data: { firstName, lastName, email: email || null, phone: phone || null },
  })
  return NextResponse.json(guest, { status: 201 })
}
