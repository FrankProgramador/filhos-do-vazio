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
  playable: boolean
  image: string | null
  sustento_inicial: number
  sustento_maximo: number
  order?: number | null
}

export type TraitTipo = 'personalidade' | 'atributo' | 'especial'
export type TraitRarity = 'common' | 'remarkable' | 'rare' | 'personality'

export type TagGroup = 'tracos' | 'armas' | 'habilidades' | 'lore'

export type Tag = {
  id: number
  name: string
  slug: string
  group: TagGroup
  color: string | null
  icon: string | null
  description: string | null
}

export type GameTrait = {
  id: number
  slug: string
  name: string
  tipo: TraitTipo
  rarity: TraitRarity
  description: string
  mechanical_effect: string | null
  roleplay_obligation: string | null
  max_selections: number
  prerequisite_trait_id: number | null
  thumb: string | null
  modifiers: Modifier[]
  sub_traits: GameTrait[]
  tags: Tag[]
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
  /** Dano concedido no 1º acerto de um ataque com essa arma (acertos extras somam +1 cada). */
  base_damage: number | null
  /** Redução de dano concedida no 1º acerto de um bloqueio com esse escudo (acertos extras somam +1 cada). */
  block_value: number | null
  /** Ocupa mão principal + auxiliar — equipar aqui desequipa (e trava) a auxiliar. */
  is_two_handed: boolean
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
  /** Habilidades de nível 1 desta trilha — é tudo que /api/trilhas retorna aqui. */
  abilities: Ability[]
}

export type EffectFieldTypeValue =
  | 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multi_select'
  | 'attribute' | 'resource' | 'condition' | 'dice' | 'expression' | 'entity' | 'effect' | 'target' | 'direction'
  | 'calculation'

/** Atributo cadastrável (Força, Casca, Graça...) — usado pela engine de Effects/Calculations. */
export type Attribute = {
  id: number
  name: string
  slug: string
  description: string | null
  order: number
}

/** Recurso cadastrável (Vida, Alma, Estamina...) — usado pela engine de Effects/Calculations. */
export type GameResource = {
  id: number
  name: string
  slug: string
  description: string | null
  order: number
}

/** Natureza/classificação de um Effect (Physical, Fire, Sacred...). */
export type Element = {
  id: number
  name: string
  slug: string
  description: string | null
}

export type SelectOption = { label: string; value: string }

export type DiceSkinRarityValue = 'comum' | 'raro' | 'epico' | 'lendario'

/** Skin colecionável de dado 3D — cor/material/textura + oferta limitada. */
export type DiceSkin = {
  id: number
  name: string
  slug: string
  description: string | null
  rarity: DiceSkinRarityValue
  foreground_color: string
  background_color: string
  material: string
  texture: string
  /** Face com pips (bolinhas) em vez de números. */
  pip_style: boolean
  total_supply: number
  /** Só presente na listagem do admin (calculado, não é uma coluna). */
  remaining_supply?: number
}

/** DiceSkin possuída por um usuário — inclui os campos do pivot `user_dice_skins`. */
export type OwnedDiceSkin = DiceSkin & {
  quantity: number
  order: number
}

/** Diz COMO a engine executa um Effect (o algoritmo: Damage, Heal, Move...). */
export type BehaviorFieldDefinition = {
  id: number
  behavior_id: number
  name: string
  label: string
  description: string | null
  field_type: EffectFieldTypeValue
  is_required: boolean
  default_value: string | null
  min_value: number | null
  max_value: number | null
  options: SelectOption[] | null
  order: number
}

export type Behavior = {
  id: number
  name: string
  slug: string
  description: string | null
  requires_calculation: boolean
  field_definitions: BehaviorFieldDefinition[]
}

export type BehaviorFieldValue = {
  id: number
  effect_id: number
  behavior_field_definition_id: number
  value: string | null
}

export type CalculationOperationValue = 'add' | 'subtract' | 'multiply' | 'divide' | 'max' | 'min'
export type CalculationSourceTypeValue =
  | 'fixed_value' | 'attribute' | 'resource' | 'fixed_dice' | 'attribute_dice' | 'distance' | 'context' | 'position'

export type CalculationComponent = {
  id: number
  calculation_id: number
  order: number
  operation: CalculationOperationValue
  source_type: CalculationSourceTypeValue
  source_id: number | null
  value: number | null
}

/** Calculation é só VALUE — retorna um número via seus components. Lógica condicional vive em StepCondition. */
export type Calculation = {
  id: number
  name: string
  slug: string
  description: string | null
  components: CalculationComponent[]
}

/** Catálogo de condições de status (Envenenado, Atordoado...) — referenciado por StepCondition (HAS_CONDITION). */
export type Condition = {
  id: number
  name: string
  slug: string
  description: string | null
}

export type EffectTargetValue = 'self' | 'target' | 'source' | 'owner'

export type GameEffect = {
  id: number
  behavior_id: number
  element_id: number | null
  target: EffectTargetValue
  name: string
  slug: string
  description: string | null
  behavior: Behavior
  element: Element | null
  behavior_field_values: BehaviorFieldValue[]
}

export type AbilityTargetTypeValue = 'self' | 'single' | 'area' | 'line' | 'cone'
export type AbilityTargetFilterValue = 'ally' | 'enemy' | 'any'
export type AbilityTriggerEventValue =
  | 'on_turn_start' | 'on_turn_end' | 'on_attack' | 'on_defend' | 'on_hit' | 'on_use' | 'on_move' | 'on_dodge'
  | 'on_enemy_enters_adjacent' | 'on_opposed_test' | 'on_spell_damage' | 'on_focus' | 'on_death' | 'on_kill' | 'on_craft'
  | 'on_before_attack' | 'on_miss' | 'on_receive_attack' | 'on_receive_hit' | 'on_any'

export type StepConditionTypeValue = 'compare' | 'has_condition' | 'and' | 'or'
export type StepConditionOperandValue = 'fixed' | 'attribute' | 'resource' | 'context'
export type StepConditionOwnerValue = 'self' | 'target' | 'source'
export type StepConditionOperatorValue = '>' | '<' | '>=' | '<=' | '==' | '!='

/**
 * Árvore de condições: COMPARE (esquerda operador direita), HAS_CONDITION (alvo tem
 * a Condition X?) ou AND/OR (combinando `children`). Substitui o uso de Calculation
 * como lógica condicional.
 */
export type StepCondition = {
  id: number
  type: StepConditionTypeValue
  parent_condition_id: number | null
  left_type: StepConditionOperandValue | null
  left_value: string | null
  left_ref_id: number | null
  left_owner: StepConditionOwnerValue | null
  operator: StepConditionOperatorValue | null
  right_type: StepConditionOperandValue | null
  right_value: string | null
  right_ref_id: number | null
  right_owner: StepConditionOwnerValue | null
  condition_owner: StepConditionOwnerValue | null
  condition_id: number | null
  children: StepCondition[]
}

export type AbilityStepEffect = {
  id: number
  ability_step_id: number
  effect_id: number
  calculation_id: number | null
  order: number
  effect: GameEffect
  calculation: Calculation | null
}

/**
 * AbilityStep é uma árvore de if/else: `parent_step_id`/`is_else` ligam um step a um
 * pai condicional (o filho `is_else=false` roda se a condition do pai for verdadeira,
 * o `is_else=true` roda senão). Só steps raiz (`parent_step_id` null) têm `trigger`.
 * `priority` = ordem entre steps raiz do MESMO trigger (entre fontes/abilities
 * diferentes); `order` = ordem entre irmãos (raízes ou filhos do mesmo pai).
 */
export type AbilityStep = {
  id: number
  ability_id: number
  parent_step_id: number | null
  is_else: boolean
  trigger: AbilityTriggerEventValue | null
  priority: number
  order: number
  child_steps: AbilityStep[]
  condition_link: { id: number; step_condition: StepCondition } | null
  step_effects: AbilityStepEffect[]
}

export type Ability = {
  id: number
  name: string
  slug: string
  description: string
  icon: string | null
  is_passive: boolean
  is_hidden: boolean
  display_order: number
  range: number | null
  target_type: AbilityTargetTypeValue
  target_filter: AbilityTargetFilterValue
  cooldown_base: number | null
  steps: AbilityStep[]
  /** Atributo cujo valor determina a quantidade base de dados na rolagem — toda rolagem exige um. */
  atributo: keyof Atributos | null
  /** Recurso gasto no Esforço (dados extra); null = Esforço não disponível pra essa habilidade. */
  resource: GameResource | null
  /** Se true, resolvida com uma arma/escudo equipado na mão relevante usa o dano/bloqueio base do item em vez do baseline desarmado. */
  usa_dano_arma: boolean
  /** true pras habilidades concedidas automaticamente a todo personagem (ex: Ataque Desarmado). */
  is_innate: boolean
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
export const MAX_ATTR_TRAITS = 7
export const MAX_REMARKABLE = 3
export const MAX_RARE = 1
export const REQUIRED_PERSONALITY = 2
export const STARTING_GEO = 50

// ── Personagem persistido (ficha) ───────────────────────────────────────────

export type CharacterTrait = GameTrait & {
  pivot: { quantity: number; is_inherent: boolean; is_personality: boolean; is_extra: boolean }
}

export type CharacterItem = Item & {
  pivot: { quantity: number; durability_remaining: number | null; is_equipped: boolean; slot: string | null }
}

/** Um `actor_resource` (current/max persistido) do personagem — Coração, Estamina, Alma, Deslocamento, Fome. */
export type CharacterResourceEntry = {
  id: number
  resource_id: number
  base: number
  current: number
  resource: GameResource
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
  abilities: Ability[]
  resources: CharacterResourceEntry[]
}

// ── API ───────────────────────────────────────────────────────────────────

export function fetchSizes(): Promise<Size[]> {
  return apiFetch<Size[]>('/api/sizes')
}

export function fetchTraits(): Promise<GameTrait[]> {
  return apiFetch<GameTrait[]>('/api/traits')
}

export function fetchTags(group?: TagGroup): Promise<Tag[]> {
  return apiFetch<Tag[]>(`/api/tags${group ? `?group=${group}` : ''}`)
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

/**
 * Custo em Estamina/Alma/Coração (o que a habilidade usar) de comprar dados extra no
 * Esforço — progressão triangular: nível 1 custa 1, nível 2 mais 2 (total 3), nível 3
 * mais 3 (total 6)... Mesma fórmula de `ArenaRules::triangularCost` no backend.
 */
export function triangularCost(diceCount: number): number {
  return (diceCount * (diceCount + 1)) / 2
}

/** Ajusta o valor atual de um recurso (Coração/Estamina/Alma/Deslocamento/Fome) — clicar num pip, gastar Esforço, etc. */
export function updateCharacterResource(characterId: number, slug: string, current: number, token: string | null): Promise<Character> {
  return apiFetch<Character>(`/api/characters/${characterId}/resources/${slug}`, {
    method: 'PATCH', body: JSON.stringify({ current }),
  }, token)
}

/** Equipa (slot != null) ou desequipa (slot = null) um item num slot da ficha. */
export function updateCharacterItemSlot(characterId: number, itemId: number, slot: string | null, token: string | null): Promise<Character> {
  return apiFetch<Character>(`/api/characters/${characterId}/items/${itemId}/slot`, {
    method: 'PATCH', body: JSON.stringify({ slot }),
  }, token)
}

/** Ajusta quantas refeições do dia já foram consumidas (0..sustento_maximo). */
export function updateCharacterSustento(characterId: number, sustento: number, token: string | null): Promise<Character> {
  return apiFetch<Character>(`/api/characters/${characterId}`, {
    method: 'PATCH', body: JSON.stringify({ sustento }),
  }, token)
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

/**
 * Estamina e Alma não são mais valores fixos por tamanho — são derivados como
 * 3 + Graça e 3 + Saber (já com os modificadores de traço aplicados a esses dois
 * atributos). Modificadores que afetam estamina/alma diretamente (ex: Devoto) são
 * adiados e aplicados só depois dessa derivação, para não serem sobrescritos.
 */
export function calculateAttributes(size: Size, selected: SelectedTrait[]): Atributos {
  const attrs = baselineAttributes(size)
  const deferred: Array<{ modifier: Modifier; quantity: number }> = []

  for (const { trait, quantity } of selected) {
    for (const modifier of trait.modifiers) {
      if (modifier.attribute === 'estamina' || modifier.attribute === 'alma') {
        deferred.push({ modifier, quantity })
        continue
      }
      for (let i = 0; i < quantity; i++) {
        attrs[modifier.attribute] = applyModifier(attrs[modifier.attribute], modifier)
      }
    }
  }

  attrs.estamina = 3 + attrs.graca
  attrs.alma = 3 + attrs.saber

  for (const { modifier, quantity } of deferred) {
    for (let i = 0; i < quantity; i++) {
      attrs[modifier.attribute] = applyModifier(attrs[modifier.attribute], modifier)
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

// ── Coleção de skins de dado ────────────────────────────────────────────

/** Coleção do usuário autenticado, já ordenada pela ordem de rotação que ele escolheu. */
export function fetchMyDiceSkins(token: string | null): Promise<OwnedDiceSkin[]> {
  return apiFetch<OwnedDiceSkin[]>('/api/me/dice-skins', {}, token)
}

export type DiceSkinDrawResult = { message: string; skin: DiceSkin | null }

/** Sorteio grátis (1x por 24h) — se já sorteou nas últimas 24h, rejeita com ApiError (status 429, mensagem pronta pro usuário). */
export function drawDailyDiceSkin(token: string | null): Promise<DiceSkinDrawResult> {
  return apiFetch<DiceSkinDrawResult>('/api/dice-skins/sorteio', { method: 'POST' }, token)
}

export function reorderMyDiceSkins(token: string | null, ids: number[]): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/api/me/dice-skins/reordenar', { method: 'PUT', body: JSON.stringify({ ids }) }, token)
}
