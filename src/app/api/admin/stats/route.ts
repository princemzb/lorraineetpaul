import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const [civilTotal, civilConfirmed, civilDeclined, soireeTotal, soireeConfirmed, soireeDeclined, totalGuests] =
    await Promise.all([
      prisma.invitation.count({ where: { ceremony: 'CIVIL' } }),
      prisma.invitation.count({ where: { ceremony: 'CIVIL', status: 'CONFIRMED' } }),
      prisma.invitation.count({ where: { ceremony: 'CIVIL', status: 'DECLINED' } }),
      prisma.invitation.count({ where: { ceremony: 'SOIREE' } }),
      prisma.invitation.count({ where: { ceremony: 'SOIREE', status: 'CONFIRMED' } }),
      prisma.invitation.count({ where: { ceremony: 'SOIREE', status: 'DECLINED' } }),
      prisma.guest.count(),
    ])

  return NextResponse.json({
    civil: {
      total: civilTotal,
      confirmed: civilConfirmed,
      declined: civilDeclined,
      pending: civilTotal - civilConfirmed - civilDeclined,
    },
    soiree: {
      total: soireeTotal,
      confirmed: soireeConfirmed,
      declined: soireeDeclined,
      pending: soireeTotal - soireeConfirmed - soireeDeclined,
    },
    totalGuests,
  })
}
