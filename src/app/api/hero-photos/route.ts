import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const photos = await prisma.heroPhoto.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, order: true },
  })
  return NextResponse.json(photos)
}
