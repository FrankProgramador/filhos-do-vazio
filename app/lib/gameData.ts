import { apiFetch } from '@/app/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────

export type Atributos = {
  poder: number
  saber: number
  casca: number
  graca: number
  coracao: number
  estamina: number
  alma: number
  velocidade: number
  fofo: number
  assustador: number
}

export type Modifier = {
  id: number
  attribute: keyof Atributos
  operation: 'add' | 'subtract' | 'multiply' | 'set'
  value: number
}

export type Size = Atributos & {
  id: number
  slug: string
  name: string
  description: string | null
  image: string | null
  sustento_inicial: number
  sustento_maximo: number
  order?: number | null
}

export type TraitCategory = 'body' | 'senses' | 'movement' | 'defense' | 'social' | 'mystic' | 'personality'
export type TraitRarity = 'common' | 'remarkable' | 'rare' | 'personality'

export type GameTrait = {
  id: number
  slug: string
  name: string
  category: TraitCategory
  rarity: TraitRarity
  description: string
  mechanical_effect: string | null
  roleplay_obligation: string | null
  sustento_cost: number
  max_selections: number
  is_inherent: boolean
  prerequisite_trait_id: number | null
  thumb: string | null
  modifiers: Modifier[]
  sub_traits: GameTrait[]
}

export type Item = {
  id: number
  name: string
  slug: string
  description: string | null
  weight: number
  quality: string | null
  base_price: number
  durability: number | null
  is_consumable: boolean
  type: 'weapon' | 'armor' | 'shield' | 'tool' | 'consumable' | 'accessory' | 'other'
  image: string | null
}

export type EquipmentPackage = {
  id: number
  name: string
  slug: string
  description: string | null
  geo_bonus: number
  image: string | null
  items: Array<Item & { pivot: { quantity: number } }>
}

export type Trilha = {
  id: number
  slug: string
  nome: string
  tipo: 'marcial' | 'mistico'
  thumb: string | null
  nivel: number | null
  beneficios: string
  barra_aumentada: 'estamina' | 'alma'
  aumento: number
}

export type CharSheet = {
  nome: string
  idade: string
  especie: string
  avatar: string | null
  sizeId: number | null
  attrTraits: Record<number, number>
  specialTraits: number[]
  personalityTraits: number[]
  subTraits: number[]
  trilhaId: number | null
  equipmentPackageId: number | null
  purchasedItems: Record<number, number>
  aparencia: string
  historia: string
}

export const MAX_TRACOS = 7
export const MAX_REMARKABLE = 3
export const MAX_RARE = 1
export const REQUIRED_PERSONALITY = 2
export const STARTING_GEO = 50

// ── Personagem persistido (ficha) ───────────────────────────────────────────

export type CharacterTrait = GameTrait & {
  pivot: { quantity: number; is_inherent: boolean; is_personality: boolean; is_extra: boolean }
}

export type CharacterItem = Item & {
  pivot: { quantity: number; durability_remaining: number | null; is_equipped: boolean }
}

export type Character = Atributos & {
  id: number
  user_id: number
  name: string
  age: number | null
  species: string | null
  avatar: string | null
  size_id: number
  trilha_id: number
  sustento: number
  sustento_maximo: number
  geo: number
  xp: number
  level: number
  story: string | null
  appearance: string | null
  size: Size
  trilha: Trilha
  traits: CharacterTrait[]
  items: CharacterItem[]
}

// ── API ───────────────────────────────────────────────────────────────────

export function fetchSizes(): Promise<Size[]> {
  return apiFetch<Size[]>('/api/sizes')
}

export function fetchTraits(): Promise<GameTrait[]> {
  return apiFetch<GameTrait[]>('/api/traits')
}

export function fetchItems(): Promise<Item[]> {
  return apiFetch<Item[]>('/api/items')
}

export function fetchEquipmentPackages(): Promise<EquipmentPackage[]> {
  return apiFetch<EquipmentPackage[]>('/api/equipment-packages')
}

export function fetchCharacters(token: string | null): Promise<Character[]> {
  return apiFetch<Character[]>('/api/characters', {}, token)
}

export function fetchCharacter(id: number | string, token: string | null): Promise<Character> {
  return apiFetch<Character>(`/api/characters/${id}`, {}, token)
}

export function fetchTrilhas(): Promise<Trilha[]> {
  return apiFetch<Trilha[]>('/api/trilhas')
}

// ── Cálculo (espelha Character::calculateAttributes/calculateSustentoSpent no backend) ──

export function applyModifier(current: number, modifier: Modifier): number {
  switch (modifier.operation) {
    case 'add': return current + Number(modifier.value)
    case 'subtract': return current - Number(modifier.value)
    case 'multiply': return current * Number(modifier.value)
    case 'set': return Number(modifier.value)
  }
}

const ATTR_KEYS: Array<keyof Atributos> = [
  'poder', 'saber', 'casca', 'graca', 'coracao', 'estamina', 'alma', 'velocidade', 'fofo', 'assustador',
]

export function baselineAttributes(size: Size): Atributos {
  return ATTR_KEYS.reduce((acc, key) => ({ ...acc, [key]: Number(size[key]) }), {} as Atributos)
}

/**
 * Traço selecionado com a quantidade de vezes escolhida (1 para a maioria,
 * N para traços de atributo multi-pick como "Poderoso").
 */
export type SelectedTrait = { trait: GameTrait; quantity: number }

export function calculateAttributes(size: Size, selected: SelectedTrait[]): Atributos {
  const attrs = baselineAttributes(size)

  for (const { trait, quantity } of selected) {
    for (const modifier of trait.modifiers) {
      for (let i = 0; i < quantity; i++) {
        attrs[modifier.attribute] = applyModifier(attrs[modifier.attribute], modifier)
      }
    }
  }

  return attrs
}

/**
 * Sustento não é mais um orçamento gasto por traços/atributos — é só a quantidade
 * de Ração necessária por descanso, fixa por tamanho (Pequeno=1, Médio=2, Grande=3).
 * Traços são escolhidos livremente; o balanceamento do jogo vem dos próprios
 * atributos (ex: Fraco já custa -1 Poder), não de um orçamento separado.
 */
export function sustentoNecessario(size: Size): number {
  return size.sustento_maximo
}

/**
 * Conta traços para o limite de criação: sub-traços contam como o traço comum/
 * marcante/raro que são (pela própria raridade), e traços multi-pick contam
 * 1x por vez escolhida.
 */
export function countCappedTraits(selected: SelectedTrait[]): number {
  return selected.reduce((total, { quantity }) => total + quantity, 0)
}

export function countCappedByRarity(selected: SelectedTrait[], rarity: TraitRarity): number {
  return selected
    .filter(({ trait }) => trait.rarity === rarity)
    .reduce((total, { quantity }) => total + quantity, 0)
}
