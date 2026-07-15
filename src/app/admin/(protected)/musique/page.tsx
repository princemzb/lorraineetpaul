'use client'

import { useEffect, useState } from 'react'
import YouTubeIcon from '@/components/public/YouTubeIcon'

type SongGuest = {
  id: string
  firstName: string
  lastName: string
  songTitle: string
  songArtist: string | null
  songYoutubeUrl: string | null
  updatedAt: string
}

export default function MusiquePage() {
  const [songs, setSongs] = useState<SongGuest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/music')
      .then((r) => r.json())
      .then((data) => {
        setSongs(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium" style={{ color: '#8b7355', fontFamily: 'Georgia, serif' }}>
            🎵 Musique des invités
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {songs.length} chanson{songs.length > 1 ? 's' : ''} proposée{songs.length > 1 ? 's' : ''}
          </p>
        </div>
        <a
          href="/api/admin/export/music"
          className="px-4 py-2 rounded-lg border text-sm font-medium transition-all"
          style={{ borderColor: '#8b7355', color: '#8b7355' }}
        >
          📥 Export DJ
        </a>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#f0e6d3' }}>
        {songs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">🎶</div>
            <p>Aucune chanson proposée pour l&apos;instant</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr style={{ background: '#fdf3e3', borderBottom: '2px solid #f0e6d3' }}>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Invité</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Titre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Artiste</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Lien</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < songs.length - 1 ? '1px solid #f0e6d3' : 'none' }}>
                  <td className="px-4 py-3 font-medium text-gray-800">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3 text-gray-800">{s.songTitle}</td>
                  <td className="px-4 py-3 text-gray-600">{s.songArtist || '—'}</td>
                  <td className="px-4 py-3">
                    {s.songYoutubeUrl ? (
                      <a
                        href={s.songYoutubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:opacity-80"
                        style={{ color: '#8b7355' }}
                      >
                        <YouTubeIcon className="w-6 h-4" />
                        <span className="text-xs">Voir</span>
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}
