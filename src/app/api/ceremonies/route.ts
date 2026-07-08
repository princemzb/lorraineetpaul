import { NextResponse } from 'next/server'
import { getCeremonyConfigs } from '@/lib/ceremonies'

export async function GET() {
  const ceremonies = await getCeremonyConfigs()
  return NextResponse.json(ceremonies)
}
