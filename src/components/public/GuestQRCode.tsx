'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { GoldButton, OutlineButton } from '@/components/public/Buttons'

export default function GuestQRCode({
  guestId,
  guestName,
  light,
}: {
  guestId: string
  guestName: string
  light?: boolean
}) {
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    QRCode.toDataURL(guestId, {
      width: 320,
      margin: 2,
      color: { dark: '#050505ff', light: '#f6f2e9ff' },
    })
      .then(setDataUrl)
      .catch(() => {})
  }, [guestId])

  const fileName = `qrcode-${guestName.trim().toLowerCase().replace(/\s+/g, '-') || 'invite'}.png`

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = fileName
    a.click()
  }

  const handleShare = async () => {
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], fileName, { type: 'image/png' })
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
      if (nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
        await nav.share({
          files: [file],
          title: 'Mon QR code — Mariage Lorraine & Paul',
          text: 'Voici mon QR code à présenter le jour du mariage.',
        })
        return
      }
    } catch {
      // partage annulé ou non supporté, on retombe sur le téléchargement
    }
    handleDownload()
  }

  if (!dataUrl) return null

  return (
    <div className="text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt="Votre QR code"
        className="mx-auto rounded-xl border"
        style={{ borderColor: light ? '#e8d5b7' : 'var(--noir-border)', width: 200, height: 200 }}
      />
      <p className="text-sm mt-3 mb-5" style={{ color: light ? '#6b6b6b' : 'var(--ivoire-dim)' }}>
        Présentez ce QR code le jour J pour être identifié(e) rapidement à votre arrivée.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <GoldButton onClick={handleDownload} className="px-6 py-2.5 text-sm">
          Télécharger
        </GoldButton>
        <OutlineButton onClick={handleShare} className="px-6 py-2.5 text-sm" style={light ? { borderColor: '#8b7355', color: '#8b7355' } : undefined}>
          Partager
        </OutlineButton>
      </div>
    </div>
  )
}
