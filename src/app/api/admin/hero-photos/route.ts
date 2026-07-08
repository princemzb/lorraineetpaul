import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const MAX_PHOTOS = 7
// Vercel plafonne le corps des requêtes des Serverless Functions à 4.5 Mo
// (non configurable) : on reste en dessous avec une marge de sécurité.
const MAX_SIZE = 4 * 1024 * 1024 // 4MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const count = await prisma.heroPhoto.count()
  if (count >= MAX_PHOTOS) {
    return NextResponse.json({ error: `Maximum ${MAX_PHOTOS} photos` }, { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get('photo')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Format non supporté (JPEG, PNG ou WebP)' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image trop volumineuse (4 Mo max)' }, { status: 400 })
  }

  const data = Buffer.from(await file.arrayBuffer())
  const maxOrder = await prisma.heroPhoto.aggregate({ _max: { order: true } })

  const photo = await prisma.heroPhoto.create({
    data: {
      data,
      mimeType: file.type,
      order: (maxOrder._max.order ?? 0) + 1,
    },
    select: { id: true, order: true },
  })

  return NextResponse.json(photo, { status: 201 })
}
