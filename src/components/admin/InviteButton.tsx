'use client'

export default function InviteButton({ fullWidth }: { fullWidth?: boolean }) {
  const handleInvite = () => {
    const url = `${window.location.origin}/rsvp`
    const message = `Vous êtes invité(e) à notre mariage ! Découvrez votre invitation et confirmez votre présence : ${url}`
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  return (
    <button
      onClick={handleInvite}
      className={`px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2 hover:opacity-90 ${
        fullWidth ? 'w-full justify-center' : ''
      }`}
      style={{ background: '#25D366' }}
      title="Partager le lien d'invitation via WhatsApp"
    >
      💬 Inviter
    </button>
  )
}
