import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const VALID_CEREMONIES = ['CIVIL', 'RELIGIEUX', 'VIN_HONNEUR', 'SOIREE']

export async function PUT(req: Request, { params }: { params: Promise<{ ceremony: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { ceremony } = await params
  if (!VALID_CEREMONIES.includes(ceremony)) {
    return NextResponse.json({ error: 'Cérémonie invalide' }, { status: 400 })
  }

  const body = await req.json()
  const { name, emoji, description, address, date, order } = body

  if (!name || !emoji) {
    return NextResponse.json({ error: 'Nom et emoji requis' }, { status: 400 })
  }

  const config = await prisma.ceremonyConfig.upsert({
    where: { ceremony: ceremony as 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE' },
    update: {
      name,
      emoji,
      description: description || null,
      address: address || null,
      date: date ? new Date(date) : null,
      order: order ?? 0,
    },
    create: {
      ceremony: ceremony as 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE',
      name,
      emoji,
      description: description || null,
      address: address || null,
      date: date ? new Date(date) : null,
      order: order ?? 0,
    },
  })

  return NextResponse.json(config)
}
