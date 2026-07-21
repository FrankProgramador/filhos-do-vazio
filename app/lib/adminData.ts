import { apiFetch } from '@/app/lib/api'
import type {
  Ability, AbilityTargetFilterValue, AbilityTargetTypeValue, AbilityTriggerEventValue,
  Attribute, Behavior, BehaviorFieldDefinition, Calculation, CalculationComponent,
  Condition, DiceSkin, DiceSkinRarityValue, Element, EquipmentPackage, GameEffect, GameResource, GameTrait,
  Item, Size, StepConditionOperandValue, StepConditionOperatorValue, StepConditionOwnerValue,
  StepConditionTypeValue, Tag, Trilha,
} from '@/app/lib/gameData'
import type { Book, BookType, Chapter, ContentStatus, Section, TipTapDoc } from '@/app/lib/bookData'

function authed<T>(path: string, token: string | null, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(path, options, token)
}

// ── Sizes ────────────────────────────────────────────────────────────────

export type SizePayload = Omit<Size, 'id'>

export const adminSizes = {
  list: (token: string | null) => authed<Size[]>('/api/admin/sizes', token),
  create: (token: string | null, data: SizePayload) =>
    authed<Size>('/api/admin/sizes', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: SizePayload) =>
    authed<Size>(`/api/admin/sizes/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/sizes/${id}`, token, { method: 'DELETE' }),
}

// ── Trilhas ──────────────────────────────────────────────────────────────

export type TrilhaPayload = Omit<Trilha, 'id' | 'abilities'>

export const adminTrilhas = {
  list: (token: string | null) => authed<Trilha[]>('/api/admin/trilhas', token),
  create: (token: string | null, data: TrilhaPayload) =>
    authed<Trilha>('/api/admin/trilhas', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: TrilhaPayload) =>
    authed<Trilha>(`/api/admin/trilhas/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/trilhas/${id}`, token, { method: 'DELETE' }),
}

// ── Items ────────────────────────────────────────────────────────────────

export type ItemPayload = Omit<Item, 'id' | 'abilities'> & {
  /** FKs cruas pro save — `Item.abilities` (objetos aninhados) só existe na leitura. */
  ability_ids: number[]
}

export const adminItems = {
  list: (token: string | null) => authed<Item[]>('/api/admin/items', token),
  create: (token: string | null, data: ItemPayload) =>
    authed<Item>('/api/admin/items', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: ItemPayload) =>
    authed<Item>(`/api/admin/items/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/items/${id}`, token, { method: 'DELETE' }),
}

// ── Traits ───────────────────────────────────────────────────────────────

export type TraitModifierPayload = { attribute: string; operation: 'add' | 'subtract' | 'multiply' | 'set'; value: number }

export type TraitPayload = Omit<GameTrait, 'id' | 'modifiers' | 'sub_traits' | 'tags'> & {
  modifiers: TraitModifierPayload[]
  tag_ids: number[]
}

export const adminTraits = {
  list: (token: string | null) => authed<GameTrait[]>('/api/admin/traits', token),
  create: (token: string | null, data: TraitPayload) =>
    authed<GameTrait>('/api/admin/traits', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: TraitPayload) =>
    authed<GameTrait>(`/api/admin/traits/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/traits/${id}`, token, { method: 'DELETE' }),
}

// ── Tags ─────────────────────────────────────────────────────────────────

export type TagPayload = Omit<Tag, 'id' | 'slug'> & { slug?: string }

export const adminTags = {
  list: (token: string | null, group?: string) =>
    authed<Tag[]>(`/api/admin/tags${group ? `?group=${group}` : ''}`, token),
  create: (token: string | null, data: TagPayload) =>
    authed<Tag>('/api/admin/tags', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: TagPayload) =>
    authed<Tag>(`/api/admin/tags/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/tags/${id}`, token, { method: 'DELETE' }),
}

// ── Equipment Packages ───────────────────────────────────────────────────

export type EquipmentPackageItemPayload = { item_id: number; quantity: number }

export type EquipmentPackagePayload = Omit<EquipmentPackage, 'id' | 'items'> & {
  items: EquipmentPackageItemPayload[]
}

export const adminPackages = {
  list: (token: string | null) => authed<EquipmentPackage[]>('/api/admin/equipment-packages', token),
  create: (token: string | null, data: EquipmentPackagePayload) =>
    authed<EquipmentPackage>('/api/admin/equipment-packages', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: EquipmentPackagePayload) =>
    authed<EquipmentPackage>(`/api/admin/equipment-packages/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/equipment-packages/${id}`, token, { method: 'DELETE' }),
}

// ── Abilities ────────────────────────────────────────────────────────────

export type AbilityStepEffectPayload = { effect_id: number; calculation_id: number | null; order: number }

export type StepConditionPayload = {
  type: StepConditionTypeValue
  left_type?: StepConditionOperandValue | null
  left_value?: string | null
  left_ref_id?: number | null
  left_owner?: StepConditionOwnerValue | null
  operator?: StepConditionOperatorValue | null
  right_type?: StepConditionOperandValue | null
  right_value?: string | null
  right_ref_id?: number | null
  right_owner?: StepConditionOwnerValue | null
  condition_owner?: StepConditionOwnerValue | null
  condition_id?: number | null
  children: StepConditionPayload[]
}

/**
 * Árvore recursiva: só steps raiz (sem parent_step_id, implícito por não estarem
 * dentro de `children` de outro) têm `trigger`. `is_else` marca o ramo "senão" de um
 * pai condicional.
 */
export type AbilityStepPayload = {
  id?: number
  is_else?: boolean
  trigger?: AbilityTriggerEventValue | null
  priority: number
  order: number
  condition: StepConditionPayload | null
  step_effects: AbilityStepEffectPayload[]
  children: AbilityStepPayload[]
}

export type AbilityPayload = Omit<Ability, 'id' | 'steps' | 'resource' | 'range_calculation'> & {
  target_type: AbilityTargetTypeValue
  target_filter: AbilityTargetFilterValue
  /** FK crua pro save — `Ability.resource` (objeto aninhado) só existe na leitura. */
  resource_id: number | null
  /** FK crua pro save — `Ability.range_calculation` (objeto aninhado) só existe na leitura. */
  range_calculation_id: number | null
  steps: AbilityStepPayload[]
}

// ── Ataque simples (editor guiado, sem Effect/Calculation manuais) ─────────

export type SimpleAttackAmountSource =
  | { kind: 'fixed'; value: number }
  | { kind: 'weapon_damage' }
  | { kind: 'weapon_block' }
  | { kind: 'attribute'; attribute_id: number | null; multiplier: number | null }

export type SimpleAttackAction =
  | { type: 'damage'; amount: SimpleAttackAmountSource; element_id: number | null; cap_attribute_id: number | null }
  | { type: 'apply_condition'; condition_id: number | null; owner: StepConditionOwnerValue }

export type SimpleAttackConditionSource =
  | { kind: 'hits'; operator: StepConditionOperatorValue; value: number }
  | { kind: 'resource'; resource_id: number | null; owner: StepConditionOwnerValue; operator: StepConditionOperatorValue; value: number }
  | { kind: 'attribute'; attribute_id: number | null; owner: StepConditionOwnerValue; operator: StepConditionOperatorValue; value: number }

export type SimpleAttackRulePayload = { action: SimpleAttackAction }
export type SimpleAttackExtraRulePayload = { condition: SimpleAttackConditionSource; action: SimpleAttackAction }

export type SimpleAttackAbilityPayload = {
  name: string
  slug: string
  description: string
  icon: string | null
  display_order: number
  atributo: 'poder' | 'graca' | 'casca' | 'saber'
  resource_id: number | null
  custo: number
  base_rule: SimpleAttackRulePayload
  extra_rules: SimpleAttackExtraRulePayload[]
}

export const adminAbilities = {
  list: (token: string | null) => authed<Ability[]>('/api/admin/abilities', token),
  create: (token: string | null, data: AbilityPayload) =>
    authed<Ability>('/api/admin/abilities', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: AbilityPayload) =>
    authed<Ability>(`/api/admin/abilities/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/abilities/${id}`, token, { method: 'DELETE' }),
  createSimpleAttack: (token: string | null, data: SimpleAttackAbilityPayload) =>
    authed<Ability>('/api/admin/abilities/simple-attack', token, { method: 'POST', body: JSON.stringify(data) }),
  updateSimpleAttack: (token: string | null, id: number, data: SimpleAttackAbilityPayload) =>
    authed<Ability>(`/api/admin/abilities/${id}/simple-attack`, token, { method: 'PUT', body: JSON.stringify(data) }),
}

// ── Attributes ───────────────────────────────────────────────────────────

export type AttributePayload = Omit<Attribute, 'id'>

export const adminAttributes = {
  list: (token: string | null) => authed<Attribute[]>('/api/admin/attributes', token),
  create: (token: string | null, data: AttributePayload) =>
    authed<Attribute>('/api/admin/attributes', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: AttributePayload) =>
    authed<Attribute>(`/api/admin/attributes/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/attributes/${id}`, token, { method: 'DELETE' }),
}

// ── Resources ────────────────────────────────────────────────────────────

export type ResourcePayload = Omit<GameResource, 'id'>

export const adminResources = {
  list: (token: string | null) => authed<GameResource[]>('/api/admin/resources', token),
  create: (token: string | null, data: ResourcePayload) =>
    authed<GameResource>('/api/admin/resources', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: ResourcePayload) =>
    authed<GameResource>(`/api/admin/resources/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/resources/${id}`, token, { method: 'DELETE' }),
}

// ── Elements ─────────────────────────────────────────────────────────────

export type ElementPayload = Omit<Element, 'id'>

export const adminElements = {
  list: (token: string | null) => authed<Element[]>('/api/admin/elements', token),
  create: (token: string | null, data: ElementPayload) =>
    authed<Element>('/api/admin/elements', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: ElementPayload) =>
    authed<Element>(`/api/admin/elements/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/elements/${id}`, token, { method: 'DELETE' }),
}

// ── Conditions ───────────────────────────────────────────────────────────

export type ConditionPayload = Omit<Condition, 'id'>

export const adminConditions = {
  list: (token: string | null) => authed<Condition[]>('/api/admin/conditions', token),
  create: (token: string | null, data: ConditionPayload) =>
    authed<Condition>('/api/admin/conditions', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: ConditionPayload) =>
    authed<Condition>(`/api/admin/conditions/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/conditions/${id}`, token, { method: 'DELETE' }),
}

// ── Behaviors ────────────────────────────────────────────────────────────

export type BehaviorFieldDefinitionPayload = Omit<BehaviorFieldDefinition, 'behavior_id' | 'id'> & { id?: number }

export type BehaviorPayload = Omit<Behavior, 'id' | 'field_definitions'> & {
  field_definitions: BehaviorFieldDefinitionPayload[]
}

export const adminBehaviors = {
  list: (token: string | null) => authed<Behavior[]>('/api/admin/behaviors', token),
  create: (token: string | null, data: BehaviorPayload) =>
    authed<Behavior>('/api/admin/behaviors', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: BehaviorPayload) =>
    authed<Behavior>(`/api/admin/behaviors/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/behaviors/${id}`, token, { method: 'DELETE' }),
}

// ── Calculations ─────────────────────────────────────────────────────────

export type CalculationComponentPayload = Omit<CalculationComponent, 'calculation_id' | 'id'> & { id?: number }

export type CalculationPayload = Omit<Calculation, 'id' | 'components'> & {
  components: CalculationComponentPayload[]
}

export const adminCalculations = {
  list: (token: string | null) => authed<Calculation[]>('/api/admin/calculations', token),
  create: (token: string | null, data: CalculationPayload) =>
    authed<Calculation>('/api/admin/calculations', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: CalculationPayload) =>
    authed<Calculation>(`/api/admin/calculations/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/calculations/${id}`, token, { method: 'DELETE' }),
}

// ── Effects ──────────────────────────────────────────────────────────────

export type BehaviorFieldValuePayload = { behavior_field_definition_id: number; value: string | null }

export type EffectPayload = Omit<GameEffect, 'id' | 'behavior' | 'element' | 'behavior_field_values'> & {
  behavior_field_values: BehaviorFieldValuePayload[]
}

export const adminEffects = {
  list: (token: string | null) => authed<GameEffect[]>('/api/admin/effects', token),
  create: (token: string | null, data: EffectPayload) =>
    authed<GameEffect>('/api/admin/effects', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: EffectPayload) =>
    authed<GameEffect>(`/api/admin/effects/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/effects/${id}`, token, { method: 'DELETE' }),
}

// ── Livros ───────────────────────────────────────────────────────────────

export type BookPayload = {
  title: string
  slug?: string
  type: BookType
  description?: string | null
  cover_image?: string | null
  version?: string
  order?: number
}

export const adminBooks = {
  list: (token: string | null) => authed<Book[]>('/api/admin/livros', token),
  create: (token: string | null, data: BookPayload) =>
    authed<Book>('/api/admin/livros', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: BookPayload) =>
    authed<Book>(`/api/admin/livros/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/livros/${id}`, token, { method: 'DELETE' }),
  publish: (token: string | null, id: number) =>
    authed<Book>(`/api/admin/livros/${id}/publicar`, token, { method: 'POST' }),
  import: (token: string | null, path?: string, fresh?: boolean) =>
    authed<{ message: string }>('/api/admin/livros/importar', token, {
      method: 'POST',
      body: JSON.stringify({ path, fresh }),
    }),
}

// ── Capítulos ────────────────────────────────────────────────────────────

export type ChapterPayload = {
  title: string
  slug?: string
  description?: string | null
  status?: ContentStatus
  order?: number
}

export const adminChapters = {
  list: (token: string | null, bookId: number) => authed<Chapter[]>(`/api/admin/livros/${bookId}/capitulos`, token),
  create: (token: string | null, bookId: number, data: ChapterPayload) =>
    authed<Chapter>(`/api/admin/livros/${bookId}/capitulos`, token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, chapterId: number, data: ChapterPayload) =>
    authed<Chapter>(`/api/admin/capitulos/${chapterId}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, chapterId: number) =>
    authed<{ message: string }>(`/api/admin/capitulos/${chapterId}`, token, { method: 'DELETE' }),
  reorder: (token: string | null, bookId: number, ids: number[]) =>
    authed<Chapter[]>(`/api/admin/livros/${bookId}/capitulos/reordenar`, token, {
      method: 'PUT',
      body: JSON.stringify({ ids }),
    }),
}

// ── Seções ───────────────────────────────────────────────────────────────

export type SectionPayload = {
  title: string
  slug?: string
  content?: TipTapDoc | null
  status?: ContentStatus
  order?: number
}

export const adminSections = {
  list: (token: string | null, bookId: number, chapterId: number) =>
    authed<Section[]>(`/api/admin/livros/${bookId}/capitulos/${chapterId}/secoes`, token),
  create: (token: string | null, bookId: number, chapterId: number, data: SectionPayload) =>
    authed<Section>(`/api/admin/livros/${bookId}/capitulos/${chapterId}/secoes`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (token: string | null, sectionId: number, data: SectionPayload) =>
    authed<Section>(`/api/admin/secoes/${sectionId}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, sectionId: number) =>
    authed<{ message: string }>(`/api/admin/secoes/${sectionId}`, token, { method: 'DELETE' }),
  reorder: (token: string | null, bookId: number, chapterId: number, ids: number[]) =>
    authed<Section[]>(`/api/admin/livros/${bookId}/capitulos/${chapterId}/secoes/reordenar`, token, {
      method: 'PUT',
      body: JSON.stringify({ ids }),
    }),
}

// ── Skins de dado ────────────────────────────────────────────────────────

export type DiceSkinPayload = {
  name: string
  slug: string
  description?: string | null
  rarity: DiceSkinRarityValue
  foreground_color: string
  background_color: string
  material: string
  texture: string
  pip_style: boolean
  total_supply: number
}

export const adminDiceSkins = {
  list: (token: string | null) => authed<DiceSkin[]>('/api/admin/dice-skins', token),
  create: (token: string | null, data: DiceSkinPayload) =>
    authed<DiceSkin>('/api/admin/dice-skins', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: DiceSkinPayload) =>
    authed<DiceSkin>(`/api/admin/dice-skins/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/dice-skins/${id}`, token, { method: 'DELETE' }),
}
