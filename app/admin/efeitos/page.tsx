'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'
import { adminEffectTypes, adminEffects, type EffectFieldValuePayload, type EffectPayload } from '@/app/lib/adminData'
import type { EffectFieldDefinition, EffectType, GameEffect } from '@/app/lib/gameData'
import { AdminTable, ConfirmButton, Field, Input, Select, Td, Textarea, Tr } from '../AdminUI'

const ATTRS = ['poder', 'saber', 'casca', 'graca', 'coracao', 'estamina', 'alma', 'velocidade', 'fofo', 'assustador']
const RESOURCES = ['estamina', 'alma', 'sustento', 'geo']
const TARGETS = ['self', 'target', 'allies', 'enemies', 'area']
const DIRECTIONS = ['frente', 'tras', 'esquerda', 'direita', 'cima', 'baixo']

const EMPTY: EffectPayload = {
  effect_type_id: 0, name: '', slug: '', description: '', field_values: [],
}

function FieldInput({
  definition, value, onChange,
}: {
  definition: EffectFieldDefinition
  value: string | null
  onChange: (value: string | null) => void
}) {
  switch (definition.field_type) {
    case 'textarea':
    case 'expression':
      return <Textarea value={value ?? ''} onChange={e => onChange(e.target.value)} />

    case 'number':
      return (
        <Input
          type="number"
          min={definition.min_value ?? undefined}
          max={definition.max_value ?? undefined}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
        />
      )

    case 'boolean':
      return (
        <label className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
          <input type="checkbox" checked={value === 'true'} onChange={e => onChange(e.target.checked ? 'true' : 'false')} />
          Ativo
        </label>
      )

    case 'select':
      return (
        <Select value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Selecione…</option>
          {(definition.options ?? []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </Select>
      )

    case 'multi_select': {
      const selected: string[] = value ? JSON.parse(value) : []
      const toggle = (v: string) => {
        const next = selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]
        onChange(next.length ? JSON.stringify(next) : null)
      }
      return (
        <div className="flex flex-wrap gap-2">
          {(definition.options ?? []).map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={selected.includes(opt.value) ? 'ddb-badge ddb-badge-gold' : 'ddb-badge ddb-badge-dim'}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )
    }

    case 'attribute':
      return (
        <Select value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Selecione…</option>
          {ATTRS.map(a => <option key={a} value={a}>{a}</option>)}
        </Select>
      )

    case 'resource':
      return (
        <Select value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Selecione…</option>
          {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
        </Select>
      )

    case 'target':
      return (
        <Select value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Selecione…</option>
          {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
      )

    case 'direction':
      return (
        <Select value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Selecione…</option>
          {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>
      )

    case 'dice':
      return <Input placeholder="ex: 2d6+1" value={value ?? ''} onChange={e => onChange(e.target.value)} />

    case 'condition':
    case 'entity':
    case 'effect':
    case 'text':
    default:
      return <Input value={value ?? ''} onChange={e => onChange(e.target.value)} />
  }
}

export default function AdminEfeitosPage() {
  const { token } = useAuth()
  const [effects, setEffects] = useState<GameEffect[]>([])
  const [effectTypes, setEffectTypes] = useState<EffectType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<EffectPayload>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    adminEffectTypes.list(token).then(setEffectTypes)
    return adminEffects.list(token).then(setEffects).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [token])

  const selectedType = useMemo(
    () => effectTypes.find(t => t.id === form.effect_type_id) ?? null,
    [effectTypes, form.effect_type_id],
  )

  function startCreate() { setEditingId(0); setForm(EMPTY); setError(null) }
  function startEdit(effect: GameEffect) {
    setEditingId(effect.id)
    setForm({
      effect_type_id: effect.effect_type_id,
      name: effect.name,
      slug: effect.slug,
      description: effect.description,
      field_values: effect.field_values.map(v => ({ effect_field_definition_id: v.effect_field_definition_id, value: v.value })),
    })
    setError(null)
  }
  function cancel() { setEditingId(null); setForm(EMPTY); setError(null) }

  function selectType(effectTypeId: number) {
    setForm({ ...form, effect_type_id: effectTypeId, field_values: [] })
  }

  function valueFor(definitionId: number): string | null {
    return form.field_values.find(v => v.effect_field_definition_id === definitionId)?.value ?? null
  }

  function setValueFor(definitionId: number, value: string | null) {
    const rest = form.field_values.filter(v => v.effect_field_definition_id !== definitionId)
    const entry: EffectFieldValuePayload = { effect_field_definition_id: definitionId, value }
    setForm({ ...form, field_values: [...rest, entry] })
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (editingId) await adminEffects.update(token, editingId, form)
      else await adminEffects.create(token, form)
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
      await adminEffects.remove(token, id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir.')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1100 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.4rem', color: 'var(--text)' }}>Efeitos</h1>
        {editingId === null && effectTypes.length > 0 && (
          <button onClick={startCreate} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.2rem' }}>+ Novo Efeito</button>
        )}
      </div>

      {effectTypes.length === 0 && !loading && (
        <div className="alert" style={{ fontSize: '0.8rem' }}>
          Nenhum Tipo de Efeito cadastrado ainda — crie um em Admin → Tipos de Efeito antes de criar Efeitos.
        </div>
      )}

      {error && <div className="alert alert--error" style={{ fontSize: '0.75rem' }}>{error}</div>}

      {editingId !== null && (
        <div className="card" style={{ padding: '1.25rem', borderRadius: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            {editingId ? 'Editar Efeito' : 'Novo Efeito'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Tipo de Efeito" required>
              <Select value={form.effect_type_id || ''} onChange={e => selectType(Number(e.target.value))}>
                <option value="">Selecione…</option>
                {effectTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </Field>
            <Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Slug" required><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <div className="md:col-span-2">
              <Field label="Descrição"><Textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
          </div>

          {selectedType && (
            <>
              <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '1.25rem 0 0.6rem' }}>
                Campos de {selectedType.name}
              </h3>
              {selectedType.field_definitions.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Este tipo de efeito ainda não tem campos definidos.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedType.field_definitions.map(definition => (
                    <div key={definition.id} className={definition.field_type === 'textarea' || definition.field_type === 'expression' ? 'md:col-span-2' : ''}>
                      <Field label={definition.label} required={definition.is_required}>
                        <FieldInput
                          definition={definition}
                          value={valueFor(definition.id) ?? definition.default_value}
                          onChange={v => setValueFor(definition.id, v)}
                        />
                      </Field>
                      {definition.description && (
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{definition.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving} className="btn-hero" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={cancel} className="hk-btn hk-btn-soul" style={{ fontSize: '0.7rem', padding: '0.55rem 1.3rem', borderRadius: 6 }}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando...</p> : (
        <AdminTable headers={['Nome', 'Slug', 'Tipo de Efeito', '']}>
          {effects.map(effect => (
            <Tr key={effect.id}>
              <Td>{effect.name}</Td>
              <Td>{effect.slug}</Td>
              <Td>{effect.effect_type.name}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(effect)} className="ddb-badge ddb-badge-gold" style={{ border: 'none', cursor: 'pointer' }}>Editar</button>
                  <ConfirmButton onConfirm={() => remove(effect.id)} className="badge badge--error" style={{ border: 'none', cursor: 'pointer' }}>Excluir</ConfirmButton>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
