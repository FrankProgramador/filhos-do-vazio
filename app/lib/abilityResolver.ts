import type {
  Ability,
  AbilityStep,
  Atributos,
  Calculation,
  CalculationComponent,
  CharacterResourceEntry,
  StepCondition,
} from '@/app/lib/gameData'

/**
 * Valores nomeados disponíveis pra um Cálculo/Condição via source_type/left_type/right_type='context'.
 * Montado pela ficha a partir da rolagem atual (hits) + item equipado na mão em uso.
 */
export type RollContext = {
  hits: number
  weapon_base_damage: number | null
  weapon_block_value: number | null
  weapon_weight: number | null
}

function resourceCurrent(resources: CharacterResourceEntry[], resourceId: number | null): number {
  if (resourceId === null) return 0
  return resources.find((r) => r.resource_id === resourceId)?.current ?? 0
}

function contextValue(ctx: RollContext, key: string | null): number {
  if (!key) return 0
  const value = ctx[key as keyof RollContext]
  return typeof value === 'number' ? value : 0
}

function resolveComponentValue(
  component: CalculationComponent,
  atributos: Atributos,
  resources: CharacterResourceEntry[],
  ctx: RollContext
): number {
  switch (component.source_type) {
    case 'fixed_value':
      return component.value ?? 0
    case 'attribute':
      return component.source_id !== null ? Number(atributos[attributeKeyById(component.source_id) as keyof Atributos] ?? 0) : 0
    case 'resource':
      return resourceCurrent(resources, component.source_id)
    case 'context':
      return contextValue(ctx, component.context_key)
    // fixed_dice/attribute_dice/distance/position: fora de escopo hoje (sem rolagem de soma
    // nem distância/posição na ficha) — tratados como neutros pra não quebrar o fold.
    default:
      return 0
  }
}

/**
 * source_id de um componente 'attribute' referencia o id do Attribute no banco — que só
 * seed 6 dos 10 campos de Atributos (coracao/estamina/alma/velocidade vivem como Resource,
 * não como Attribute). Mapeado por id fixo (confirmado via tinker: 1=poder, 2=casca,
 * 3=graca, 4=saber, 5=fofo, 6=assustador) pra evitar mais uma chamada de rede só pra
 * resolver slug por id.
 */
const ATTR_KEY_BY_ATTRIBUTE_ID: Record<number, keyof Atributos> = {
  1: 'poder',
  2: 'casca',
  3: 'graca',
  4: 'saber',
  5: 'fofo',
  6: 'assustador',
}

function attributeKeyById(id: number): keyof Atributos {
  return ATTR_KEY_BY_ATTRIBUTE_ID[id] ?? 'poder'
}

export function resolveCalculation(
  calc: Calculation,
  atributos: Atributos,
  resources: CharacterResourceEntry[],
  ctx: RollContext
): number {
  const components = [...calc.components].sort((a, b) => a.order - b.order)
  if (components.length === 0) return 0

  let acc = resolveComponentValue(components[0], atributos, resources, ctx)

  for (const component of components.slice(1)) {
    const value = resolveComponentValue(component, atributos, resources, ctx)
    switch (component.operation) {
      case 'add':
        acc += value
        break
      case 'subtract':
        acc -= value
        break
      case 'multiply':
        acc *= value
        break
      case 'divide':
        acc = value !== 0 ? acc / value : acc
        break
      case 'max':
        acc = Math.max(acc, value)
        break
      case 'min':
        acc = Math.min(acc, value)
        break
    }
  }

  return acc
}

function resolveOperand(
  type: StepCondition['left_type'],
  value: string | null,
  refId: number | null,
  atributos: Atributos,
  resources: CharacterResourceEntry[],
  ctx: RollContext
): number {
  switch (type) {
    case 'fixed':
      return Number(value ?? 0)
    case 'attribute':
      return refId !== null ? Number(atributos[attributeKeyById(refId)] ?? 0) : 0
    case 'resource':
      return resourceCurrent(resources, refId)
    case 'context':
      return contextValue(ctx, value)
    default:
      return 0
  }
}

export function evaluateCondition(
  cond: StepCondition,
  atributos: Atributos,
  resources: CharacterResourceEntry[],
  ctx: RollContext
): boolean {
  if (cond.type === 'and') {
    return cond.children.every((child) => evaluateCondition(child, atributos, resources, ctx))
  }
  if (cond.type === 'or') {
    return cond.children.some((child) => evaluateCondition(child, atributos, resources, ctx))
  }
  if (cond.type === 'has_condition') {
    // A ficha não modela condições de status (Envenenado, Atordoado...) hoje — sempre falso.
    return false
  }

  const left = resolveOperand(cond.left_type, cond.left_value, cond.left_ref_id, atributos, resources, ctx)
  const right = resolveOperand(cond.right_type, cond.right_value, cond.right_ref_id, atributos, resources, ctx)

  switch (cond.operator) {
    case '>':
      return left > right
    case '<':
      return left < right
    case '>=':
      return left >= right
    case '<=':
      return left <= right
    case '==':
      return left === right
    case '!=':
      return left !== right
    default:
      return false
  }
}

export type ResolvedEffect = {
  behaviorSlug: string
  amount: number
  effectName: string
  elementName: string | null
}

function pickBranch(
  step: AbilityStep,
  atributos: Atributos,
  resources: CharacterResourceEntry[],
  ctx: RollContext
): AbilityStep | null {
  const condition = step.condition_link?.step_condition ?? null
  const passed = condition ? evaluateCondition(condition, atributos, resources, ctx) : true

  const children = [...step.child_steps].sort((a, b) => a.order - b.order)
  const branch = children.find((child) => child.is_else === !passed)

  return branch ?? (passed ? step : null)
}

/**
 * Resolve TODOS os root steps `on_attack` de uma habilidade — não só o primeiro. Cada
 * root é uma regra independente (a base, sempre `hits > 0`, mais qualquer regra extra
 * do editor de Ataque simples, ex: "SE 2+ acertos, +2 de dano de Fogo") e contribui um
 * resultado se sua condição passar e seu ramo "então" tiver um efeito — todas as que
 * passarem aparecem juntas (não é if/else entre regras diferentes, só dentro de cada
 * uma). Habilidades antigas/de trilha sem árvore própria retornam `[]` — quem chama
 * trata isso como "sem cálculo, só sucessos".
 */
export function resolveAbilityEffects(
  ability: Ability,
  atributos: Atributos,
  resources: CharacterResourceEntry[],
  ctx: RollContext
): ResolvedEffect[] {
  const rootSteps = ability.steps
    .filter((step) => step.parent_step_id === null && step.trigger === 'on_attack')
    .sort((a, b) => a.priority - b.priority || a.order - b.order)

  const resolved: ResolvedEffect[] = []

  for (const root of rootSteps) {
    let current: AbilityStep | null = root
    // Desce a árvore enquanto o step atual não tiver efeito próprio e tiver filhos condicionais.
    while (current) {
      const effectEntry = [...current.step_effects].sort((a, b) => a.order - b.order)[0]
      if (effectEntry) {
        const amount = effectEntry.calculation
          ? resolveCalculation(effectEntry.calculation, atributos, resources, ctx)
          : 0
        resolved.push({
          behaviorSlug: effectEntry.effect.behavior.slug,
          amount,
          effectName: effectEntry.effect.name,
          elementName: effectEntry.effect.element?.name ?? null,
        })
        break
      }

      if (current.child_steps.length === 0) break
      current = pickBranch(current, atributos, resources, ctx)
    }
  }

  return resolved
}

export function computeRangeDisplay(ability: Ability, atributos: Atributos, ctx: RollContext): number | null {
  if (!ability.range_calculation) return null
  return resolveCalculation(ability.range_calculation, atributos, [], ctx)
}
