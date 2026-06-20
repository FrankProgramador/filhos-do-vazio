'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import { useAuth } from '@/app/lib/auth-context'
import { apiFetch, ApiError } from '@/app/lib/api'
import {
  fetchSizes, fetchTraits, fetchItems, fetchEquipmentPackages, fetchTrilhas,
  calculateAttributes, countCappedTraits, sustentoNecessario,
  MAX_TRACOS, REQUIRED_PERSONALITY,
  type CharSheet, type Size, type GameTrait, type Item, type EquipmentPackage, type Trilha, type SelectedTrait,
} from '@/app/lib/gameData'
import Step1Info from './Step1Info'
import Step2Base from './Step2Base'
import Step3Personality from './Step3Personality'
import Step4Attributes from './Step4Attributes'
import Step5Special from './Step5Special'
import Step6Trilhas from './Step6Trilhas'
import Step7Equipment from './Step7Equipment'
import Summary from './Summary'

const STORAGE_KEY = 'fdv_criar_personagem_draft'

const STEP_LABELS = ['Informações', 'Tamanho', 'Personalidade', 'Atributos', 'Traços', 'Trilha', 'Equipamento']
const STEP_TITLES = [
  'Informações Básicas',
  'Escolha o Tamanho',
  'Traços de Personalidade',
  'Distribua Traços de Atributo',
  'Traços Especiais',
  'Escolha sua Trilha',
  'Equipamento Inicial',
  'Resumo do Personagem',
]
const TOTAL_STEPS = 7

const INIT_SHEET: CharSheet = {
  nome: '',
  idade: '',
  especie: '',
  avatar: null,
  sizeId: null,
  attrTraits: {},
  specialTraits: [],
  personalityTraits: [],
  subTraits: [],
  trilhaId: null,
  equipmentPackageId: null,
  purchasedItems: {},
  aparencia: '',
  historia: '',
}

function loadDraft(): CharSheet {
  if (typeof window === 'undefined') return INIT_SHEET
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    return stored ? { ...INIT_SHEET, ...JSON.parse(stored) } : INIT_SHEET
  } catch {
    return INIT_SHEET
  }
}

export default function CriarPersonagem() {
  const router = useRouter()
  const { token } = useAuth()

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1)
  const [sheet, setSheet] = useState<CharSheet>(loadDraft)

  const [sizes, setSizes] = useState<Size[]>([])
  const [traits, setTraits] = useState<GameTrait[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [packages, setPackages] = useState<EquipmentPackage[]>([])
  const [trilhas, setTrilhas] = useState<Trilha[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchSizes(), fetchTraits(), fetchItems(), fetchEquipmentPackages(), fetchTrilhas()])
      .then(([s, t, i, p, tr]) => {
        setSizes(s)
        setTraits(t)
        setItems(i)
        setPackages(p)
        setTrilhas(tr)
      })
      .catch(() => setLoadError('Não foi possível carregar os dados de criação de personagem. Tente novamente.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sheet))
  }, [sheet])

  // ── Derived ──────────────────────────────────────────────

  const size = useMemo(() => sizes.find(s => s.id === sheet.sizeId) ?? null, [sizes, sheet.sizeId])
  const trilha = useMemo(() => trilhas.find(t => t.id === sheet.trilhaId) ?? null, [trilhas, sheet.trilhaId])

  const selectedTraits: SelectedTrait[] = useMemo(() => {
    const list: SelectedTrait[] = []
    for (const [id, quantity] of Object.entries(sheet.attrTraits)) {
      const trait = traits.find(t => t.id === Number(id))
      if (trait && quantity > 0) list.push({ trait, quantity })
    }
    for (const id of [...sheet.specialTraits, ...sheet.personalityTraits, ...sheet.subTraits]) {
      const trait = traits.find(t => t.id === id)
      if (trait) list.push({ trait, quantity: 1 })
    }
    return list
  }, [traits, sheet.attrTraits, sheet.specialTraits, sheet.personalityTraits, sheet.subTraits])

  const atributos = useMemo(() => (size ? calculateAttributes(size, selectedTraits) : null), [size, selectedTraits])
  const sustento = size ? sustentoNecessario(size) : 0

  // Traços de personalidade não entram no limite de traços comuns/marcantes/raros.
  const totalTracos = useMemo(
    () => countCappedTraits(selectedTraits.filter(s => s.trait.rarity !== 'personality')),
    [selectedTraits]
  )

  // ── Handlers ─────────────────────────────────────────────

  const setSizeId = (id: number) =>
    setSheet(s => (s.sizeId === id ? s : { ...s, sizeId: id, attrTraits: {}, specialTraits: [], subTraits: [] }))

  const addAttrTrait = (id: number) => {
    const trait = traits.find(t => t.id === id)
    if (!trait) return
    const curr = sheet.attrTraits[id] ?? 0
    if (curr >= trait.max_selections || totalTracos >= MAX_TRACOS) return
    setSheet(s => ({ ...s, attrTraits: { ...s.attrTraits, [id]: curr + 1 } }))
  }

  const removeAttrTrait = (id: number) => {
    const curr = sheet.attrTraits[id] ?? 0
    if (curr <= 0) return
    setSheet(s => {
      const next = { ...s.attrTraits }
      if (curr === 1) delete next[id]
      else next[id] = curr - 1
      return { ...s, attrTraits: next }
    })
  }

  const toggleSpecialTrait = (id: number) => {
    if (sheet.specialTraits.includes(id)) {
      const childIds = traits.filter(t => t.prerequisite_trait_id === id).map(t => t.id)
      setSheet(s => ({
        ...s,
        specialTraits: s.specialTraits.filter(t => t !== id),
        subTraits: s.subTraits.filter(st => !childIds.includes(st)),
      }))
      return
    }
    if (totalTracos >= MAX_TRACOS) return
    setSheet(s => ({ ...s, specialTraits: [...s.specialTraits, id] }))
  }

  const toggleSubTrait = (parentId: number, subId: number) => {
    if (!sheet.specialTraits.includes(parentId)) return
    if (sheet.subTraits.includes(subId)) {
      setSheet(s => ({ ...s, subTraits: s.subTraits.filter(st => st !== subId) }))
      return
    }
    setSheet(s => ({ ...s, subTraits: [...s.subTraits, subId] }))
  }

  const togglePersonalityTrait = (id: number) => {
    if (sheet.personalityTraits.includes(id)) {
      setSheet(s => ({ ...s, personalityTraits: s.personalityTraits.filter(t => t !== id) }))
      return
    }
    if (sheet.personalityTraits.length >= REQUIRED_PERSONALITY) return
    setSheet(s => ({ ...s, personalityTraits: [...s.personalityTraits, id] }))
  }

  const setTrilhaId = (id: number) => setSheet(s => ({ ...s, trilhaId: id }))
  const setEquipmentPackageId = (id: number | null) => setSheet(s => ({ ...s, equipmentPackageId: id }))

  const addPurchasedItem = (id: number) =>
    setSheet(s => ({ ...s, purchasedItems: { ...s.purchasedItems, [id]: (s.purchasedItems[id] ?? 0) + 1 } }))

  const removePurchasedItem = (id: number) =>
    setSheet(s => {
      const curr = s.purchasedItems[id] ?? 0
      if (curr <= 0) return s
      const next = { ...s.purchasedItems }
      if (curr === 1) delete next[id]
      else next[id] = curr - 1
      return { ...s, purchasedItems: next }
    })

  const setNome = (nome: string) => setSheet(s => ({ ...s, nome }))
  const setIdade = (idade: string) => setSheet(s => ({ ...s, idade }))
  const setEspecie = (especie: string) => setSheet(s => ({ ...s, especie }))
  const setAvatar = (avatar: string | null) => setSheet(s => ({ ...s, avatar }))
  const setAparencia = (v: string) => setSheet(s => ({ ...s, aparencia: v }))
  const setHistoria = (v: string) => setSheet(s => ({ ...s, historia: v }))

  // ── Navigation ────────────────────────────────────────────

  const canGoNext = useMemo(() => {
    if (step === 1) return sheet.nome.trim().length > 0
    if (step === 2) return !!sheet.sizeId
    if (step === 3) return sheet.personalityTraits.length === REQUIRED_PERSONALITY
    if (step === 6) return !!sheet.trilhaId
    return true
  }, [step, sheet.nome, sheet.sizeId, sheet.personalityTraits, sheet.trilhaId])

  const canSave = sheet.nome.trim().length > 0 && !saving

  const goNext = () => { if (canGoNext) setStep(s => (s + 1) as typeof s) }
  const goBack = () => setStep(s => (s - 1) as typeof s)

  const handleSave = async () => {
    if (!canSave || !atributos) return
    setSaving(true)
    setSaveError(null)

    const payload = {
      name: sheet.nome,
      age: sheet.idade ? Number(sheet.idade) : null,
      species: sheet.especie || null,
      avatar: sheet.avatar,
      size_id: sheet.sizeId,
      trilha_id: sheet.trilhaId,
      appearance: sheet.aparencia || null,
      story: sheet.historia || null,
      attr_traits: sheet.attrTraits,
      special_traits: sheet.specialTraits,
      personality_traits: sheet.personalityTraits,
      sub_traits: sheet.subTraits,
      equipment_package_id: sheet.equipmentPackageId,
      items: sheet.purchasedItems,
    }

    try {
      await apiFetch('/api/characters', { method: 'POST', body: JSON.stringify(payload) }, token)
      window.sessionStorage.removeItem(STORAGE_KEY)
      router.push('/painel')
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = err.errors ? Object.values(err.errors)[0]?.[0] : null
        setSaveError(firstError ?? err.message)
      } else {
        setSaveError('Não foi possível salvar o personagem. Tente novamente.')
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
        <SiteHeader activePath="/criar-personagem" />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            Carregando dados de criação...
          </p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
        <SiteHeader activePath="/criar-personagem" />
        <div className="flex-1 flex items-center justify-center">
          <div className="alert alert--error" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem' }}>
            {loadError}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <SiteHeader activePath="/criar-personagem" />

      <div style={{ paddingTop: 44, background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(var(--gold-rgb),0.08)' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <nav className="flex items-center gap-2 mb-5" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <Link href="/" style={{ color: 'var(--gold)' }} className="transition-opacity hover:opacity-75">← Início</Link>
            <span style={{ color: 'rgba(var(--gold-rgb),0.3)' }} aria-hidden>◈</span>
            <span style={{ color: 'rgba(var(--text-rgb),0.38)' }}>Criação de Personagem</span>
          </nav>

          <h1 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.15rem, 3vw, 1.8rem)', fontWeight: 700, color: 'var(--text)', marginBottom: step <= TOTAL_STEPS ? '2rem' : 0 }}>
            🦋 {STEP_TITLES[step - 1]}
          </h1>

          {step <= TOTAL_STEPS && (
            <>
              <div className="flex items-center" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem 0' }}>
                {STEP_LABELS.map((label, i) => {
                  const n = (i + 1) as typeof step
                  const isDone = n < step
                  const isActive = n === step
                  const stateClass = isDone ? 'step-indicator--done' : isActive ? 'step-indicator--active' : 'step-indicator--pending'
                  return (
                    <div key={n} className="flex items-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`step-indicator ${stateClass}`} style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cinzel)', fontSize: '0.64rem', fontWeight: 700, transition: 'all 0.2s' }}>
                          {isDone ? '✓' : n}
                        </div>
                        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.45rem', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'color 0.2s', color: isActive || isDone ? 'var(--gold)' : 'rgba(var(--text-muted-rgb),0.6)' }}>
                          {label}
                        </span>
                      </div>
                      {i < STEP_LABELS.length - 1 && (
                        <div className={`step-connector ${isDone ? 'step-connector--done' : ''}`} style={{ width: 28, height: 1, margin: '0 4px', marginBottom: 16, transition: 'background 0.2s' }} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Resumo persistente de recursos — visível em todos os passos, não só onde são escolhidos */}
              {size && (
                <div className="flex items-center gap-4 flex-wrap" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                  <span>Sustento: <strong style={{ color: 'var(--text)' }}>{sustento} ração(ões)</strong></span>
                  <span>Traços: <strong style={{ color: totalTracos >= MAX_TRACOS ? 'var(--error)' : 'var(--text)' }}>{totalTracos}/{MAX_TRACOS}</strong></span>
                  <span>Personalidade: <strong style={{ color: sheet.personalityTraits.length === REQUIRED_PERSONALITY ? 'var(--text)' : 'var(--warning)' }}>{sheet.personalityTraits.length}/{REQUIRED_PERSONALITY}</strong></span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {step === 1 && (
          <Step1Info
            nome={sheet.nome}
            idade={sheet.idade}
            especie={sheet.especie}
            avatar={sheet.avatar}
            onNomeChange={setNome}
            onIdadeChange={setIdade}
            onEspecieChange={setEspecie}
            onAvatarChange={setAvatar}
          />
        )}
        {step === 2 && (
          <Step2Base sizes={sizes} selectedId={sheet.sizeId} onSelect={setSizeId} />
        )}
        {step === 3 && (
          <Step3Personality traits={traits} personalityTraits={sheet.personalityTraits} onToggle={togglePersonalityTrait} />
        )}
        {step === 4 && size && atributos && (
          <Step4Attributes
            size={size}
            traits={traits}
            attrTraits={sheet.attrTraits}
            atributos={atributos}
            totalTracos={totalTracos}
            onAdd={addAttrTrait}
            onRemove={removeAttrTrait}
          />
        )}
        {step === 5 && (
          <Step5Special
            traits={traits}
            specialTraits={sheet.specialTraits}
            subTraits={sheet.subTraits}
            totalTracos={totalTracos}
            onToggleSpecial={toggleSpecialTrait}
            onToggleSub={toggleSubTrait}
          />
        )}
        {step === 6 && atributos && (
          <Step6Trilhas trilhas={trilhas} selectedId={sheet.trilhaId} onSelect={setTrilhaId} atributos={atributos} />
        )}
        {step === 7 && (
          <Step7Equipment
            packages={packages}
            items={items}
            equipmentPackageId={sheet.equipmentPackageId}
            purchasedItems={sheet.purchasedItems}
            onSelectPackage={setEquipmentPackageId}
            onAddItem={addPurchasedItem}
            onRemoveItem={removePurchasedItem}
          />
        )}
        {step === 8 && atributos && (
          <Summary
            sheet={sheet}
            size={size}
            trilha={trilha}
            traits={traits}
            packages={packages}
            items={items}
            atributos={atributos}
            sustento={sustento}
            onAparenciaChange={setAparencia}
            onHistoriaChange={setHistoria}
          />
        )}

        {saveError && (
          <div className="alert alert--error" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', marginTop: '1.5rem' }}>
            {saveError}
          </div>
        )}
      </main>

      <div style={{ position: 'sticky', bottom: 0, zIndex: 10, background: 'rgba(var(--bg-rgb),0.96)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(var(--gold-rgb),0.1)', padding: '0.875rem 0' }}>
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === 1}
            className="hk-btn hk-btn-soul"
            style={{ fontSize: '0.72rem', padding: '0.65rem 1.5rem', borderRadius: 7, opacity: step === 1 ? 0.28 : 1, cursor: step === 1 ? 'not-allowed' : 'pointer' }}
          >
            ← Voltar
          </button>

          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {step <= TOTAL_STEPS ? `Etapa ${step} de ${TOTAL_STEPS}` : 'Resumo'}
          </span>

          {step <= TOTAL_STEPS ? (
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="btn-hero"
              style={{ fontSize: '0.72rem', padding: '0.65rem 1.75rem', opacity: canGoNext ? 1 : 0.32, cursor: canGoNext ? 'pointer' : 'not-allowed' }}
            >
              {step === TOTAL_STEPS ? 'Ver Resumo →' : 'Próximo →'}
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="btn-hero"
              style={{ fontSize: '0.72rem', padding: '0.65rem 1.75rem', opacity: canSave ? 1 : 0.32, cursor: canSave ? 'pointer' : 'not-allowed' }}
            >
              {saving ? 'Salvando...' : '✦ Salvar Personagem'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
