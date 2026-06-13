import type { CharSheet, Base, TracoAtributo, TracoEspecial, Trilha, Atributos } from '@/app/lib/mockData'

interface Props {
  sheet: CharSheet
  bases: Base[]
  tracosAtributo: TracoAtributo[]
  tracosEspeciais: TracoEspecial[]
  trilhas: Trilha[]
  atributos: Atributos
  onNomeChange: (nome: string) => void
  onAparenciaChange: (v: string) => void
  onHistoriaChange: (v: string) => void
}

function fmtAttr(v: number) {
  return Number.isInteger(v) ? v.toString() : v.toFixed(1)
}

const ALL_ATTRS: Array<[keyof Atributos, string]> = [
  ['poder',      'Poder'],
  ['saber',      'Saber'],
  ['casca',      'Casca'],
  ['graca',      'Graça'],
  ['coracao',    'Coração'],
  ['estamina',   'Estamina'],
  ['alma',       'Alma'],
  ['velocidade', 'Velocidade'],
  ['fofo',       'Fofo'],
  ['assustador', 'Assustador'],
]

export default function Summary({
  sheet, bases, tracosAtributo, tracosEspeciais, trilhas, atributos,
  onNomeChange, onAparenciaChange, onHistoriaChange,
}: Props) {
  const base = bases.find(b => b.id === sheet.baseId)
  const trilha = trilhas.find(t => t.id === sheet.trilhaId)

  const selectedAttrTraits = Object.entries(sheet.attrTraits)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => ({ traco: tracosAtributo.find(t => t.id === id)!, count }))
    .filter(x => x.traco)

  const selectedSpecialTraits = sheet.specialTraits
    .map(id => tracosEspeciais.find(t => t.id === id))
    .filter(Boolean) as TracoEspecial[]

  // Final attribute values — apply trail bonus to the boosted bar
  const finalAttrs = { ...atributos }
  if (trilha?.barraAumentada === 'Estamina') finalAttrs.estamina += trilha.aumento
  if (trilha?.barraAumentada === 'Alma')     finalAttrs.alma     += trilha.aumento

  const textareaStyle = {
    width: '100%',
    minHeight: 90,
    padding: '0.75rem 1rem',
    background: 'var(--hk-abyss)',
    border: '1px solid rgba(74,158,255,0.14)',
    borderRadius: 6,
    color: 'var(--hk-pale)',
    fontFamily: 'var(--font-im-fell)',
    fontStyle: 'italic' as const,
    fontSize: '0.88rem',
    lineHeight: 1.65,
    resize: 'vertical' as const,
    outline: 'none',
  }

  const labelStyle = {
    fontFamily: 'var(--font-cinzel)',
    fontSize: '0.62rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: 'var(--hk-gold)',
    display: 'block',
    marginBottom: '0.5rem',
  }

  return (
    <div className="flex flex-col gap-8">
      {/* "Not implemented" warning */}
      <div style={{
        padding: '0.75rem 1rem',
        background: 'rgba(212,168,67,0.06)',
        border: '1px solid rgba(212,168,67,0.28)',
        borderRadius: 7,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
        <p style={{
          fontFamily: 'var(--font-cinzel)',
          fontSize: '0.58rem',
          letterSpacing: '0.06em',
          color: 'rgba(212,168,67,0.85)',
          margin: 0,
          lineHeight: 1.6,
        }}>
          Funcionalidade em desenvolvimento — salvamento não implementado.
          Dados serão exibidos no console mas <strong>não serão persistidos</strong>.
        </p>
      </div>

      {/* Name input */}
      <div>
        <label style={labelStyle}>
          Nome do Personagem <span style={{ color: '#e05050' }}>*</span>
        </label>
        <input
          type="text"
          value={sheet.nome}
          onChange={e => onNomeChange(e.target.value)}
          placeholder="Como seu inseto é chamado?"
          className="ddb-search w-full"
          style={{ padding: '0.75rem 1rem', fontSize: '1rem', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}
          autoFocus
        />
      </div>

      {/* Character sheet preview */}
      <div style={{
        background: 'var(--hk-deep)',
        border: '1px solid rgba(74,158,255,0.12)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Sheet header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(to right, rgba(15,18,34,0.9), rgba(11,13,24,0.95))',
          borderBottom: '1px solid rgba(74,158,255,0.08)',
        }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.52rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--hk-dim)',
                marginBottom: '0.3rem',
              }}>
                Ficha de Personagem
              </p>
              <h2 style={{
                fontFamily: 'var(--font-cinzel-decorative)',
                fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                fontWeight: 700,
                color: sheet.nome.trim() ? 'var(--hk-ghost)' : 'var(--hk-dim)',
              }}>
                {sheet.nome.trim() || '—'}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {base && <span className="ddb-badge ddb-badge-soul">{base.nome}</span>}
              {trilha && (
                <span className="ddb-badge" style={{
                  color: trilha.tipo === 'marcial' ? 'var(--hk-gold)' : 'var(--hk-soul)',
                  borderColor: trilha.tipo === 'marcial' ? 'rgba(212,168,67,0.35)' : 'rgba(74,158,255,0.35)',
                  background: trilha.tipo === 'marcial' ? 'rgba(212,168,67,0.08)' : 'rgba(74,158,255,0.08)',
                }}>
                  Trilha: {trilha.nome}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(74,158,255,0.07)' }}>
          <p className="ddb-section-title" style={{ marginBottom: '0.875rem' }}>Atributos</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '0.45rem' }}>
            {ALL_ATTRS.map(([key, label]) => (
              <div key={key} style={{
                padding: '0.6rem 0.5rem',
                background: 'var(--hk-abyss)',
                border: '1px solid rgba(74,158,255,0.1)',
                borderRadius: 6,
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--hk-soul-pale)',
                  lineHeight: 1,
                }}>
                  {fmtAttr(finalAttrs[key] as number)}
                </div>
                <div style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: '0.45rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--hk-dim)',
                  marginTop: '0.3rem',
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traits */}
        {(selectedAttrTraits.length > 0 || selectedSpecialTraits.length > 0) && (
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(74,158,255,0.07)' }}>
            <p className="ddb-section-title" style={{ marginBottom: '0.875rem' }}>Traços</p>
            <div className="flex flex-col gap-2">
              {selectedAttrTraits.map(({ traco, count }) => (
                <div key={traco.id} className="flex items-center gap-2 flex-wrap">
                  <span className="ddb-badge ddb-badge-soul" style={{ fontSize: '0.48rem' }}>Atributo</span>
                  <span style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '0.72rem',
                    color: 'var(--hk-pale)',
                  }}>
                    {traco.nome}{count > 1 ? ` ×${count}` : ''}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-im-fell)',
                    fontStyle: 'italic',
                    fontSize: '0.78rem',
                    color: 'var(--hk-dim)',
                  }}>
                    {traco.efeito}
                  </span>
                </div>
              ))}
              {selectedSpecialTraits.map(traco => {
                // Sub-traços deste traço pai
                const subsSelecionados = (traco.subTracos ?? []).filter(st =>
                  sheet.subTraits.includes(st.id)
                )
                return (
                  <div key={traco.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="ddb-badge ddb-badge-gold" style={{ fontSize: '0.48rem' }}>Especial</span>
                      <span style={{
                        fontFamily: 'var(--font-cinzel)',
                        fontSize: '0.72rem',
                        color: 'var(--hk-pale)',
                      }}>
                        {traco.nome}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-im-fell)',
                        fontStyle: 'italic',
                        fontSize: '0.78rem',
                        color: 'var(--hk-dim)',
                      }}>
                        {traco.categoria}
                      </span>
                    </div>
                    {/* Sub-traços aninhados */}
                    {subsSelecionados.map(sub => (
                      <div key={sub.id} className="flex items-center gap-2 flex-wrap" style={{ paddingLeft: '1.25rem' }}>
                        <span style={{ color: 'rgba(74,158,255,0.35)', fontSize: '0.6rem' }}>└</span>
                        <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.44rem' }}>Sub-traço</span>
                        <span style={{
                          fontFamily: 'var(--font-cinzel)',
                          fontSize: '0.68rem',
                          color: 'rgba(216,228,248,0.7)',
                        }}>
                          {sub.nome}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-im-fell)',
                          fontStyle: 'italic',
                          fontSize: '0.74rem',
                          color: 'var(--hk-dim)',
                        }}>
                          {sub.descricao}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Trail */}
        {trilha && (
          <div style={{ padding: '1.25rem 1.5rem' }}>
            <p className="ddb-section-title" style={{ marginBottom: '0.875rem' }}>Trilha</p>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: trilha.tipo === 'marcial' ? 'var(--hk-gold)' : 'var(--hk-soul)',
                }}>
                  {trilha.nome}
                </span>
                <span className="ddb-badge" style={{
                  fontSize: '0.48rem',
                  color: trilha.tipo === 'marcial' ? 'var(--hk-gold)' : 'var(--hk-soul)',
                  borderColor: trilha.tipo === 'marcial' ? 'rgba(212,168,67,0.35)' : 'rgba(74,158,255,0.35)',
                  background: trilha.tipo === 'marcial' ? 'rgba(212,168,67,0.08)' : 'rgba(74,158,255,0.08)',
                }}>
                  {trilha.tipo === 'marcial' ? '⚔️ Marcial' : '✨ Místico'}
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-im-fell)',
                fontStyle: 'italic',
                fontSize: '0.85rem',
                color: 'rgba(216,228,248,0.48)',
                lineHeight: 1.65,
              }}>
                {trilha.beneficios}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Optional: Aparência */}
      <div>
        <label style={labelStyle}>
          Aparência <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--hk-dim)', fontSize: '0.72rem' }}>(opcional)</span>
        </label>
        <textarea
          value={sheet.aparencia}
          onChange={e => onAparenciaChange(e.target.value)}
          placeholder="Descreva a aparência do seu inseto — cor, forma, marcas especiais..."
          style={textareaStyle}
        />
      </div>

      {/* Optional: História breve */}
      <div>
        <label style={labelStyle}>
          História breve <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--hk-dim)', fontSize: '0.72rem' }}>(opcional)</span>
        </label>
        <textarea
          value={sheet.historia}
          onChange={e => onHistoriaChange(e.target.value)}
          placeholder="De onde vem? O que busca? O que carrega?"
          style={textareaStyle}
        />
      </div>

      <p style={{
        fontFamily: 'var(--font-im-fell)',
        fontStyle: 'italic',
        fontSize: '0.82rem',
        color: 'rgba(216,228,248,0.3)',
        textAlign: 'center',
      }}>
        Revise suas escolhas acima antes de salvar. Clique em Voltar para fazer alterações.
      </p>
    </div>
  )
}
