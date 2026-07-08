import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, description, order } = body

  if (!name) {
    return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
  }

  const option = await prisma.menuOption.update({
    where: { id },
    data: { name, description: description || null, order: order ?? 0 },
  })
  return NextResponse.json(option)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  await prisma.menuOption.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
