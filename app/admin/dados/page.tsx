'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminDiceSkins, type DiceSkinPayload } from '@/app/lib/adminData'
import type { DiceSkin, DiceSkinRarityValue } from '@/app/lib/gameData'
import { useDiceStageContext } from '@/components/dashboard/DiceStageContext'
import { useDiceTextures } from '@/app/lib/dice/useDiceTextures'
import TexturePickerModal from '@/components/dice/TexturePickerModal'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const RARITIES: DiceSkinRarityValue[] = ['comum', 'raro', 'epico', 'lendario']
const RARITY_LABELS: Record<DiceSkinRarityValue, string> = { comum: 'Comum', raro: 'Raro', epico: 'Épico', lendario: 'Lendário' }
const MATERIALS = ['plastic', 'metal', 'wood', 'glass']

const EMPTY: DiceSkinPayload = {
  name: '', slug: '', description: '', rarity: 'comum',
  foreground_color: '#ffffff', background_color: '#2f6fed', material: 'plastic', texture: 'none', pip_style: false, total_supply: 5,
}

function randomDie() {
  return 1 + Math.floor(Math.random() * 6)
}

export default function AdminDadosPage() {
  const { token } = useAuth()
  const diceStage = useDiceStageContext()
  const { textures } = useDiceTextures()
  const [skins, setSkins] = useState<DiceSkin[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<DiceSkinPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [pickingTexture, setPickingTexture] = useState(false)

  const load = () => adminDiceSkins.list(token).then(setSkins).finally(() => setLoading(false))
  useEffect(() => { load() }, [token])

  function testAppearance(appearance: { foreground_color: string; background_color: string; material: string; texture: string; pip_style: boolean }) {
    diceStage.showDiceRoll([randomDie()], undefined, [{
      foreground: appearance.foreground_color, background: appearance.background_color,
      material: appearance.material, texture: appearance.texture, pipStyle: appearance.pip_style,
    }])
  }

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(skin: DiceSkin) {
    setEditingId(skin.id)
    setForm({
      name: skin.name, slug: skin.slug, description: skin.description, rarity: skin.rarity,
      foreground_color: skin.foreground_color, background_color: skin.background_color,
      material: skin.material, texture: skin.texture, pip_style: skin.pip_style, total_supply: skin.total_supply,
    })
    setError(null)
  }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminDiceSkins.update(token, editingId, form)
      else await adminDiceSkins.create(token, form)
      await load()
      cancel()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    try {
      await adminDiceSkins.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 900 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Skins de Dado</h1>
        {editingId === null && <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Nova Skin</button>}
      </div>

      <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'rgba(var(--text-rgb),0.55)', maxWidth: 700 }}>
        Catálogo de dados 3D colecionáveis — oferta limitada por skin (`total_supply`), distribuídos por sorteio (registro + diário). Mantenha a soma das ofertas por perto do total que você quer em circulação no jogo.
      </p>

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Skin' : 'Nova Skin'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Raridade" required>
              <Select value={form.rarity} onChange={e => setForm({ ...form, rarity: e.target.value as DiceSkinRarityValue })}>
                {RARITIES.map(r => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
              </Select>
            </Field>
            <Field label="Oferta total" required>
              <Input type="number" min={1} value={form.total_supply} onChange={e => setForm({ ...form, total_supply: Number(e.target.value) })} />
            </Field>
            <Field label="Cor da face" required>
              <Input type="color" value={form.foreground_color} onChange={e => setForm({ ...form, foreground_color: e.target.value })} />
            </Field>
            <Field label="Cor de fundo" required>
              <Input type="color" value={form.background_color} onChange={e => setForm({ ...form, background_color: e.target.value })} />
            </Field>
            <Field label="Material" required>
              <Select value={form.material} onChange={e => setForm({ ...form, material: e.target.value })}>
                {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
            </Field>
            <Field label="Textura" required>
              <button
                type="button"
                onClick={() => setPickingTexture(true)}
                className="flex items-center gap-2"
                style={{ width: '100%', textAlign: 'left', background: 'var(--bg-secondary)', border: '1px solid rgba(var(--gold-rgb),0.15)', borderRadius: 6, padding: '0.55rem 0.75rem', cursor: 'pointer', color: 'var(--text)' }}
              >
                {(() => {
                  const file = textures.find(t => t.name === form.texture)?.file
                  return file ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/dice-box/textures/${file}`} alt="" style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover' }} />
                  ) : null
                })()}
                <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.88rem' }}>{form.texture}</span>
              </button>
            </Field>
            <Field label="Estilo da face">
              <label className="flex items-center gap-2" style={{ padding: '0.55rem 0', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.pip_style} onChange={e => setForm({ ...form, pip_style: e.target.checked })} />
                <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text)' }}>
                  Pips (bolinhas) em vez de números
                </span>
              </label>
            </Field>
            <div className="md:col-span-2">
              <Field label="Descrição"><Textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
            <button onClick={() => testAppearance(form)} className="hk-btn hk-btn-gold" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>
              🎲 Testar dado
            </button>
          </div>
        </div>
      )}

      {pickingTexture && (
        <TexturePickerModal
          value={form.texture}
          onSelect={texture => setForm({ ...form, texture })}
          onClose={() => setPickingTexture(false)}
        />
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Nome', 'Raridade', 'Cores', 'Estoque', '']}>
          {skins.map(skin => (
            <Tr key={skin.id}>
              <Td>{skin.name}</Td>
              <Td>{RARITY_LABELS[skin.rarity]}</Td>
              <Td>
                <div className="flex items-center gap-1">
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: skin.background_color, border: '1px solid rgba(255,255,255,0.3)', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{skin.material}</span>
                </div>
              </Td>
              <Td>{skin.remaining_supply ?? '—'} / {skin.total_supply}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => testAppearance(skin)} className="ddb-badge ddb-badge-dim" style={{ border: 'none', cursor: 'pointer' }}>🎲 Testar</button>
                  <button onClick={() => startEdit(skin)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(skin.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
