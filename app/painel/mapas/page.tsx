import MapEditor from '@/app/painel/mapas/MapEditor'

export default function MapasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="gold-glow"
          style={{
            fontFamily: 'var(--font-cinzel-decorative)',
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            fontWeight: 900,
            color: 'var(--text)',
            marginBottom: '0.4rem',
          }}
        >
          Mapas
        </h1>
        <p style={{ color: 'rgba(var(--text-rgb),0.6)', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
          Desenhe o cenário da próxima partida. Pinte o piso, trace as paredes e salve para usar à mesa.
        </p>
      </div>

      <MapEditor />
    </div>
  )
}
