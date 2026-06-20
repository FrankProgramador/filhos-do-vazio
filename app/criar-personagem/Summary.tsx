import type { Atributos, CharSheet, EquipmentPackage, GameTrait, Item, Size, Trilha } from '@/app/lib/gameData'
import { STARTING_GEO } from '@/app/lib/gameData'

interface Props {
  sheet: CharSheet
  size: Size | null
  trilha: Trilha | null
  traits: GameTrait[]
  packages: EquipmentPackage[]
  items: Item[]
  atributos: Atributos
  sustento: number
  onAparenciaChange: (v: string) => void
  onHistoriaChange: (v: string) => void
}

function fmtAttr(v: number) {
  return Number.isInteger(v) ? v.toString() : v.toFixed(1)
}

const ALL_ATTRS: Array<[keyof Atributos, string]> = [
  ['poder', 'Poder'],
  ['saber', 'Saber'],
  ['casca', 'Casca'],
  ['graca', 'Graça'],
  ['coracao', 'Coração'],
  ['estamina', 'Estamina'],
  ['alma', 'Alma'],
  ['velocidade', 'Velocidade'],
  ['fofo', 'Fofo'],
  ['assustador', 'Assustador'],
]

const TRILHA_TIPO_COLOR = {
  marcial: { color: 'var(--gold)', border: 'rgba(var(--gold-rgb),0.35)', bg: 'rgba(var(--gold-rgb),0.08)' },
  mistico: { color: 'var(--void-glow)', border: 'rgba(var(--void-light-rgb),0.35)', bg: 'rgba(var(--void-light-rgb),0.08)' },
} as const

const labelStyle = {
  fontFamily: 'var(--font-cinzel)',
  fontSize: '0.62rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold)',
  display: 'block',
  marginBottom: '0.5rem',
}

const textareaStyle = {
  width: '100%',
  minHeight: 90,
  padding: '0.75rem 1rem',
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(var(--gold-rgb),0.14)',
  borderRadius: 6,
  color: 'var(--text)',
  fontFamily: 'var(--font-im-fell)',
  fontStyle: 'italic' as const,
  fontSize: '0.88rem',
  lineHeight: 1.65,
  resize: 'vertical' as const,
  outline: 'none',
}

export default function Summary({
  sheet, size, trilha, traits, packages, items, atributos, sustento,
  onAparenciaChange, onHistoriaChange,
}: Props) {
  const attrTraitEntries = Object.entries(sheet.attrTraits)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => ({ trait: traits.find(t => t.id === Number(id)), count }))
    .filter((x): x is { trait: GameTrait; count: number } => !!x.trait)

  const specialTraitList = sheet.specialTraits
    .map(id => traits.find(t => t.id === id))
    .filter((t): t is GameTrait => !!t)

  const personalityTraitList = sheet.personalityTraits
    .map(id => traits.find(t => t.id === id))
    .filter((t): t is GameTrait => !!t)

  // Bônus da trilha aplicado apenas na exibição final — mesma separação do backend
  // (Character::calculateAttributes não inclui a trilha; só a ficha final mostra o efeito).
  const finalAttrs = { ...atributos }
  if (trilha?.barra_aumentada === 'estamina') finalAttrs.estamina += trilha.aumento
  if (trilha?.barra_aumentada === 'alma') finalAttrs.alma += trilha.aumento

  const selectedPackage = packages.find(p => p.id === sheet.equipmentPackageId) ?? null
  const geoBudget = STARTING_GEO + (selectedPackage?.geo_bonus ?? 0)
  const purchasedEntries = Object.entries(sheet.purchasedItems)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ item: items.find(i => i.id === Number(id)), qty }))
    .filter((x): x is { item: Item; qty: number } => !!x.item)
  const geoSpent = purchasedEntries.reduce((total, { item, qty }) => total + item.base_price * qty, 0)
  const geoRemaining = geoBudget - geoSpent

  return (
    <div className="flex flex-col gap-8">
      {/* Character sheet preview */}
      <div style={{ background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.12)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(to right, rgba(var(--bg-secondary-rgb),0.9), rgba(var(--bg-rgb),0.95))',
          borderBottom: '1px solid rgba(var(--gold-rgb),0.08)',
        }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {sheet.avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sheet.avatar} alt="Avatar do personagem" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(var(--gold-rgb),0.25)' }} />
              )}
              <div>
                <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.52rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Ficha de Personagem
                </p>
                <h2 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 700, color: 'var(--text)' }}>
                  {sheet.nome || '—'}
                </h2>
                {(sheet.idade || sheet.especie) && (
                  <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.8rem', color: 'rgba(var(--text-rgb),0.5)', marginTop: '0.2rem' }}>
                    {[sheet.especie, sheet.idade && `${sheet.idade} estações`].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {size && <span className="badge badge--gold">{size.name}</span>}
              {trilha && (
                <span className="ddb-badge" style={{ color: TRILHA_TIPO_COLOR[trilha.tipo].color, borderColor: TRILHA_TIPO_COLOR[trilha.tipo].border, background: TRILHA_TIPO_COLOR[trilha.tipo].bg }}>
                  Trilha: {trilha.nome}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Atributos */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(var(--gold-rgb),0.07)' }}>
          <p className="ddb-section-title" style={{ marginBottom: '0.875rem' }}>Atributos</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '0.45rem' }}>
            {ALL_ATTRS.map(([key, label]) => (
              <div key={key} style={{ padding: '0.6rem 0.5rem', background: 'var(--bg-secondary)', border: '1px solid rgba(var(--gold-rgb),0.1)', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                  {fmtAttr(finalAttrs[key])}
                </div>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.45rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.75rem', color: 'rgba(var(--text-rgb),0.35)', marginTop: '0.6rem' }}>
            Sustento: {sustento} ração(ões) por descanso · Geo restante: {geoRemaining} / {geoBudget}
          </p>
        </div>

        {/* Traços */}
        {(attrTraitEntries.length > 0 || specialTraitList.length > 0 || personalityTraitList.length > 0) && (
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(var(--gold-rgb),0.07)' }}>
            <p className="ddb-section-title" style={{ marginBottom: '0.875rem' }}>Traços</p>
            <div className="flex flex-col gap-2">
              {personalityTraitList.map(trait => (
                <div key={trait.id} className="flex items-center gap-2 flex-wrap">
                  <span className="ddb-badge ddb-badge-gold" style={{ fontSize: '0.48rem' }}>Personalidade</span>
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.72rem', color: 'var(--text)' }}>{trait.name}</span>
                  <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {trait.roleplay_obligation}
                  </span>
                </div>
              ))}
              {attrTraitEntries.map(({ trait, count }) => (
                <div key={trait.id} className="flex items-center gap-2 flex-wrap">
                  <span className="badge badge--gold" style={{ fontSize: '0.48rem' }}>Atributo</span>
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.72rem', color: 'var(--text)' }}>
                    {trait.name}{count > 1 ? ` ×${count}` : ''}
                  </span>
                  <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {trait.mechanical_effect}
                  </span>
                </div>
              ))}
              {specialTraitList.map(trait => {
                const subsSelecionados = traits.filter(t => t.prerequisite_trait_id === trait.id && sheet.subTraits.includes(t.id))
                return (
                  <div key={trait.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="ddb-badge ddb-badge-gold" style={{ fontSize: '0.48rem' }}>Especial</span>
                      <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.72rem', color: 'var(--text)' }}>{trait.name}</span>
                      <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{trait.category}</span>
                    </div>
                    {subsSelecionados.map(sub => (
                      <div key={sub.id} className="flex items-center gap-2 flex-wrap" style={{ paddingLeft: '1.25rem' }}>
                        <span style={{ color: 'rgba(var(--gold-rgb),0.35)', fontSize: '0.6rem' }}>└</span>
                        <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.44rem' }}>Sub-traço</span>
                        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'rgba(var(--text-rgb),0.7)' }}>{sub.name}</span>
                        <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.74rem', color: 'var(--text-muted)' }}>{sub.description}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Trilha */}
        {trilha && (
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(var(--gold-rgb),0.07)' }}>
            <p className="ddb-section-title" style={{ marginBottom: '0.875rem' }}>Trilha</p>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', fontWeight: 700, color: TRILHA_TIPO_COLOR[trilha.tipo].color }}>
                {trilha.nome}
              </span>
              <span className="ddb-badge" style={{ fontSize: '0.48rem', color: TRILHA_TIPO_COLOR[trilha.tipo].color, borderColor: TRILHA_TIPO_COLOR[trilha.tipo].border, background: TRILHA_TIPO_COLOR[trilha.tipo].bg }}>
                {trilha.tipo === 'marcial' ? '⚔️ Marcial' : '✨ Místico'}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.48)', lineHeight: 1.65 }}>
              {trilha.beneficios}
            </p>
          </div>
        )}

        {/* Inventário */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <p className="ddb-section-title" style={{ marginBottom: '0.875rem' }}>Inventário</p>
          {selectedPackage && (
            <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>
              Pacote: {selectedPackage.name}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            {selectedPackage?.items.map(item => (
              <div key={`pkg-${item.id}`} className="flex items-center gap-2 flex-wrap">
                <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.44rem' }}>Pacote</span>
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.72rem', color: 'var(--text)' }}>
                  {item.pivot.quantity}× {item.name}
                </span>
              </div>
            ))}
            {purchasedEntries.map(({ item, qty }) => (
              <div key={`buy-${item.id}`} className="flex items-center gap-2 flex-wrap">
                <span className="badge badge--gold" style={{ fontSize: '0.46rem' }}>Comprado</span>
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.72rem', color: 'var(--text)' }}>
                  {qty}× {item.name}
                </span>
                <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {item.base_price * qty} Geo
                </span>
              </div>
            ))}
            {!selectedPackage && purchasedEntries.length === 0 && (
              <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.8rem', color: 'rgba(var(--text-rgb),0.35)' }}>
                Nenhum item selecionado.
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label style={labelStyle}>
          Aparência <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)', fontSize: '0.72rem' }}>(opcional)</span>
        </label>
        <textarea
          value={sheet.aparencia}
          onChange={e => onAparenciaChange(e.target.value)}
          placeholder="Descreva a aparência do seu inseto — cor, forma, marcas especiais..."
          style={textareaStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>
          História breve <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)', fontSize: '0.72rem' }}>(opcional)</span>
        </label>
        <textarea
          value={sheet.historia}
          onChange={e => onHistoriaChange(e.target.value)}
          placeholder="De onde vem? O que busca? O que carrega?"
          style={textareaStyle}
        />
      </div>

      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(var(--text-rgb),0.3)', textAlign: 'center' }}>
        Revise suas escolhas acima antes de salvar. Clique em Voltar para fazer alterações.
      </p>
    </div>
  )
}
