import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const { order } = await req.json()

  if (typeof order !== 'number') {
    return NextResponse.json({ error: 'Ordre invalide' }, { status: 400 })
  }

  const photo = await prisma.heroPhoto.update({
    where: { id },
    data: { order },
    select: { id: true, order: true },
  })

  return NextResponse.json(photo)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  await prisma.heroPhoto.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
