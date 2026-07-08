import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { firstName, lastName, email, phone } = body

  const guest = await prisma.guest.update({
    where: { id },
    data: { firstName, lastName, email: email || null, phone: phone || null },
  })
  return NextResponse.json(guest)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  await prisma.guest.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
