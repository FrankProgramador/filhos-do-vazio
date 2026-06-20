import type { EquipmentPackage, Item } from '@/app/lib/gameData'
import { STARTING_GEO } from '@/app/lib/gameData'
import ResourceBar from './ResourceBar'

interface Props {
  packages: EquipmentPackage[]
  items: Item[]
  equipmentPackageId: number | null
  purchasedItems: Record<number, number>
  onSelectPackage: (id: number | null) => void
  onAddItem: (id: number) => void
  onRemoveItem: (id: number) => void
}

const TYPE_LABELS: Record<Item['type'], string> = {
  weapon: 'Arma',
  armor: 'Armadura',
  shield: 'Escudo',
  tool: 'Ferramenta',
  consumable: 'Consumível',
  accessory: 'Acessório',
  other: 'Outro',
}

export default function Step6Equipment({
  packages, items, equipmentPackageId, purchasedItems, onSelectPackage, onAddItem, onRemoveItem,
}: Props) {
  const selectedPackage = packages.find(p => p.id === equipmentPackageId) ?? null
  const geoBudget = STARTING_GEO + (selectedPackage?.geo_bonus ?? 0)
  const geoSpent = Object.entries(purchasedItems).reduce((total, [itemId, qty]) => {
    const item = items.find(i => i.id === Number(itemId))
    return total + (item ? item.base_price * qty : 0)
  }, 0)
  const geoRemaining = geoBudget - geoSpent

  return (
    <div className="flex flex-col gap-8">
      <p style={{
        fontFamily: 'var(--font-im-fell)',
        fontStyle: 'italic',
        color: 'rgba(var(--text-rgb),0.55)',
        lineHeight: 1.8,
        maxWidth: 620,
      }}>
        Escolha um pacote de equipamento pronto ou monte seu inventário item por item.
        Você começa com {STARTING_GEO} Geo — pacotes com bônus liberam Geo extra para compras adicionais,
        e os itens do pacote são concedidos de graça, sem descontar do seu saldo.
      </p>

      <div style={{ padding: '1rem 1.25rem', background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.1)', borderRadius: 8 }}>
        <ResourceBar label="Geo disponível" current={geoRemaining} max={geoBudget} invert />
      </div>

      {/* Pacotes */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem',
        }}>
          Pacotes Prontos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onSelectPackage(null)}
            className={`card text-left ${equipmentPackageId === null ? 'card--selected' : ''}`}
            style={{ padding: '1rem 1.125rem', background: equipmentPackageId === null ? undefined : 'var(--card)', borderRadius: 10, cursor: 'pointer' }}
          >
            <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem', fontWeight: 700, color: equipmentPackageId === null ? 'var(--gold)' : 'var(--text)' }}>
              Nenhum pacote
            </span>
            <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.78rem', color: 'rgba(var(--text-rgb),0.45)', marginTop: '0.4rem' }}>
              Compre apenas itens individuais com seus {STARTING_GEO} Geo iniciais.
            </p>
          </button>

          {packages.map(pkg => {
            const isSelected = equipmentPackageId === pkg.id
            return (
              <button
                key={pkg.id}
                onClick={() => onSelectPackage(pkg.id)}
                className={`card text-left ${isSelected ? 'card--selected' : ''}`}
                style={{ padding: '1rem 1.125rem', background: isSelected ? undefined : 'var(--card)', borderRadius: 10, cursor: 'pointer' }}
              >
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem', fontWeight: 700, color: isSelected ? 'var(--gold)' : 'var(--text)' }}>
                    {pkg.name}
                  </span>
                  {pkg.geo_bonus > 0 && (
                    <span className="ddb-badge ddb-badge-gold" style={{ fontSize: '0.46rem' }}>+{pkg.geo_bonus} Geo</span>
                  )}
                </div>
                <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.78rem', color: 'rgba(var(--text-rgb),0.45)', marginBottom: '0.5rem' }}>
                  {pkg.description}
                </p>
                <div className="flex flex-col gap-0.5">
                  {pkg.items.map(item => (
                    <span key={item.id} style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.58rem', color: 'var(--text-muted)' }}>
                      {item.pivot.quantity}× {item.name}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Compra individual */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem',
        }}>
          Itens Individuais
        </h3>
        <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.78rem', color: 'rgba(var(--text-rgb),0.4)', marginBottom: '0.875rem' }}>
          Prefere começar rápido? Veja os pacotes prontos acima ↑ — ou monte seu próprio inventário aqui.
        </p>

        <div className="flex flex-col gap-2">
          {items.map(item => {
            const qty = purchasedItems[item.id] ?? 0
            const canAdd = geoRemaining >= item.base_price

            return (
              <div key={item.id} className={`card ${qty > 0 ? 'card--selected' : ''}`} style={{ padding: '0.75rem 1rem', background: qty > 0 ? undefined : 'var(--card)', borderRadius: 8 }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', fontWeight: 600, color: qty > 0 ? 'var(--gold-light)' : 'var(--text)' }}>
                        {item.name}
                      </span>
                      <span className="ddb-badge ddb-badge-dim" style={{ fontSize: '0.46rem' }}>{TYPE_LABELS[item.type]}</span>
                      <span className="badge badge--gold" style={{ fontSize: '0.5rem' }}>{item.base_price} Geo</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.78rem', color: 'rgba(var(--text-rgb),0.42)', marginTop: '0.25rem' }}>
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      disabled={qty <= 0}
                      className="counter-btn counter-btn--dec"
                      style={{ width: 26, height: 26, color: 'var(--gold-light)', fontSize: '1rem', cursor: qty > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      −
                    </button>
                    <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', fontWeight: 700, color: qty > 0 ? 'var(--gold-light)' : 'var(--text-muted)', minWidth: 16, textAlign: 'center' }}>
                      {qty}
                    </span>
                    <button
                      onClick={() => onAddItem(item.id)}
                      disabled={!canAdd}
                      className="counter-btn counter-btn--inc"
                      title={!canAdd ? 'Geo insuficiente' : undefined}
                      style={{ width: 26, height: 26, color: 'var(--gold)', fontSize: '1rem', cursor: canAdd ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
