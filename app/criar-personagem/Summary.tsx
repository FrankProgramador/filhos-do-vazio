import type { Atributos, CharSheet, EquipmentPackage, GameTrait, Item, Size, Trilha } from '@/app/lib/gameData'
import { STARTING_GEO } from '@/app/lib/gameData'
import CharacterSheetCard, { type CharacterSheetItem, type CharacterSheetTrait } from '@/components/CharacterSheetCard'

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
  if (!size) return null

  // Monta a mesma forma de traço/item com pivot que a ficha salva usa, a partir
  // das escolhas ainda em rascunho — assim o CharacterSheetCard não precisa saber
  // se o personagem já existe ou não.
  const attrTraitEntries = Object.entries(sheet.attrTraits)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => ({ trait: traits.find(t => t.id === Number(id)), count }))
    .filter((x): x is { trait: GameTrait; count: number } => !!x.trait)

  const pickedTraitIds = [...sheet.specialTraits, ...sheet.personalityTraits, ...sheet.subTraits]
  const pickedTraits: CharacterSheetTrait[] = [
    ...attrTraitEntries.map(({ trait, count }) => ({ ...trait, pivot: { quantity: count, is_extra: false } })),
    ...pickedTraitIds
      .map(id => traits.find(t => t.id === id))
      .filter((t): t is GameTrait => !!t)
      .map(trait => ({ ...trait, pivot: { quantity: 1, is_extra: false } })),
  ]

  const selectedPackage = packages.find(p => p.id === sheet.equipmentPackageId) ?? null
  const geoBudget = STARTING_GEO + (selectedPackage?.geo_bonus ?? 0)
  const purchasedEntries = Object.entries(sheet.purchasedItems)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ item: items.find(i => i.id === Number(id)), qty }))
    .filter((x): x is { item: Item; qty: number } => !!x.item)
  const geoSpent = purchasedEntries.reduce((total, { item, qty }) => total + item.base_price * qty, 0)
  const geoRemaining = geoBudget - geoSpent

  const pickedItems: CharacterSheetItem[] = [
    ...(selectedPackage?.items.map(item => ({ ...item, pivot: { quantity: item.pivot.quantity, is_equipped: false, durability_remaining: item.durability, slot: null } })) ?? []),
    ...purchasedEntries.map(({ item, qty }) => ({ ...item, pivot: { quantity: qty, is_equipped: false, durability_remaining: item.durability, slot: null } })),
  ]

  return (
    <div className="flex flex-col gap-8">
      <CharacterSheetCard character={{
        name: sheet.nome,
        avatar: sheet.avatar,
        age: sheet.idade,
        species: sheet.especie,
        geo: geoRemaining,
        sustento,
        size,
        trilha,
        atributos,
        traits: pickedTraits,
        items: pickedItems,
        appearance: sheet.aparencia,
        story: sheet.historia,
      }} />

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
