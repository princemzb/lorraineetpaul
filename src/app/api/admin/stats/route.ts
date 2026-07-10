import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const [civilTotal, soireeTotal, totalGuests] = await Promise.all([
    prisma.invitation.count({ where: { ceremony: 'CIVIL' } }),
    prisma.invitation.count({ where: { ceremony: 'SOIREE' } }),
    prisma.guest.count(),
  ])

  return NextResponse.json({
    civil: { total: civilTotal },
    soiree: { total: soireeTotal },
    totalGuests,
  })
}
