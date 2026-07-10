import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendConfirmationEmail } from '@/lib/email'

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const body = await req.json()
  const { menuItemId, menuId, entreeOptionId, platOptionId, dessertOptionId, notes } = body

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { guest: true, menuItem: true },
  })

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation introuvable' }, { status: 404 })
  }

  const isSoiree = invitation.ceremony === 'SOIREE'

  const updated = await prisma.invitation.update({
    where: { token },
    data: isSoiree
      ? {
          status: 'CONFIRMED',
          menuId: menuId || null,
          entreeOptionId: entreeOptionId || null,
          platOptionId: platOptionId || null,
          dessertOptionId: dessertOptionId || null,
          notes: notes || null,
          respondedAt: new Date(),
        }
      : {
          status: 'CONFIRMED',
          menuItemId: menuItemId || null,
          notes: notes || null,
          respondedAt: new Date(),
        },
    include: {
      guest: true,
      menuItem: true,
      menu: true,
      entreeOption: true,
      platOption: true,
      dessertOption: true,
    },
  })

  const menuName = isSoiree
    ? formatComposedMenu(updated.menu?.name, updated.entreeOption?.name, updated.platOption?.name, updated.dessertOption?.name)
    : updated.menuItem?.name

  // Send confirmation email if guest has an email
  if (invitation.guest.email) {
    try {
      const appUrl = process.env.APP_URL || 'http://localhost:3000'
      await sendConfirmationEmail({
        to: invitation.guest.email,
        guestName: `${invitation.guest.firstName} ${invitation.guest.lastName}`,
        ceremony: invitation.ceremony,
        menuName,
        invitationUrl: `${appUrl}/invitation/${token}`,
      })
    } catch (e) {
      console.error('Failed to send confirmation email:', e)
    }
  }

  return NextResponse.json({ invitation: updated })
}

function formatComposedMenu(menuName?: string, entree?: string, plat?: string, dessert?: string) {
  if (!menuName) return undefined
  const courses = [entree && `Entrée : ${entree}`, plat && `Plat : ${plat}`, dessert && `Dessert : ${dessert}`]
    .filter(Boolean)
    .join(' / ')
  return courses ? `${menuName} — ${courses}` : menuName
}
