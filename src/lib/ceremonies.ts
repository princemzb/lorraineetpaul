import { prisma } from '@/lib/db'
import type { Ceremony } from '@prisma/client'

export async function getCeremonyConfigs() {
  return prisma.ceremonyConfig.findMany({ orderBy: { order: 'asc' } })
}

export async function getCeremonyConfig(ceremony: Ceremony) {
  return prisma.ceremonyConfig.findUnique({ where: { ceremony } })
}
