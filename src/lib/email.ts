import nodemailer from 'nodemailer'
import type { Ceremony } from '@prisma/client'
import { getCeremonyConfig } from '@/lib/ceremonies'
import { formatCeremonyDate } from '@/lib/format'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: process.env.SMTP_SECURE === 'true',
  auth:
    process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
})

async function getCeremonyDisplay(ceremony: Ceremony) {
  const config = await getCeremonyConfig(ceremony)
  return {
    label: config?.name || ceremony,
    dateLabel: config?.date ? formatCeremonyDate(config.date) : '',
  }
}

export async function sendConfirmationEmail({
  to,
  guestName,
  ceremony,
  menuName,
  invitationUrl,
}: {
  to: string
  guestName: string
  ceremony: 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE'
  menuName?: string
  invitationUrl: string
}) {
  const { label: ceremonyLabel, dateLabel: weddingDate } = await getCeremonyDisplay(ceremony)

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Georgia, serif; color: #3a3a3a; background: #fdf9f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border: 1px solid #e8d5b7; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #8b7355, #c9a96e); color: white; padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 2px; }
    .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
    .body { padding: 40px; }
    .body p { line-height: 1.8; font-size: 16px; }
    .highlight { background: #fdf3e3; border-left: 3px solid #c9a96e; padding: 16px 20px; margin: 20px 0; border-radius: 4px; }
    .btn { display: inline-block; background: #8b7355; color: white; text-decoration: none; padding: 12px 28px; border-radius: 4px; margin-top: 20px; font-size: 14px; letter-spacing: 1px; }
    .footer { background: #f9f4ec; padding: 20px 40px; text-align: center; color: #9a8a7a; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lorraine &amp; Paul</h1>
      <p>${weddingDate} — ${ceremonyLabel}</p>
    </div>
    <div class="body">
      <p>Cher(e) ${guestName},</p>
      <p>Nous avons bien reçu votre réponse. Vous avez <strong>confirmé votre présence</strong> pour notre <strong>${ceremonyLabel}</strong>.</p>
      ${menuName ? `<div class="highlight"><strong>Votre choix de menu :</strong> ${menuName}</div>` : ''}
      <p>Nous sommes ravis de vous compter parmi nos invités et avons hâte de partager ce moment inoubliable avec vous.</p>
      <p>Si vous souhaitez modifier votre réponse, vous pouvez accéder à votre invitation en cliquant sur le bouton ci-dessous :</p>
      <a href="${invitationUrl}" class="btn">Voir mon invitation</a>
    </div>
    <div class="footer">
      <p>Lorraine &amp; Paul — ${weddingDate}</p>
      <p>Ce message a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'Lorraine & Paul <noreply@mariage.fr>',
    to,
    subject: `Votre réponse pour le ${ceremonyLabel} de Lorraine & Paul`,
    html,
  })
}

export async function sendInvitationEmail({
  to,
  guestName,
  ceremony,
  invitationUrl,
}: {
  to: string
  guestName: string
  ceremony: 'CIVIL' | 'RELIGIEUX' | 'VIN_HONNEUR' | 'SOIREE'
  invitationUrl: string
}) {
  const { label: ceremonyLabel, dateLabel: weddingDate } = await getCeremonyDisplay(ceremony)

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Georgia, serif; color: #3a3a3a; background: #fdf9f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border: 1px solid #e8d5b7; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #8b7355, #c9a96e); color: white; padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 2px; }
    .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
    .body { padding: 40px; }
    .body p { line-height: 1.8; font-size: 16px; }
    .btn { display: inline-block; background: #8b7355; color: white; text-decoration: none; padding: 16px 32px; border-radius: 4px; margin-top: 24px; font-size: 16px; letter-spacing: 1px; }
    .footer { background: #f9f4ec; padding: 20px 40px; text-align: center; color: #9a8a7a; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lorraine &amp; Paul</h1>
      <p>${weddingDate} — ${ceremonyLabel}</p>
    </div>
    <div class="body">
      <p>Cher(e) ${guestName},</p>
      <p>Nous avons le plaisir de vous inviter à notre <strong>${ceremonyLabel}</strong> qui aura lieu le <strong>${weddingDate}</strong>.</p>
      <p>Merci de confirmer votre présence en cliquant sur le bouton ci-dessous :</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${invitationUrl}" class="btn">Répondre à l'invitation</a>
      </div>
      <p>Nous espérons vous compter parmi nous pour partager ce moment de bonheur.</p>
      <p>Avec toute notre affection,<br><strong>Lorraine &amp; Paul</strong></p>
    </div>
    <div class="footer">
      <p>${weddingDate}</p>
      <p>Ce message a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'Lorraine & Paul <noreply@mariage.fr>',
    to,
    subject: `Invitation — ${ceremonyLabel} de Lorraine & Paul`,
    html,
  })
}

export async function sendContactNotificationEmail({
  firstName,
  lastName,
  email,
  phone,
  eventTypeLabel,
  guestCount,
  eventDate,
  message,
}: {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  eventTypeLabel: string
  guestCount: string | null
  eventDate: Date | null
  message: string
}) {
  const to = process.env.CONTACT_EMAIL || 'mazabaprince@gmail.com'

  const rows = [
    ['Nom', `${firstName} ${lastName}`],
    ['Email', email],
    phone && ['Téléphone', phone],
    ['Type de projet', eventTypeLabel],
    guestCount && ["Nombre d'invités", guestCount],
    eventDate && ['Date prévue', eventDate.toLocaleDateString('fr-FR')],
  ].filter((row): row is [string, string] => Array.isArray(row))

  const rowsHtml = rows
    .map(([label, value]) => `<p><strong>${label} :</strong> ${value}</p>`)
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #2b2b2b; background: #f7efe7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border: 1px solid #eadfd3; border-radius: 12px; overflow: hidden; }
    .header { background: #8b5e3c; color: #fff; padding: 28px 32px; }
    .header h1 { margin: 0; font-size: 18px; font-weight: bold; }
    .body { padding: 32px; }
    .body p { line-height: 1.7; font-size: 15px; margin: 0 0 8px; }
    .message { background: #f7efe7; border-left: 3px solid #c9a227; padding: 16px 20px; margin: 16px 0; border-radius: 8px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Nouvelle demande — Prémices et Associés Services (Division Wedding)</h1></div>
    <div class="body">
      ${rowsHtml}
      <div class="message">${message}</div>
    </div>
  </div>
</body>
</html>`

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'Lorraine & Paul <noreply@mariage.fr>',
    to,
    replyTo: email,
    subject: `Nouvelle demande de ${firstName} ${lastName} — ${eventTypeLabel}`,
    html,
  })
}
