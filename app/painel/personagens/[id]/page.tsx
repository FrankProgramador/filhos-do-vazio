'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/lib/auth-context'
import { fetchCharacter, type Atributos, type Character } from '@/app/lib/gameData'
import CharacterSheetCard, { type CharacterSheetData } from '@/components/CharacterSheetCard'

function buildSheetData(character: Character): CharacterSheetData {
  const atributos: Atributos = {
    poder: Number(character.poder), saber: Number(character.saber), casca: Number(character.casca),
    graca: Number(character.graca), coracao: Number(character.coracao), estamina: Number(character.estamina),
    alma: Number(character.alma), velocidade: Number(character.velocidade), fofo: Number(character.fofo),
    assustador: Number(character.assustador),
  }

  return {
    id: character.id,
    name: character.name,
    avatar: character.avatar,
    age: character.age,
    species: character.species,
    level: character.level,
    geo: character.geo,
    sustento: character.sustento,
    sustentoMaximo: character.sustento_maximo,
    size: character.size,
    trilha: character.trilha,
    atributos,
    traits: character.traits,
    items: character.items,
    abilities: character.abilities,
    resources: character.resources,
    appearance: character.appearance,
    story: character.story,
  }
}

export default function FichaPersonagem() {
  const params = useParams()
  const { token } = useAuth()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = params.id as string
    fetchCharacter(id, token)
      .then(setCharacter)
      .catch(() => setError('Não foi possível carregar esta ficha. Ela pode não existir ou não pertencer à sua conta.'))
      .finally(() => setLoading(false))
  }, [params.id, token])

  if (loading) {
    return <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Carregando ficha...</p>
  }

  if (error || !character) {
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="alert alert--error" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem' }}>
          {error ?? 'Personagem não encontrado.'}
        </div>
        <Link href="/painel/personagens" className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.6rem 1.4rem', borderRadius: 7 }}>
          ← Voltar aos Personagens
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <Link href="/painel/personagens" className="transition-opacity hover:opacity-75" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', display: 'inline-block' }}>
        ← Voltar aos Personagens
      </Link>

      <CharacterSheetCard character={buildSheetData(character)} />
    </div>
  )
}
