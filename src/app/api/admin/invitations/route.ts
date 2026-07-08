import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const ceremony = searchParams.get('ceremony') as 'CIVIL' | 'SOIREE' | null

  const invitations = await prisma.invitation.findMany({
    where: ceremony ? { ceremony } : undefined,
    include: { guest: true, menuItem: true, menu: true, entreeOption: true, platOption: true, dessertOption: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(invitations)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { guestId, ceremony } = body

  if (!guestId || !ceremony) {
    return NextResponse.json({ error: 'Invité et cérémonie requis' }, { status: 400 })
  }

  // Check if invitation already exists for this guest+ceremony
  const existing = await prisma.invitation.findFirst({
    where: { guestId, ceremony },
  })
  if (existing) {
    return NextResponse.json({ error: 'Invitation déjà existante pour cette cérémonie' }, { status: 409 })
  }

  const invitation = await prisma.invitation.create({
    data: { guestId, ceremony },
    include: { guest: true },
  })
  return NextResponse.json(invitation, { status: 201 })
}
