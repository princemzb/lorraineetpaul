import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const photo = await prisma.heroPhoto.findUnique({ where: { id } })

  if (!photo) {
    return NextResponse.json({ error: 'Photo introuvable' }, { status: 404 })
  }

  return new NextResponse(new Uint8Array(photo.data), {
    headers: {
      'Content-Type': photo.mimeType,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
