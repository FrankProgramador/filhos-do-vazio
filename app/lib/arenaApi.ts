import { apiFetch } from '@/app/lib/api'

export type ArenaToken = {
  id: number
  arena_match_id: number
  user_id: number
  character_id: number | null
  label: string
  color: string
  col: number
  row: number
  movement: number
  movement_used: number
  hp: number
  max_hp: number
  casca_atual: number
  attacked: boolean
  character: { id: number; poder: number; estamina: number } | null
}

/**
 * Guardado no match (não só devolvido a quem atacou) — assim tanto o atacante
 * quanto o oponente (que só recebe estado via poll) veem o mesmo resultado.
 * `attack_sequence` no match é como o frontend sabe se é um ataque novo ou o
 * mesmo já mostrado num poll anterior.
 */
/** Uma skin (cor+material+textura+pips) por dado físico rolado — resolvida no servidor a partir da coleção do atacante (ArenaRules::diceAppearancesFor). */
export type ArenaDiceSkinAppearance = {
  foreground: string
  background: string
  material: string
  texture: string
  pip_style: boolean
}

export type ArenaAttackResult = {
  attacker_token_id: number
  target_token_id: number
  option: string
  rolls: number[]
  dice_skins: ArenaDiceSkinAppearance[]
  successes: number
  hit: boolean
  damage: number
  remaining_casca: number
}

export type ArenaMatchState = {
  id: number
  status: 'waiting' | 'active' | 'finished'
  turn_number: number
  current_token_id: number | null
  winner_token_id: number | null
  attack_sequence: number
  last_attack_result: ArenaAttackResult | null
  tokens: ArenaToken[]
}

export function createArenaMatch(characterId: number, token: string) {
  return apiFetch<ArenaMatchState>('/api/arena/matches', {
    method: 'POST',
    body: JSON.stringify({ character_id: characterId }),
  }, token)
}

export function joinArenaMatch(matchId: number, characterId: number, token: string) {
  return apiFetch<ArenaMatchState>(`/api/arena/matches/${matchId}/join`, {
    method: 'POST',
    body: JSON.stringify({ character_id: characterId }),
  }, token)
}

export function fetchArenaMatch(matchId: number, token: string) {
  return apiFetch<ArenaMatchState>(`/api/arena/matches/${matchId}`, {}, token)
}

export function moveArenaToken(matchId: number, tokenId: number, col: number, row: number, token: string) {
  return apiFetch<ArenaMatchState>(`/api/arena/matches/${matchId}/move`, {
    method: 'POST',
    body: JSON.stringify({ token_id: tokenId, col, row }),
  }, token)
}

export function attackArenaToken(
  matchId: number, tokenId: number, targetTokenId: number, option: string, estaminaGasta: number, token: string
) {
  return apiFetch<ArenaMatchState>(`/api/arena/matches/${matchId}/attack`, {
    method: 'POST',
    body: JSON.stringify({ token_id: tokenId, target_token_id: targetTokenId, option, estamina_gasta: estaminaGasta }),
  }, token)
}

export function endArenaTurn(matchId: number, tokenId: number, token: string) {
  return apiFetch<ArenaMatchState>(`/api/arena/matches/${matchId}/end-turn`, {
    method: 'POST',
    body: JSON.stringify({ token_id: tokenId }),
  }, token)
}
