import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Prémices et Associés Services - Division Wedding',
  description:
    "Contactez la division Wedding de Prémices et Associés Services pour créer une solution de gestion d'invités personnalisée pour votre mariage ou événement.",
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
