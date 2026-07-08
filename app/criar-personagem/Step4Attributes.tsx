import type { Atributos, GameTrait, Size } from '@/app/lib/gameData'
import { MAX_TRACOS } from '@/app/lib/gameData'
import AttributesPanel from './AttributesPanel'
import ChosenTraitsPanel, { type ChosenTraitEntry } from './ChosenTraitsPanel'

interface Props {
  size: Size
  traits: GameTrait[]
  attrTraits: Record<number, number>
  atributos: Atributos
  totalTracos: number
  onAdd: (id: number) => void
  onRemove: (id: number) => void
}

export default function Step4Attributes({
  size, traits, attrTraits, atributos, totalTracos, onAdd, onRemove,
}: Props) {
  const rootTraits = traits.filter(t => t.tipo === 'atributo' && t.prerequisite_trait_id === null)
  const selectedAttrTraits = traits.filter(t => t.tipo === 'atributo' && (attrTraits[t.id] ?? 0) > 0)
  const chosenItems: ChosenTraitEntry[] = selectedAttrTraits.map(trait => ({
    id: trait.id,
    name: trait.name,
    badge: trait.prerequisite_trait_id ? 'Subtraço' : 'Traço',
    detail: trait.mechanical_effect,
    onRemove: () => onRemove(trait.id),
  }))

  return (
    <div className="flex flex-col gap-8">
      {/* Status bar */}
      <div className="flex items-center justify-between" style={{
        padding: '1rem 1.25rem',
        background: 'var(--card)',
        border: '1px solid rgba(var(--gold-rgb),0.1)',
        borderRadius: 8,
      }}>
        <p style={{
          fontFamily: 'var(--font-im-fell)',
          fontStyle: 'italic',
          fontSize: '0.8rem',
          color: 'rgba(var(--text-rgb),0.5)',
          margin: 0,
        }}>
          Primeiro selecione os traços de atributo, eles definem o personagem.
        </p>
        <div style={{
          flexShrink: 0,
          textAlign: 'center',
          paddingLeft: '1rem',
          borderLeft: '1px solid rgba(var(--gold-rgb),0.1)',
        }}>
          <span style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.55rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: '0.2rem',
          }}>
            Traços
          </span>
          <span style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: totalTracos >= MAX_TRACOS ? 'var(--error)' : 'var(--text)',
          }}>
            {totalTracos}
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}> / {MAX_TRACOS}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AttributesPanel size={size} atributos={atributos} />
        <ChosenTraitsPanel
          items={chosenItems}
          emptyText="Nenhum traço de atributo escolhido ainda. Escolha abaixo."
        />
      </div>

      {/* Below: Trait cards */}
      <div className="flex flex-col gap-3">
        <h3 style={{
          fontFamily: 'var(--font-cinzel)',
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
        }}>
          Traços de Atributo
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rootTraits.map(trait => {
            const count = attrTraits[trait.id] ?? 0
            const isSelected = count > 0
            const canToggle = isSelected || totalTracos < MAX_TRACOS
            const blockReason = !canToggle ? 'Limite de traços atingido' : null
            const children = traits.filter(t => t.prerequisite_trait_id === trait.id)

            return (
              <div
                key={trait.id}
                className={`card ${isSelected ? 'card--selected' : ''}`}
                style={{
                  background: isSelected ? undefined : 'var(--card)',
                  borderRadius: 8,
                  opacity: !canToggle ? 0.38 : 1,
                  transition: 'all 0.2s',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => (isSelected ? onRemove(trait.id) : onAdd(trait.id))}
                  disabled={!canToggle}
                  className="text-left w-full"
                  style={{ padding: '0.875rem 1rem', cursor: canToggle ? 'pointer' : 'not-allowed', background: 'transparent', border: 'none', display: 'block', width: '100%' }}
                  title={blockReason ?? undefined}
                >
                  <div className="flex items-start gap-3">
                    <div style={{
                      width: 18, height: 18, flexShrink: 0, marginTop: 2,
                      border: isSelected ? '2px solid var(--gold)' : '1px solid rgba(var(--gold-rgb),0.3)',
                      borderRadius: 3,
                      background: isSelected ? 'rgba(var(--gold-rgb),0.18)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                    }}>
                      {isSelected && <span style={{ color: 'var(--gold)', fontSize: '0.65rem', lineHeight: 1 }}>✓</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.78rem', fontWeight: 600, color: isSelected ? 'var(--gold-light)' : 'var(--text)' }}>
                          {trait.name}
                        </span>
                        {children.length > 0 && (
                          <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.45rem' }}>
                            {children.length} subtraço{children.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(var(--text-rgb),0.48)', marginTop: '0.3rem', lineHeight: 1.6 }}>
                        {trait.mechanical_effect}
                      </p>
                      {blockReason && (
                        <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                          {blockReason}
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                {children.length > 0 && (
                  <div style={{ margin: '0 1rem 0.875rem', padding: '0.75rem', background: 'rgba(var(--gold-rgb),0.04)', border: '1px solid rgba(var(--gold-rgb),0.1)', borderRadius: 6 }}>
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.48rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                      Subtraços disponíveis
                    </p>

                    <div className="flex flex-col gap-2">
                      {children.map(sub => {
                        const subCount = attrTraits[sub.id] ?? 0
                        const isSubSelected = subCount > 0
                        const canToggleSub = isSubSelected || (isSelected && totalTracos < MAX_TRACOS)
                        const subBlockReason = !canToggleSub
                          ? (!isSelected ? 'Escolha o traço principal primeiro' : 'Limite de traços atingido')
                          : null

                        return (
                          <div
                            key={sub.id}
                            className="flex items-center gap-2.5"
                            style={{
                              padding: '0.6rem 0.75rem',
                              background: isSubSelected ? 'rgba(var(--gold-rgb),0.09)' : 'rgba(var(--gold-rgb),0.02)',
                              border: isSubSelected ? '1px solid rgba(var(--gold-rgb),0.22)' : '1px solid rgba(var(--gold-rgb),0.08)',
                              borderRadius: 5,
                              opacity: !canToggleSub ? 0.38 : 1,
                              transition: 'all 0.15s',
                            }}
                          >
                            <button
                              onClick={() => (isSubSelected ? onRemove(sub.id) : onAdd(sub.id))}
                              disabled={!canToggleSub}
                              className="text-left flex-1 min-w-0"
                              title={subBlockReason ?? undefined}
                              style={{ background: 'transparent', border: 'none', cursor: canToggleSub ? 'pointer' : 'not-allowed', padding: 0 }}
                            >
                              <div className="flex items-start gap-2.5">
                                <div style={{
                                  width: 14, height: 14, flexShrink: 0, marginTop: 2,
                                  border: isSubSelected ? '2px solid rgba(var(--gold-rgb),0.7)' : '1px solid rgba(var(--gold-rgb),0.25)',
                                  borderRadius: 2,
                                  background: isSubSelected ? 'rgba(var(--gold-rgb),0.2)' : 'transparent',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  {isSubSelected && <span style={{ color: 'var(--gold)', fontSize: '0.5rem', lineHeight: 1 }}>✓</span>}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', fontWeight: 600, color: isSubSelected ? 'var(--gold-light)' : 'var(--text)' }}>
                                    {sub.name}
                                  </span>
                                  <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.76rem', color: 'rgba(var(--text-rgb),0.4)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                                    {sub.mechanical_effect}
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p style={{
          fontFamily: 'var(--font-im-fell)',
          fontStyle: 'italic',
          fontSize: '0.78rem',
          color: 'rgba(var(--text-rgb),0.3)',
          marginTop: '0.25rem',
        }}>
          Cada traço principal tem subtraços — escolha o principal para poder selecioná-los.
        </p>
      </div>
    </div>
  )
}
