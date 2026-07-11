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
    include: { guest: true, menu: true, entreeOption: true, platOption: true, dessertOption: true },
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
        : ''

    return {
      nom: inv.guest.lastName,
      prenom: inv.guest.firstName,
      email: inv.guest.email || '',
      telephone: inv.guest.phone || '',
      ceremonie: ceremonyConfig?.name || ceremonyUpper,
      menu,
      menuName: inv.menu?.name || '',
      entree: inv.entreeOption?.name || '',
      plat: inv.platOption?.name || '',
      dessert: inv.dessertOption?.name || '',
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

  const columnCount = sheet.columns.length

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
      for (let c = 1; c <= columnCount; c++) {
        excelRow.getCell(c).fill = fill
      }
    }
  }

  // Récapitulatif : total invités + décompte des menus
  const totalGuests = rows.length
  const paulCount = rows.filter((r) => r.menu.toLowerCase().includes('paul')).length
  const lorraineCount = rows.filter((r) => r.menu.toLowerCase().includes('lorraine')).length

  sheet.addRow({})

  const totalRow = sheet.addRow({ nom: 'Total invités', prenom: totalGuests })
  totalRow.getCell('nom').font = { bold: true }
  totalRow.getCell('prenom').font = { bold: true }

  const lorraineRow = sheet.addRow({ nom: 'Menus Lorraine', prenom: lorraineCount })
  lorraineRow.getCell('nom').font = { bold: true }
  lorraineRow.getCell('nom').fill = LORRAINE_FILL
  lorraineRow.getCell('prenom').font = { bold: true }

  const paulRow = sheet.addRow({ nom: 'Menus Paul', prenom: paulCount })
  paulRow.getCell('nom').font = { bold: true }
  paulRow.getCell('nom').fill = PAUL_FILL
  paulRow.getCell('prenom').font = { bold: true }

  // Récapitulatif traiteur : décompte de chaque entrée / plat / dessert
  const courseGroups: Array<{ label: string; field: 'entree' | 'plat' | 'dessert' }> = [
    { label: 'Entrées', field: 'entree' },
    { label: 'Plats', field: 'plat' },
    { label: 'Desserts', field: 'dessert' },
  ]

  const hasCourseData = rows.some((r) => r.entree || r.plat || r.dessert)

  if (hasCourseData) {
    sheet.addRow({})
    const cateringTitle = sheet.addRow({ nom: 'RÉCAPITULATIF TRAITEUR' })
    cateringTitle.getCell('nom').font = { bold: true, size: 13 }

    for (const group of courseGroups) {
      const counts = new Map<string, number>()
      for (const r of rows) {
        const value = r[group.field]
        if (value) counts.set(value, (counts.get(value) || 0) + 1)
      }
      if (counts.size === 0) continue

      const header = sheet.addRow({ nom: group.label, prenom: 'Nombre' })
      header.getCell('nom').font = { bold: true }
      header.getCell('nom').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF3E3' } }
      header.getCell('prenom').font = { bold: true }
      header.getCell('prenom').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF3E3' } }

      for (const [name, count] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
        sheet.addRow({ nom: name, prenom: count })
      }
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
