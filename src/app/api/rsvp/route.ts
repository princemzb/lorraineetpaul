import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendConfirmationEmail } from '@/lib/email'
import { getCeremonyConfigs } from '@/lib/ceremonies'
import { formatDateRange } from '@/lib/format'

export async function POST(req: Request) {
  const body = await req.json()
  const { firstName, lastName, email, phone, ceremonies, notes, songTitle, songArtist, songYoutubeUrl } = body

  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: 'Prénom, nom et email sont requis' }, { status: 400 })
  }

  if (!ceremonies || ceremonies.length === 0) {
    return NextResponse.json({ error: 'Sélectionnez au moins une cérémonie' }, { status: 400 })
  }

  const songData = {
    songTitle: songTitle || null,
    songArtist: songArtist || null,
    songYoutubeUrl: songYoutubeUrl || null,
  }

  // Find or create guest by email
  let guest = await prisma.guest.findFirst({ where: { email } })
  if (guest) {
    guest = await prisma.guest.update({
      where: { id: guest.id },
      data: { firstName, lastName, phone: phone || null, ...songData },
    })
  } else {
    guest = await prisma.guest.create({
      data: { firstName, lastName, email, phone: phone || null, ...songData },
    })
  }

  const createdInvitations = []

  for (const c of ceremonies) {
    const { ceremony, menuId, entreeOptionId, platOptionId, dessertOptionId } = c
    const isSoiree = ceremony === 'SOIREE'

    const existing = await prisma.invitation.findFirst({
      where: { guestId: guest.id, ceremony },
    })

    const data = isSoiree
      ? {
          menuId: menuId || null,
          entreeOptionId: entreeOptionId || null,
          platOptionId: platOptionId || null,
          dessertOptionId: dessertOptionId || null,
        }
      : {}

    let invitation
    if (existing) {
      invitation = await prisma.invitation.update({
        where: { id: existing.id },
        data: {
          status: 'CONFIRMED',
          ...data,
          notes: notes || null,
          respondedAt: new Date(),
        },
        include: { menu: true, entreeOption: true, platOption: true, dessertOption: true },
      })
    } else {
      invitation = await prisma.invitation.create({
        data: {
          guestId: guest.id,
          ceremony,
          status: 'CONFIRMED',
          ...data,
          notes: notes || null,
          respondedAt: new Date(),
        },
        include: { menu: true, entreeOption: true, platOption: true, dessertOption: true },
      })
    }
    createdInvitations.push(invitation)
  }

  // Send confirmation email
  try {
    const appUrl = process.env.APP_URL || 'http://localhost:3000'
    const ceremonyConfigs = await getCeremonyConfigs()
    const configByCeremony = new Map(ceremonyConfigs.map((c) => [c.ceremony, c]))
    await sendRsvpConfirmationEmail({
      to: email,
      guestName: `${firstName} ${lastName}`,
      dateRangeLabel: formatDateRange(ceremonyConfigs.map((c) => c.date).filter((d): d is Date => !!d)),
      ceremonies: createdInvitations.map((inv) => ({
        label: `${configByCeremony.get(inv.ceremony)?.emoji || ''} ${configByCeremony.get(inv.ceremony)?.name || inv.ceremony}`.trim(),
        menuName:
          inv.ceremony === 'SOIREE'
            ? formatComposedMenu(inv.menu?.name, inv.entreeOption?.name, inv.platOption?.name, inv.dessertOption?.name)
            : undefined,
      })),
      notes,
      appUrl,
    })
    await prisma.invitation.updateMany({
      where: { id: { in: createdInvitations.map((i) => i.id) } },
      data: { emailSent: true },
    })
  } catch (e) {
    console.error('Email send error:', e)
  }

  return NextResponse.json({ success: true, guestId: guest.id })
}

async function sendRsvpConfirmationEmail({
  to,
  guestName,
  ceremonies,
  dateRangeLabel,
  notes,
  appUrl,
}: {
  to: string
  guestName: string
  ceremonies: Array<{ label: string; menuName?: string }>
  dateRangeLabel: string
  notes?: string
  appUrl: string
}) {
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })

  const ceremonyRows = ceremonies
    .map((c) => {
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0e6d3;">
            <strong style="color:#8b7355">${c.label}</strong><br/>
            ${c.menuName ? `<span style="color:#9a8a7a;font-size:14px">Menu : ${c.menuName}</span>` : ''}
          </td>
        </tr>`
    })
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>
body{font-family:Georgia,serif;color:#3a3a3a;background:#fdf9f4;margin:0;padding:0}
.wrap{max-width:600px;margin:40px auto;background:white;border:1px solid #e8d5b7;border-radius:8px;overflow:hidden}
.hd{background:linear-gradient(135deg,#8b7355,#c9a96e);color:white;padding:40px;text-align:center}
.hd h1{margin:0;font-size:28px;font-weight:normal;letter-spacing:2px}
.hd p{margin:8px 0 0;font-size:14px;opacity:.9}
.bd{padding:40px}
.bd p{line-height:1.8;font-size:16px}
.ft{background:#f9f4ec;padding:20px 40px;text-align:center;color:#9a8a7a;font-size:13px}
table{width:100%}
</style></head>
<body>
  <div class="wrap">
    <div class="hd">
      <h1>Lorraine &amp; Paul</h1>
      <p>${dateRangeLabel}</p>
    </div>
    <div class="bd">
      <p>Cher(e) <strong>${guestName}</strong>,</p>
      <p>Nous avons bien reçu votre confirmation de participation. Nous sommes ravis de vous compter parmi nous !</p>
      <table>${ceremonyRows}</table>
      ${notes ? `<p style="margin-top:20px;background:#fdf3e3;padding:12px 16px;border-radius:6px;font-size:14px;color:#8b7355"><strong>Vos notes :</strong> ${notes}</p>` : ''}
      <p style="margin-top:24px">Si vous souhaitez modifier votre réponse, n'hésitez pas à <a href="${appUrl}/rsvp" style="color:#8b7355">remplir à nouveau le formulaire</a>.</p>
      <p>Avec toute notre affection,<br><strong>Lorraine &amp; Paul</strong></p>
    </div>
    <div class="ft"><p>Mariage Lorraine &amp; Paul — ${dateRangeLabel}</p></div>
  </div>
</body>
</html>`

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'Lorraine & Paul <noreply@mariage.fr>',
    to,
    subject: 'Confirmation de votre présence — Mariage Lorraine & Paul',
    html,
  })
}

function formatComposedMenu(menuName?: string, entree?: string, plat?: string, dessert?: string) {
  if (!menuName) return undefined
  const courses = [entree && `Entrée : ${entree}`, plat && `Plat : ${plat}`, dessert && `Dessert : ${dessert}`]
    .filter(Boolean)
    .join(' / ')
  return courses ? `${menuName} — ${courses}` : menuName
}
