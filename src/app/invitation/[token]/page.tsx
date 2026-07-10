import type { Metadata } from 'next'
import InvitationClient from './InvitationClient'

export function generateMetadata(): Metadata {
  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  const imageUrl = `${appUrl}/invitation-envelope.png`

  return {
    title: 'Vous êtes invité(e) — Lorraine & Paul',
    description: 'Cliquez sur l\'enveloppe pour découvrir votre invitation et confirmer votre présence.',
    openGraph: {
      title: 'Vous êtes invité(e) au mariage de Lorraine & Paul',
      description: 'Cliquez sur l\'enveloppe pour découvrir votre invitation et confirmer votre présence.',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: 'Invitation Lorraine & Paul' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Vous êtes invité(e) au mariage de Lorraine & Paul',
      description: 'Cliquez sur l\'enveloppe pour découvrir votre invitation et confirmer votre présence.',
      images: [imageUrl],
    },
  }
}

export default function InvitationPage() {
  return <InvitationClient />
}
