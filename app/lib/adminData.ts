import { apiFetch } from '@/app/lib/api'
import type { Ability, EquipmentPackage, GameTrait, Item, Size, Trigger, Trilha } from '@/app/lib/gameData'

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

export type ItemPayload = Omit<Item, 'id'>

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

export type TraitPayload = Omit<GameTrait, 'id' | 'modifiers' | 'sub_traits'> & {
  modifiers: TraitModifierPayload[]
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

// ── Triggers ─────────────────────────────────────────────────────────────

export type TriggerPayload = Omit<Trigger, 'id'>

export const adminTriggers = {
  list: (token: string | null) => authed<Trigger[]>('/api/admin/triggers', token),
  create: (token: string | null, data: TriggerPayload) =>
    authed<Trigger>('/api/admin/triggers', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: TriggerPayload) =>
    authed<Trigger>(`/api/admin/triggers/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/triggers/${id}`, token, { method: 'DELETE' }),
}

// ── Abilities ────────────────────────────────────────────────────────────

export type AbilityPayload = Omit<Ability, 'id' | 'triggers'> & { trigger_ids: number[] }

export const adminAbilities = {
  list: (token: string | null) => authed<Ability[]>('/api/admin/abilities', token),
  create: (token: string | null, data: AbilityPayload) =>
    authed<Ability>('/api/admin/abilities', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string | null, id: number, data: AbilityPayload) =>
    authed<Ability>(`/api/admin/abilities/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (token: string | null, id: number) =>
    authed<{ message: string }>(`/api/admin/abilities/${id}`, token, { method: 'DELETE' }),
}
