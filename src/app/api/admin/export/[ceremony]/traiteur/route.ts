import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { getCeremonyConfig } from '@/lib/ceremonies'

const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF3E3' } }
const PAUL_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8E6C9' } }
const LORRAINE_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } }

export async function GET(req: Request, { params }: { params: Promise<{ ceremony: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { ceremony } = await params
  const ceremonyUpper = ceremony.toUpperCase() as 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE'
  const ceremonyConfig = await getCeremonyConfig(ceremonyUpper)

  const invitations = await prisma.invitation.findMany({
    where: { ceremony: ceremonyUpper },
    include: { menu: true, entreeOption: true, platOption: true, dessertOption: true },
  })

  const totalGuests = invitations.length
  const paulCount = invitations.filter((i) => i.menu?.name.toLowerCase().includes('paul')).length
  const lorraineCount = invitations.filter((i) => i.menu?.name.toLowerCase().includes('lorraine')).length

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Traiteur')
  sheet.columns = [
    { header: '', key: 'label', width: 40 },
    { header: '', key: 'count', width: 12 },
  ]

  const title = sheet.addRow({ label: `Récapitulatif traiteur — ${ceremonyConfig?.name || ceremonyUpper}` })
  title.getCell('label').font = { bold: true, size: 14 }
  sheet.addRow({})

  // Totaux
  const totalRow = sheet.addRow({ label: 'Total invités', count: totalGuests })
  totalRow.getCell('label').font = { bold: true }
  totalRow.getCell('count').font = { bold: true }

  const lorraineRow = sheet.addRow({ label: 'Menus Lorraine', count: lorraineCount })
  lorraineRow.getCell('label').font = { bold: true }
  lorraineRow.getCell('label').fill = LORRAINE_FILL
  lorraineRow.getCell('count').font = { bold: true }

  const paulRow = sheet.addRow({ label: 'Menus Paul', count: paulCount })
  paulRow.getCell('label').font = { bold: true }
  paulRow.getCell('label').fill = PAUL_FILL
  paulRow.getCell('count').font = { bold: true }

  // Décompte par plat (entrées / plats / desserts)
  const courseGroups: Array<{ label: string; pick: (i: (typeof invitations)[number]) => string | undefined }> = [
    { label: 'Entrées', pick: (i) => i.entreeOption?.name },
    { label: 'Plats', pick: (i) => i.platOption?.name },
    { label: 'Desserts', pick: (i) => i.dessertOption?.name },
  ]

  for (const group of courseGroups) {
    const counts = new Map<string, number>()
    for (const inv of invitations) {
      const value = group.pick(inv)
      if (value) counts.set(value, (counts.get(value) || 0) + 1)
    }
    if (counts.size === 0) continue

    sheet.addRow({})
    const header = sheet.addRow({ label: group.label, count: 'Nombre' })
    header.getCell('label').font = { bold: true }
    header.getCell('label').fill = HEADER_FILL
    header.getCell('count').font = { bold: true }
    header.getCell('count').fill = HEADER_FILL

    for (const [name, count] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
      sheet.addRow({ label: name, count })
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const filename = `traiteur-${ceremonyUpper.toLowerCase()}-${new Date().toISOString().split('T')[0]}.xlsx`

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
