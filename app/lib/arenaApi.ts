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
}

export type ArenaMatchState = {
  id: number
  status: 'waiting' | 'active' | 'finished'
  turn_number: number
  current_token_id: number | null
  winner_token_id: number | null
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

export function attackArenaToken(matchId: number, tokenId: number, targetTokenId: number, option: string, token: string) {
  return apiFetch<ArenaMatchState>(`/api/arena/matches/${matchId}/attack`, {
    method: 'POST',
    body: JSON.stringify({ token_id: tokenId, target_token_id: targetTokenId, option }),
  }, token)
}

export function endArenaTurn(matchId: number, tokenId: number, token: string) {
  return apiFetch<ArenaMatchState>(`/api/arena/matches/${matchId}/end-turn`, {
    method: 'POST',
    body: JSON.stringify({ token_id: tokenId }),
  }, token)
}
