import { stringify } from 'csv-stringify/sync'

type InvitationRow = {
  nom: string
  prenom: string
  email: string
  telephone: string
  ceremonie: string
  statut: string
  menu: string
  accompagnants: number
  notes: string
  date_reponse: string
  email_envoye: string
}

export function generateCSV(invitations: InvitationRow[]): string {
  return stringify(invitations, {
    header: true,
    columns: {
      nom: 'Nom',
      prenom: 'Prénom',
      email: 'Email',
      telephone: 'Téléphone',
      ceremonie: 'Cérémonie',
      statut: 'Statut',
      menu: 'Menu',
      accompagnants: 'Accompagnants',
      notes: 'Notes',
      date_reponse: 'Date de réponse',
      email_envoye: 'Email envoyé',
    },
    cast: {
      boolean: (v) => (v ? 'Oui' : 'Non'),
    },
  })
}
