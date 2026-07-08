import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getCeremonyConfigs } from '@/lib/ceremonies'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const ceremonies = await getCeremonyConfigs()
  return NextResponse.json(ceremonies)
}
