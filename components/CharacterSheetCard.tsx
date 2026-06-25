import type { Atributos, GameTrait, Item, Size, Trilha, TraitRarity } from '@/app/lib/gameData'

/**
 * Forma normalizada de dados que tanto a ficha salva (`/painel/personagens/[id]`)
 * quanto o resumo da criação (`Summary.tsx`) conseguem montar — a primeira a
 * partir de um `Character` persistido, a segunda a partir do rascunho ainda em
 * memória. O componente em si não sabe se o personagem já existe ou não.
 */
export type CharacterSheetTrait = GameTrait & {
  pivot: { quantity: number; is_extra: boolean }
}

export type CharacterSheetItem = Item & {
  pivot: { quantity: number; is_equipped: boolean; durability_remaining: number | null }
}

export interface CharacterSheetData {
  name: string
  avatar: string | null
  age?: number | string | null
  species?: string | null
  level?: number
  geo: number
  sustento: number
  size: Size
  trilha: Trilha | null
  atributos: Atributos
  traits: CharacterSheetTrait[]
  items: CharacterSheetItem[]
  appearance?: string | null
  story?: string | null
}

function fmtAttr(v: number | string) {
  const n = Number(v)
  return Number.isInteger(n) ? n.toString() : n.toFixed(1)
}

// Casca e Saber já tiveram um "Cinto" e "Espaços de Técnica" como estatística
// secundária (slots de equipamento/técnica), mas nenhum dos dois está em uso —
// não há mecânica de slots implementada ainda. Não exibir até existir.
const PRIMARY_ATTRS: Array<[keyof Atributos, string]> = [
  ['poder', 'Poder'],
  ['graca', 'Graça'],
  ['casca', 'Casca'],
  ['saber', 'Saber'],
]

// Deslocamento não é mais derivado de Graça — agora é uma base fixa (5),
// independente de atributos, até existir alguma mecânica que o altere.
const DESLOCAMENTO_BASE = 5

const RESOURCE_ATTRS: Array<[keyof Atributos, string]> = [
  ['coracao', 'Coração'],
  ['alma', 'Alma'],
  ['estamina', 'Estamina'],
  ['velocidade', 'Velocidade'],
]

const SOCIAL_ATTRS: Array<[keyof Atributos, string]> = [
  ['fofo', 'Fofo'],
  ['assustador', 'Assustador'],
]

const RARITY_LABELS: Record<TraitRarity, string> = {
  common: 'Comum',
  remarkable: 'Marcante',
  rare: 'Raro',
  personality: 'Personalidade',
}

const RARITY_BADGE_CLASS: Record<TraitRarity, string> = {
  common: 'ddb-badge ddb-badge-dim',
  remarkable: 'ddb-badge ddb-badge-gold',
  rare: 'badge badge--gold',
  personality: 'badge badge--success',
}

const TRILHA_TIPO_COLOR = {
  marcial: { color: 'var(--gold)', border: 'rgba(var(--gold-rgb),0.35)', bg: 'rgba(var(--gold-rgb),0.08)' },
  mistico: { color: 'var(--void-glow)', border: 'rgba(var(--void-light-rgb),0.35)', bg: 'rgba(var(--void-light-rgb),0.08)' },
} as const

const TYPE_LABELS: Record<string, string> = {
  weapon: 'Arma', armor: 'Armadura', shield: 'Escudo', tool: 'Ferramenta',
  consumable: 'Consumível', accessory: 'Acessório', other: 'Outro',
}

function AbilityBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      padding: '0.9rem 0.5rem',
      background: 'var(--bg-secondary)',
      border: '1px solid rgba(var(--gold-rgb),0.18)',
      borderRadius: 10,
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
        {fmtAttr(value)}
      </div>
    </div>
  )
}

function ResourceBlock({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      padding: '0.6rem 0.75rem',
      background: 'var(--card)',
      border: '1px solid rgba(var(--gold-rgb),0.12)',
      borderRadius: 8,
    }}>
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
          {fmtAttr(value)}
        </span>
      </div>
    </div>
  )
}

function ItemRow({ item }: { item: CharacterSheetItem }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap" style={{ padding: '0.6rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid rgba(var(--gold-rgb),0.08)', borderRadius: 6 }}>
      <div className="flex items-center gap-2 flex-wrap">
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text)' }}>
          {item.pivot.quantity}× {item.name}
        </span>
        <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.44rem' }}>{TYPE_LABELS[item.type] ?? item.type}</span>
        {item.pivot.is_equipped && <span className="badge badge--success" style={{ fontSize: '0.44rem' }}>Equipado</span>}
        {item.pivot.durability_remaining !== null && (
          <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.42rem' }}>Durabilidade {item.pivot.durability_remaining}</span>
        )}
      </div>
      <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.description}</span>
    </div>
  )
}

export default function CharacterSheetCard({ character }: { character: CharacterSheetData }) {
  const trilhaCfg = character.trilha ? TRILHA_TIPO_COLOR[character.trilha.tipo] : null
  const atributos = character.atributos

  const topLevelTraits = character.traits.filter(t => t.prerequisite_trait_id === null)
  const personalityTraits = topLevelTraits.filter(t => t.rarity === 'personality')
  const otherTraits = topLevelTraits.filter(t => t.rarity !== 'personality')
  const subTraitsByParent = (parentId: number) => character.traits.filter(t => t.prerequisite_trait_id === parentId)

  const equippedItems = character.items.filter(i => i.pivot.is_equipped)
  const carriedItems = character.items.filter(i => !i.pivot.is_equipped)
  const totalWeight = character.items.reduce((sum, i) => sum + Number(i.weight) * i.pivot.quantity, 0)

  // Carga não é mais sublabel de Poder — agora é a capacidade de peso em si
  // (Poder × 2), mostrada como barra de uso no Inventário.
  const cargaMax = atributos.poder * 2
  const cargaPct = cargaMax > 0 ? Math.min(100, (totalWeight / cargaMax) * 100) : 0

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho — identidade */}
      <div className="parchment manuscript-ruled" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(var(--gold-rgb),0.15)' }}>
        <div style={{ padding: '1.5rem' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div style={{
                width: 84, height: 84, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                border: '2px solid rgba(var(--gold-rgb),0.35)', background: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(var(--gold-rgb),0.1)',
              }}>
                {character.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={character.avatar} alt={`Avatar de ${character.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.8rem', color: 'var(--gold)' }}>
                    {character.name ? character.name.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Ficha de Personagem
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="gold-glow" style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: 'var(--text)' }}>
                    {character.name || '—'}
                  </h1>
                  <span className="badge badge--gold" style={{ fontSize: '0.55rem' }}>Nível {character.level ?? 1}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(var(--text-rgb),0.55)', marginTop: '0.2rem' }}>
                  {character.size.name}{character.species ? ` · ${character.species}` : ''}{character.age ? ` · ${character.age} estações` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-start">
              <span className="badge badge--gold">{character.size.name}</span>
              {character.trilha && trilhaCfg && (
                <span className="ddb-badge" style={{ color: trilhaCfg.color, borderColor: trilhaCfg.border, background: trilhaCfg.bg }}>
                  {character.trilha.tipo === 'marcial' ? '⚔️' : '✨'} {character.trilha.nome}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Corpo: duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* Coluna esquerda: atributos + barras + trilha */}
        <div className="flex flex-col gap-4">
          <div className="ddb-panel p-5">
            <h2 className="ddb-section-title" style={{ marginBottom: '1rem' }}>Atributos Primários</h2>
            <div className="grid grid-cols-2 gap-3">
              {PRIMARY_ATTRS.map(([key, label]) => (
                <AbilityBox key={key} label={label} value={atributos[key]} />
              ))}
            </div>
          </div>

          <div className="ddb-panel p-4">
            <div className="flex flex-col gap-2">
              <ResourceBlock label="Sustento (ração/dia)" value={character.sustento} />
              <ResourceBlock label="Deslocamento" value={DESLOCAMENTO_BASE} />
              {RESOURCE_ATTRS.map(([key, label]) => (
                <ResourceBlock key={key} label={label} value={atributos[key]} />
              ))}
            </div>
          </div>

          <div className="ddb-panel p-4">
            <h2 className="ddb-section-title" style={{ marginBottom: '0.75rem' }}>Sociais</h2>
            <div className="grid grid-cols-2 gap-2">
              {SOCIAL_ATTRS.map(([key, label]) => (
                <ResourceBlock key={key} label={label} value={atributos[key]} />
              ))}
            </div>
          </div>

          {character.trilha && trilhaCfg && (
            <div className="ddb-panel p-4" style={{ borderColor: trilhaCfg.border }}>
              <h2 className="ddb-section-title" style={{ marginBottom: '0.6rem' }}>Trilha</h2>
              <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', fontWeight: 700, color: trilhaCfg.color, marginBottom: '0.4rem' }}>
                {character.trilha.nome} {character.trilha.nivel ? `· Nv ${character.trilha.nivel}` : ''}
              </p>
              <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.8rem', color: 'rgba(var(--text-rgb),0.5)', lineHeight: 1.6 }}>
                {character.trilha.beneficios}
              </p>
            </div>
          )}
        </div>

        {/* Coluna direita: traços, inventário, flavor */}
        <div className="flex flex-col gap-4">
          {/* Traços */}
          {(personalityTraits.length > 0 || otherTraits.length > 0) && (
            <div className="ddb-panel p-5">
              <h2 className="ddb-section-title" style={{ marginBottom: '1rem' }}>Traços</h2>

              {personalityTraits.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: otherTraits.length > 0 ? '1.25rem' : 0 }}>
                  {personalityTraits.map(trait => (
                    <div key={trait.id} className="card card--selected" style={{ padding: '1rem 1.125rem', borderRadius: 10 }}>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold)' }}>{trait.name}</span>
                        <span className={RARITY_BADGE_CLASS.personality} style={{ fontSize: '0.46rem' }}>{RARITY_LABELS.personality}</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(var(--text-rgb),0.5)', lineHeight: 1.6, marginBottom: '0.4rem' }}>
                        {trait.description}
                      </p>
                      <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'rgba(var(--gold-rgb),0.8)' }}>Obrigação:</strong> {trait.roleplay_obligation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {otherTraits.map(trait => {
                  const subs = subTraitsByParent(trait.id)
                  return (
                    <div key={trait.id} className="card" style={{ padding: '0.875rem 1rem', borderRadius: 8 }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>
                          {trait.name}{trait.pivot.quantity > 1 ? ` ×${trait.pivot.quantity}` : ''}
                        </span>
                        <span className={RARITY_BADGE_CLASS[trait.rarity]} style={{ fontSize: '0.46rem' }}>{RARITY_LABELS[trait.rarity]}</span>
                        {trait.pivot.is_extra && <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.44rem' }}>Ganho em campanha</span>}
                      </div>
                      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.8rem', color: 'rgba(var(--text-rgb),0.45)', marginTop: '0.3rem' }}>
                        {trait.mechanical_effect ?? trait.description}
                      </p>
                      {subs.length > 0 && (
                        <div className="flex flex-col gap-1" style={{ marginTop: '0.5rem' }}>
                          {subs.map(sub => (
                            <div key={sub.id} className="flex items-center gap-2 flex-wrap" style={{ paddingLeft: '1rem' }}>
                              <span style={{ color: 'rgba(var(--gold-rgb),0.35)', fontSize: '0.6rem' }}>└</span>
                              <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.42rem' }}>Sub-traço</span>
                              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.68rem', color: 'rgba(var(--text-rgb),0.7)' }}>{sub.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Inventário */}
          <div className="ddb-panel p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="ddb-section-title">Inventário</h2>
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', color: 'var(--text-muted)' }}>Geo: {character.geo}</span>
            </div>

            <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Carga</span>
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', fontWeight: 700, color: cargaPct >= 100 ? 'var(--error)' : 'var(--text)' }}>
                  {totalWeight} / {cargaMax}
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-secondary)', border: '1px solid rgba(var(--gold-rgb),0.12)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${cargaPct}%`, background: cargaPct >= 100 ? 'var(--error)' : 'var(--gold)', transition: 'width 0.2s' }} />
              </div>
            </div>

            {character.items.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.8rem', color: 'rgba(var(--text-rgb),0.35)', marginTop: '0.75rem' }}>
                Nenhum item.
              </p>
            ) : (
              <div className="flex flex-col gap-3" style={{ marginTop: '0.75rem' }}>
                {equippedItems.length > 0 && (
                  <div>
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>Equipado</p>
                    <div className="flex flex-col gap-1.5">
                      {equippedItems.map(item => (
                        <ItemRow key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  {equippedItems.length > 0 && (
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Carregado</p>
                  )}
                  <div className="flex flex-col gap-1.5">
                    {carriedItems.map(item => (
                      <ItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Aparência / História */}
          {(character.appearance || character.story) && (
            <div className="ddb-panel p-5">
              <h2 className="ddb-section-title" style={{ marginBottom: '1rem' }}>Aparência & História</h2>
              {character.appearance && (
                <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.88rem', color: 'rgba(var(--text-rgb),0.6)', lineHeight: 1.75, marginBottom: character.story ? '1rem' : 0 }}>
                  {character.appearance}
                </p>
              )}
              {character.story && (
                <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.88rem', color: 'rgba(var(--text-rgb),0.6)', lineHeight: 1.75 }}>
                  {character.story}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
