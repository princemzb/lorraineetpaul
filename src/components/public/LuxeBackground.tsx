export default function LuxeBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: 'var(--noir)' }}>
      <div
        className="glow-orb glow-orb-pomme"
        style={{ width: 520, height: 520, top: '-12%', left: '-12%' }}
      />
      <div
        className="glow-orb glow-orb-or"
        style={{ width: 620, height: 620, bottom: '-18%', right: '-12%' }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(212,175,55,0.16) 1px, transparent 0)',
          backgroundSize: '34px 34px',
          opacity: 0.35,
        }}
      />
    </div>
  )
}
