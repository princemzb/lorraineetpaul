import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const guests = await prisma.guest.findMany({
    where: { songTitle: { not: null } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      songTitle: true,
      songArtist: true,
      songYoutubeUrl: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(guests)
}
