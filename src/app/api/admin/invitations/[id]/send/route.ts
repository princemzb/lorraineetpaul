import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { sendInvitationEmail } from '@/lib/email'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: { guest: true },
  })

  if (!invitation) return NextResponse.json({ error: 'Invitation introuvable' }, { status: 404 })
  if (!invitation.guest.email) return NextResponse.json({ error: 'Invité sans email' }, { status: 400 })

  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  await sendInvitationEmail({
    to: invitation.guest.email,
    guestName: `${invitation.guest.firstName} ${invitation.guest.lastName}`,
    ceremony: invitation.ceremony,
    invitationUrl: `${appUrl}/invitation/${invitation.token}`,
  })

  await prisma.invitation.update({
    where: { id },
    data: { emailSent: true },
  })

  return NextResponse.json({ success: true })
}
