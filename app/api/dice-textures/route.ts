import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'

export type DiceTextureOption = { name: string; file: string | null }

/**
 * A lib (@3d-dice/dice-box-threejs) só reconhecia nativamente um catálogo FIXO de
 * nomes de textura, embutido no próprio pacote — um arquivo novo em
 * `public/dice-box/textures/` com um nome fora desse catálogo não fazia nada.
 * Corrigido via patch (`patches/@3d-dice+dice-box-threejs+*.patch`, reaplicado
 * automaticamente a cada `npm install` pelo `patch-package`): o método interno
 * `getTexture()` agora resolve QUALQUER nome não-catalogado direto pro arquivo
 * `textures/<nome>.webp`, então aqui a listagem volta a ser simplesmente "todo
 * arquivo da pasta" — dessa vez é verdade, porque a lib patcheada aceita.
 */
export async function GET() {
  const texturesDir = path.join(process.cwd(), 'public', 'dice-box', 'textures')
  const files = await readdir(texturesDir)

  const options: DiceTextureOption[] = files
    .filter(file => file.endsWith('.webp'))
    .map(file => file.replace(/\.webp$/, ''))
    // "-bump" é relevo carregado automaticamente pela lib junto com a textura base
    // (não é escolhível por conta própria); ".alt" são variantes alternativas de uma
    // textura já registrada sob outro nome (ex: cloudy_2) — mantidas fora daqui pra
    // não duplicar a mesma imagem sob dois nomes diferentes no seletor.
    .filter(name => !name.endsWith('-bump') && !name.endsWith('.alt'))
    .sort((a, b) => a.localeCompare(b))
    .map(name => ({ name, file: `${name}.webp` }))

  return NextResponse.json([{ name: 'none', file: null }, ...options])
}
