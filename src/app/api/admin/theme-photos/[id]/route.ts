import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { order, description } = body

  const data: { order?: number; description?: string | null } = {}
  if (typeof order === 'number') data.order = order
  if (typeof description === 'string') data.description = description.trim() || null

  const photo = await prisma.themePhoto.update({
    where: { id },
    data,
    select: { id: true, description: true, order: true },
  })

  return NextResponse.json(photo)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  await prisma.themePhoto.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
