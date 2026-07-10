'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import jsQR from 'jsqr'

type Invitation = {
  ceremony: string
  ceremonyName: string
  ceremonyEmoji: string
  notes: string | null
  menu: string | null
}

type GuestResult = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  checkedInAt: string | null
  table: string | null
  adminNote: string | null
  alreadyCheckedIn?: boolean
  invitations: Invitation[]
}

export default function CheckinPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const busyRef = useRef(false)

  const [cameraError, setCameraError] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<GuestResult | null>(null)
  const [lookupError, setLookupError] = useState('')
  const [manualId, setManualId] = useState('')

  const lookupGuest = useCallback(async (guestId: string) => {
    if (busyRef.current) return
    busyRef.current = true
    setLookupError('')
    try {
      const res = await fetch(`/api/admin/guests/${guestId}/checkin`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        const d = await res.json()
        setLookupError(d.error || 'Invité introuvable')
      }
    } catch {
      setLookupError('Erreur réseau')
    } finally {
      busyRef.current = false
    }
  }, [])

  const tick = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code?.data && !busyRef.current && !result) {
          lookupGuest(code.data.trim())
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [lookupGuest, result])

  const startCamera = useCallback(async () => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      rafRef.current = requestAnimationFrame(tick)
    } catch {
      setCameraError("Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur.")
    }
  }, [tick])

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setScanning(false)
  }, [])

  useEffect(() => {
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scanNext = () => {
    setResult(null)
    setLookupError('')
  }

  if (result || lookupError) {
    // pause the scan loop while showing a result
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-medium" style={{ color: '#8b7355', fontFamily: 'Georgia, serif' }}>
          📷 Check-in invités
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Scannez le QR code présenté par l&apos;invité pour l&apos;identifier et enregistrer son arrivée.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Camera */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#f0e6d3' }}>
          <div className="relative bg-black aspect-square">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={startCamera}
                  className="px-5 py-3 rounded-lg text-white text-sm font-medium"
                  style={{ background: '#8b7355' }}
                >
                  🎥 Activer la caméra
                </button>
              </div>
            )}
          </div>
          {cameraError && <div className="p-3 text-sm text-red-600">{cameraError}</div>}
          <div className="p-4 flex items-center gap-2">
            <input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Ou collez l'identifiant invité manuellement"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: '#e8d5b7' }}
            />
            <button
              onClick={() => manualId.trim() && lookupGuest(manualId.trim())}
              className="px-3 py-2 rounded-lg text-white text-sm"
              style={{ background: '#8b7355' }}
            >
              Rechercher
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: '#f0e6d3' }}>
          {!result && !lookupError && (
            <p className="text-gray-400 text-sm">En attente d&apos;un scan...</p>
          )}

          {lookupError && (
            <div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
                {lookupError}
              </div>
              <button onClick={scanNext} className="px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#8b7355' }}>
                Réessayer
              </button>
            </div>
          )}

          {result && (
            <div>
              <div
                className="mb-4 p-3 rounded-lg text-sm font-medium"
                style={{
                  background: result.alreadyCheckedIn ? '#fef9f0' : '#f0fdf4',
                  color: result.alreadyCheckedIn ? '#d97706' : '#16a34a',
                }}
              >
                {result.alreadyCheckedIn ? '⚠️ Déjà enregistré(e) précédemment' : '✓ Arrivée enregistrée'}
                {result.checkedInAt && (
                  <span className="block text-xs mt-1 opacity-75">
                    {new Date(result.checkedInAt).toLocaleString('fr-FR')}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-semibold mb-1" style={{ color: '#8b7355' }}>
                {result.firstName} {result.lastName}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {result.email}
                {result.email && result.phone && ' · '}
                {result.phone}
              </p>

              {(result.table || result.adminNote) && (
                <div className="mb-4 space-y-2">
                  {result.table && (
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-base font-semibold"
                      style={{ background: '#fdf3e3', color: '#8b7355' }}
                    >
                      🪑 {result.table}
                    </div>
                  )}
                  {result.adminNote && (
                    <div className="p-3 rounded-lg text-sm" style={{ background: '#fef9f0', color: '#92400e' }}>
                      📌 {result.adminNote}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {result.invitations.length === 0 && (
                  <p className="text-sm text-gray-400">Aucune invitation enregistrée.</p>
                )}
                {result.invitations.map((inv) => (
                  <div key={inv.ceremony} className="p-3 rounded-lg border" style={{ borderColor: '#f0e6d3' }}>
                    <span className="font-medium text-sm">
                      {inv.ceremonyEmoji} {inv.ceremonyName}
                    </span>
                    {inv.menu && <p className="text-xs text-gray-500 mt-1">Menu : {inv.menu}</p>}
                    {inv.notes && (
                      <p className="text-xs mt-1" style={{ color: '#dc2626' }}>
                        ⚠️ {inv.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={scanNext}
                className="w-full mt-5 px-4 py-3 rounded-lg text-white text-sm font-medium"
                style={{ background: '#8b7355' }}
              >
                Scanner l&apos;invité suivant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
