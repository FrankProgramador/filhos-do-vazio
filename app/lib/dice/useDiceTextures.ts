'use client'

import { useEffect, useState } from 'react'

export type DiceTextureOption = { name: string; file: string | null }

const NONE_ONLY: DiceTextureOption[] = [{ name: 'none', file: null }]

/**
 * Busca a lista de texturas REALMENTE reconhecidas pela lib de dados 3D instalada
 * (ver `app/api/dice-textures/route.ts`) — cada nome já vem com o arquivo real que
 * o representa (nem sempre bate com o próprio nome, ex: "bird" → `feather.webp`).
 */
export function useDiceTextures() {
  const [textures, setTextures] = useState<DiceTextureOption[]>(NONE_ONLY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dice-textures')
      .then(res => res.json())
      .then((options: DiceTextureOption[]) => setTextures(options))
      .catch(() => setTextures(NONE_ONLY))
      .finally(() => setLoading(false))
  }, [])

  return { textures, loading }
}
