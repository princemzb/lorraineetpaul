import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const guests = await prisma.guest.findMany({
    where: { songTitle: { not: null } },
    select: { firstName: true, lastName: true, songTitle: true, songArtist: true, songYoutubeUrl: true },
    orderBy: { lastName: 'asc' },
  })

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Playlist')

  sheet.columns = [
    { header: 'Titre', key: 'titre', width: 32 },
    { header: 'Artiste', key: 'artiste', width: 26 },
    { header: 'Lien YouTube', key: 'lien', width: 45 },
    { header: 'Proposée par', key: 'invite', width: 24 },
  ]

  sheet.getRow(1).font = { bold: true }
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF3E3' } }

  for (const g of guests) {
    const row = sheet.addRow({
      titre: g.songTitle,
      artiste: g.songArtist || '',
      lien: g.songYoutubeUrl || '',
      invite: `${g.firstName} ${g.lastName}`,
    })
    if (g.songYoutubeUrl) {
      row.getCell('lien').value = { text: g.songYoutubeUrl, hyperlink: g.songYoutubeUrl }
      row.getCell('lien').font = { color: { argb: 'FF1155CC' }, underline: true }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const filename = `playlist-dj-${new Date().toISOString().split('T')[0]}.xlsx`

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
