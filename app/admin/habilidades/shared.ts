import type { StepConditionOperatorValue, StepConditionOwnerValue } from '@/app/lib/gameData'

// Compartilhado entre o editor avançado (page.tsx) e o editor simples de Ataque
// (SimpleAttackEditor.tsx) — evita duplicar os mesmos labels/listas nos dois.

export const OWNERS: StepConditionOwnerValue[] = ['self', 'target', 'source']
export const OWNER_LABELS: Record<StepConditionOwnerValue, string> = { self: 'Você mesmo', target: 'Alvo', source: 'Origem' }

export const OPERATORS: StepConditionOperatorValue[] = ['>', '<', '>=', '<=', '==', '!=']
export const OPERATOR_LABELS: Record<StepConditionOperatorValue, string> = {
  '>': '> (maior que)', '<': '< (menor que)', '>=': '>= (maior ou igual)', '<=': '<= (menor ou igual)',
  '==': '== (igual)', '!=': '!= (diferente)',
}

export type AtributoRolavel = 'poder' | 'graca' | 'casca' | 'saber'
export const ATRIBUTOS: AtributoRolavel[] = ['poder', 'graca', 'casca', 'saber']
export const ATRIBUTO_LABELS: Record<AtributoRolavel, string> = {
  poder: 'Poder', graca: 'Graça', casca: 'Casca', saber: 'Saber',
}
