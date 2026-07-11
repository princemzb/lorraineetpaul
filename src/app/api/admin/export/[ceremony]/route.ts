import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { getCeremonyConfig } from '@/lib/ceremonies'

const PAUL_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8E6C9' } }
const LORRAINE_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } }

function menuFillFor(menu: string): ExcelJS.Fill | undefined {
  const lower = menu.toLowerCase()
  if (lower.includes('paul')) return PAUL_FILL
  if (lower.includes('lorraine')) return LORRAINE_FILL
  return undefined
}

export async function GET(req: Request, { params }: { params: Promise<{ ceremony: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { ceremony } = await params
  const ceremonyUpper = ceremony.toUpperCase() as 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE'
  const ceremonyConfig = await getCeremonyConfig(ceremonyUpper)

  const { searchParams } = new URL(req.url)
  const sortBy = searchParams.get('sort') as 'name' | 'menu' | 'respondedAt' | null
  const sortDir = searchParams.get('dir') === 'desc' ? 'desc' : 'asc'

  const invitations = await prisma.invitation.findMany({
    where: { ceremony: ceremonyUpper },
    include: { guest: true, menuItem: true, menu: true, entreeOption: true, platOption: true, dessertOption: true },
  })

  const rows = invitations.map((inv) => {
    const menu =
      ceremonyUpper === 'SOIREE'
        ? inv.menu
          ? `${inv.menu.name}${
              [inv.entreeOption?.name, inv.platOption?.name, inv.dessertOption?.name].filter(Boolean).length > 0
                ? ' — ' + [inv.entreeOption?.name, inv.platOption?.name, inv.dessertOption?.name].filter(Boolean).join(' / ')
                : ''
            }`
          : ''
        : inv.menuItem?.name || ''

    return {
      nom: inv.guest.lastName,
      prenom: inv.guest.firstName,
      email: inv.guest.email || '',
      telephone: inv.guest.phone || '',
      ceremonie: ceremonyConfig?.name || ceremonyUpper,
      menu,
      notes: inv.notes || '',
      respondedAt: inv.respondedAt,
      date_reponse: inv.respondedAt ? inv.respondedAt.toLocaleDateString('fr-FR') : '',
    }
  })

  if (sortBy) {
    rows.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'name') {
        cmp = `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)
      } else if (sortBy === 'menu') {
        cmp = a.menu.localeCompare(b.menu)
      } else if (sortBy === 'respondedAt') {
        const aTime = a.respondedAt ? a.respondedAt.getTime() : 0
        const bTime = b.respondedAt ? b.respondedAt.getTime() : 0
        cmp = aTime - bTime
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  } else {
    rows.sort((a, b) => a.nom.localeCompare(b.nom))
  }

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Invitations')

  sheet.columns = [
    { header: 'Nom', key: 'nom', width: 18 },
    { header: 'Prénom', key: 'prenom', width: 18 },
    { header: 'Email', key: 'email', width: 26 },
    { header: 'Téléphone', key: 'telephone', width: 16 },
    { header: 'Cérémonie', key: 'ceremonie', width: 18 },
    { header: 'Menu', key: 'menu', width: 40 },
    { header: 'Notes', key: 'notes', width: 24 },
    { header: 'Date de réponse', key: 'date_reponse', width: 16 },
  ]

  sheet.getRow(1).font = { bold: true }
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF3E3' } }

  for (const row of rows) {
    const excelRow = sheet.addRow({
      nom: row.nom,
      prenom: row.prenom,
      email: row.email,
      telephone: row.telephone,
      ceremonie: row.ceremonie,
      menu: row.menu,
      notes: row.notes,
      date_reponse: row.date_reponse,
    })
    const fill = menuFillFor(row.menu)
    if (fill) {
      excelRow.getCell('menu').fill = fill
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const filename = `invitations-${ceremonyUpper.toLowerCase()}-${new Date().toISOString().split('T')[0]}.xlsx`

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
