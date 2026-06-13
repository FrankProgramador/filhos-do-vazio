import rawData from './mockData.json'

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
  fomeInicial: number
  fomeMaxima: number
  fofo: number
  assustador: number
}

export type Base = {
  id: string
  nome: string
  thumbPlaceholder: string
  descricao: string
  atributos: Atributos
}

export type TracoAtributo = {
  id: string
  nome: string
  custoFome: number
  maxVezes: number
  efeito: string
  modificadores: Partial<Record<'poder' | 'saber' | 'casca' | 'graca' | 'fofo' | 'assustador', number>>
}

export type SubTraco = {
  id: string
  nome: string
  custoFome: number
  descricao: string
  modificadores?: Partial<Record<string, number>>
}

export type TracoEspecial = {
  id: string
  nome: string
  custoFome: number
  thumbPlaceholder: string
  descricao: string
  categoria: string
  modificadores?: Partial<Record<string, number>>  // afeta fofo, assustador etc.
  subTracos?: SubTraco[]  // normalizado de "subTraços" do JSON
}

export type Trilha = {
  id: string
  nome: string
  tipo: 'marcial' | 'mistico'
  thumbPlaceholder: string
  nivel?: number
  beneficios: string
  barraAumentada: 'Estamina' | 'Alma'
  aumento: number
}

export type CharSheet = {
  nome: string
  baseId: string | null
  attrTraits: Record<string, number>  // traco.id → vezes aplicado
  specialTraits: string[]              // traços especiais selecionados
  subTraits: string[]                  // sub-traços selecionados (não contam para limite de 7)
  trilhaId: string | null
  aparencia: string                    // opcional — não enviado à API nesta versão
  historia: string                     // opcional — não enviado à API nesta versão
}

export const MAX_TRACOS = 7

// ── Dados ─────────────────────────────────────────────────────────────────
// TODO: substituir cada export por chamadas à API:
//   export async function fetchBases(): Promise<Base[]> {
//     const res = await fetch('/api/bases')
//     return res.json()
//   }

/* eslint-disable @typescript-eslint/no-explicit-any */
const raw = rawData as any

export const bases: Base[] = raw.bases

export const tracosAtributo: TracoAtributo[] = raw['traçosAtributo']

// Normaliza "subTraços" (chave com ç no JSON) → "subTracos" para uso seguro no TypeScript
export const tracosEspeciais: TracoEspecial[] = (raw['traçosEspeciais'] as any[]).map(t => ({
  ...t,
  subTracos: t['subTraços'] ?? [],
}))

export const trilhas: Trilha[] = raw.trilhas
/* eslint-enable */
