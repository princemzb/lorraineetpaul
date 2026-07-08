import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendContactNotificationEmail } from '@/lib/email'

const EVENT_TYPE_LABELS: Record<string, string> = {
  mariage: 'Mariage',
  fiancailles: 'Fiançailles',
  anniversaire: 'Anniversaire',
  'evenement-prive': 'Événement privé',
  autre: 'Autre projet',
}

export async function POST(req: Request) {
  const body = await req.json()
  const { firstName, lastName, email, phone, eventType, guestCount, eventDate, message, consent } = body

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !eventType?.trim() || !message?.trim() || !consent) {
    return NextResponse.json({ error: 'Merci de remplir tous les champs obligatoires.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 })
  }

  const data = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    phone: phone?.trim() || null,
    eventType: eventType.trim(),
    guestCount: guestCount?.trim() || null,
    eventDate: eventDate ? new Date(eventDate) : null,
    message: message.trim(),
    consent: !!consent,
  }

  await prisma.contactMessage.create({ data })

  try {
    await sendContactNotificationEmail({
      ...data,
      eventTypeLabel: EVENT_TYPE_LABELS[data.eventType] || data.eventType,
    })
  } catch (e) {
    console.error('Contact email send error:', e)
  }

  return NextResponse.json({ success: true })
}
