'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import {
  bases, tracosAtributo, tracosEspeciais, trilhas, MAX_TRACOS,
  type CharSheet, type Atributos,
} from '@/app/lib/mockData'
import Step1Base from './Step1Base'
import Step2Attributes from './Step2Attributes'
import Step3Traits from './Step3Traits'
import Step4Trilhas from './Step4Trilhas'
import Summary from './Summary'

const STEP_LABELS = ['Base', 'Atributos', 'Traços', 'Trilha']
const STEP_TITLES = [
  'Escolha a Base',
  'Distribua Traços de Atributo',
  'Traços Especiais',
  'Escolha sua Trilha',
  'Resumo do Personagem',
]

const INIT_SHEET: CharSheet = {
  nome: '',
  baseId: null,
  attrTraits: {},
  specialTraits: [],
  subTraits: [],
  trilhaId: null,
  aparencia: '',
  historia: '',
}

export default function CriarPersonagem() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [sheet, setSheet] = useState<CharSheet>(INIT_SHEET)

  // ── Derived ──────────────────────────────────────────────

  const base = useMemo(() => bases.find(b => b.id === sheet.baseId) ?? null, [sheet.baseId])
  const fomeMax = base?.atributos.fomeMaxima ?? 0

  const atributos: Atributos | null = useMemo(() => {
    if (!base) return null
    const a = { ...base.atributos }

    // Traços de atributo (Poderoso, Lindo, Assustador etc.)
    Object.entries(sheet.attrTraits).forEach(([id, count]) => {
      const t = tracosAtributo.find(t => t.id === id)
      if (!t) return
      Object.entries(t.modificadores).forEach(([attr, mod]) => {
        ;(a as Record<string, number>)[attr] += (mod ?? 0) * count
      })
    })

    // Traços especiais com modificadores (ex: Ferrão +0.5 Assustador)
    sheet.specialTraits.forEach(id => {
      const t = tracosEspeciais.find(t => t.id === id)
      if (!t?.modificadores) return
      Object.entries(t.modificadores).forEach(([attr, mod]) => {
        ;(a as Record<string, number>)[attr] += mod ?? 0
      })
    })

    // Sub-traços com modificadores
    sheet.subTraits.forEach(subId => {
      for (const t of tracosEspeciais) {
        const sub = t.subTracos?.find(st => st.id === subId)
        if (sub?.modificadores) {
          Object.entries(sub.modificadores).forEach(([attr, mod]) => {
            ;(a as Record<string, number>)[attr] += mod ?? 0
          })
          break
        }
      }
    })

    return a
  }, [base, sheet.attrTraits, sheet.specialTraits, sheet.subTraits])

  const fomeGasta = useMemo(() => {
    if (!base) return 0
    let total = base.atributos.fomeInicial
    Object.entries(sheet.attrTraits).forEach(([id, count]) => {
      const t = tracosAtributo.find(t => t.id === id)
      if (t) total += t.custoFome * count
    })
    sheet.specialTraits.forEach(id => {
      const t = tracosEspeciais.find(t => t.id === id)
      if (t) total += t.custoFome
    })
    // Sub-traços custam Fome mas não contam para o limite de 7 traços
    sheet.subTraits.forEach(subId => {
      for (const t of tracosEspeciais) {
        const sub = t.subTracos?.find(st => st.id === subId)
        if (sub) { total += sub.custoFome; break }
      }
    })
    return total
  }, [base, sheet.attrTraits, sheet.specialTraits, sheet.subTraits])

  const totalTracos = useMemo(() => {
    const n = Object.values(sheet.attrTraits).reduce((a, b) => a + b, 0)
    return n + sheet.specialTraits.length
    // sub-traços NÃO entram nesta contagem
  }, [sheet.attrTraits, sheet.specialTraits])

  // ── Handlers ─────────────────────────────────────────────

  const setBaseId = (id: string) =>
    setSheet(s => s.baseId === id ? s : {
      ...s, baseId: id, attrTraits: {}, specialTraits: [], subTraits: [],
    })

  const addAttrTrait = (id: string) => {
    const t = tracosAtributo.find(t => t.id === id)
    if (!t) return
    const curr = sheet.attrTraits[id] ?? 0
    if (curr >= t.maxVezes || totalTracos >= MAX_TRACOS) return
    if (t.custoFome > 0 && fomeGasta + t.custoFome > fomeMax) return
    setSheet(s => ({ ...s, attrTraits: { ...s.attrTraits, [id]: curr + 1 } }))
  }

  const removeAttrTrait = (id: string) => {
    const curr = sheet.attrTraits[id] ?? 0
    if (curr <= 0) return
    setSheet(s => {
      const next = { ...s.attrTraits }
      if (curr === 1) delete next[id]
      else next[id] = curr - 1
      return { ...s, attrTraits: next }
    })
  }

  const toggleSpecialTrait = (id: string) => {
    if (sheet.specialTraits.includes(id)) {
      // Ao desmarcar o traço pai, remover também seus sub-traços
      const parent = tracosEspeciais.find(t => t.id === id)
      const childIds = (parent?.subTracos ?? []).map(st => st.id)
      setSheet(s => ({
        ...s,
        specialTraits: s.specialTraits.filter(t => t !== id),
        subTraits: s.subTraits.filter(st => !childIds.includes(st)),
      }))
      return
    }
    const t = tracosEspeciais.find(t => t.id === id)
    if (!t || totalTracos >= MAX_TRACOS) return
    if (t.custoFome > 0 && fomeGasta + t.custoFome > fomeMax) return
    setSheet(s => ({ ...s, specialTraits: [...s.specialTraits, id] }))
  }

  const toggleSubTrait = (parentId: string, subId: string) => {
    // Sub-traço só disponível se o traço pai estiver selecionado
    if (!sheet.specialTraits.includes(parentId)) return

    if (sheet.subTraits.includes(subId)) {
      setSheet(s => ({ ...s, subTraits: s.subTraits.filter(st => st !== subId) }))
      return
    }
    const parent = tracosEspeciais.find(t => t.id === parentId)
    const sub = parent?.subTracos?.find(st => st.id === subId)
    if (!sub) return
    if (sub.custoFome > 0 && fomeGasta + sub.custoFome > fomeMax) return
    setSheet(s => ({ ...s, subTraits: [...s.subTraits, subId] }))
  }

  const setTrilhaId = (id: string) => setSheet(s => ({ ...s, trilhaId: id }))
  const setNome = (nome: string) => setSheet(s => ({ ...s, nome }))
  const setAparencia = (v: string) => setSheet(s => ({ ...s, aparencia: v }))
  const setHistoria = (v: string) => setSheet(s => ({ ...s, historia: v }))

  // ── Navigation ────────────────────────────────────────────

  const canGoNext = useMemo(() => {
    if (step === 1) return !!sheet.baseId
    if (step === 4) return !!sheet.trilhaId
    return true
  }, [step, sheet.baseId, sheet.trilhaId])

  const canSave = sheet.nome.trim().length > 0

  const goNext = () => { if (canGoNext) setStep(s => (s + 1) as typeof s) }
  const goBack = () => setStep(s => (s - 1) as typeof s)

  const handleSave = () => {
    if (!canSave) { alert('Por favor, insira o nome do personagem.'); return }
    // TODO: substituir por chamada à API real:
    // const res = await fetch('/api/personagens', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // })
    const payload = {
      nome: sheet.nome,
      base: sheet.baseId,
      atributos,
      tracosAtributo: sheet.attrTraits,
      tracosEspeciais: sheet.specialTraits,
      subTracos: sheet.subTraits,
      trilha: sheet.trilhaId,
      aparencia: sheet.aparencia || null,
      historia: sheet.historia || null,
    }
    console.log('Personagem criado:', payload)
    alert('Funcionalidade em desenvolvimento. Seu personagem não foi salvo.')
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--hk-void)' }}>
      <SiteHeader activePath="/criar-personagem" />

      {/* Page header */}
      <div style={{
        paddingTop: 44,
        background: 'var(--hk-abyss)',
        borderBottom: '1px solid rgba(74,158,255,0.08)',
      }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <nav
            className="flex items-center gap-2 mb-5"
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.6rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            <Link href="/" style={{ color: 'var(--hk-soul)' }} className="transition-opacity hover:opacity-75">
              ← Início
            </Link>
            <span style={{ color: 'rgba(74,158,255,0.3)' }} aria-hidden>◈</span>
            <span style={{ color: 'rgba(216,228,248,0.38)' }}>Criação de Personagem</span>
          </nav>

          <h1 style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: 'clamp(1.15rem, 3vw, 1.8rem)',
            fontWeight: 700,
            color: 'var(--hk-pale)',
            marginBottom: step < 5 ? '2rem' : 0,
          }}>
            🦋 {STEP_TITLES[step - 1]}
          </h1>

          {/* Step indicator — only during steps 1–4 */}
          {step < 5 && (
            <div className="flex items-center">
              {STEP_LABELS.map((label, i) => {
                const n = (i + 1) as 1 | 2 | 3 | 4
                const isDone   = n < step
                const isActive = n === step
                return (
                  <div key={n} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-cinzel)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        transition: 'all 0.2s',
                        background: isDone
                          ? 'rgba(74,158,255,0.14)'
                          : isActive
                          ? 'rgba(212,168,67,0.15)'
                          : 'rgba(122,138,170,0.06)',
                        border: isDone
                          ? '1px solid rgba(74,158,255,0.5)'
                          : isActive
                          ? '1px solid rgba(212,168,67,0.6)'
                          : '1px solid rgba(122,138,170,0.18)',
                        color: isDone
                          ? 'var(--hk-soul)'
                          : isActive
                          ? 'var(--hk-gold)'
                          : 'rgba(122,138,170,0.35)',
                      }}>
                        {isDone ? '✓' : n}
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-cinzel)',
                        fontSize: '0.48rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.2s',
                        color: isActive
                          ? 'var(--hk-gold)'
                          : isDone
                          ? 'var(--hk-soul)'
                          : 'rgba(122,138,170,0.32)',
                      }}>
                        {label}
                      </span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div style={{
                        width: 44,
                        height: 1,
                        margin: '0 6px',
                        marginBottom: 18,
                        transition: 'background 0.2s',
                        background: isDone
                          ? 'rgba(74,158,255,0.32)'
                          : 'rgba(122,138,170,0.1)',
                      }} />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Step content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {step === 1 && (
          <Step1Base
            bases={bases}
            selectedId={sheet.baseId}
            onSelect={setBaseId}
          />
        )}
        {step === 2 && base && atributos && (
          <Step2Attributes
            base={base}
            tracosAtributo={tracosAtributo}
            attrTraits={sheet.attrTraits}
            atributos={atributos}
            fomeGasta={fomeGasta}
            fomeMax={fomeMax}
            totalTracos={totalTracos}
            onAdd={addAttrTrait}
            onRemove={removeAttrTrait}
          />
        )}
        {step === 3 && (
          <Step3Traits
            tracosEspeciais={tracosEspeciais}
            selectedIds={sheet.specialTraits}
            selectedSubIds={sheet.subTraits}
            fomeGasta={fomeGasta}
            fomeMax={fomeMax}
            totalTracos={totalTracos}
            onToggle={toggleSpecialTrait}
            onToggleSub={toggleSubTrait}
          />
        )}
        {step === 4 && atributos && (
          <Step4Trilhas
            trilhas={trilhas}
            selectedId={sheet.trilhaId}
            onSelect={setTrilhaId}
            atributos={atributos}
          />
        )}
        {step === 5 && atributos && (
          <Summary
            sheet={sheet}
            bases={bases}
            tracosAtributo={tracosAtributo}
            tracosEspeciais={tracosEspeciais}
            trilhas={trilhas}
            atributos={atributos}
            onNomeChange={setNome}
            onAparenciaChange={setAparencia}
            onHistoriaChange={setHistoria}
          />
        )}
      </main>

      {/* Sticky nav bar */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
        background: 'rgba(8,9,15,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(74,158,255,0.1)',
        padding: '0.875rem 0',
      }}>
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === 1}
            className="hk-btn hk-btn-soul"
            style={{
              fontSize: '0.72rem',
              padding: '0.65rem 1.5rem',
              borderRadius: 7,
              opacity: step === 1 ? 0.28 : 1,
              cursor: step === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Voltar
          </button>

          <span style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.52rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--hk-dim)',
          }}>
            {step < 5 ? `Etapa ${step} de 4` : 'Resumo'}
          </span>

          {step < 5 ? (
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="btn-hero"
              style={{
                fontSize: '0.72rem',
                padding: '0.65rem 1.75rem',
                opacity: canGoNext ? 1 : 0.32,
                cursor: canGoNext ? 'pointer' : 'not-allowed',
              }}
            >
              {step === 4 ? 'Ver Resumo →' : 'Próximo →'}
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="btn-hero"
              style={{
                fontSize: '0.72rem',
                padding: '0.65rem 1.75rem',
                opacity: canSave ? 1 : 0.32,
                cursor: canSave ? 'pointer' : 'not-allowed',
              }}
            >
              ✦ Salvar Personagem
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
