'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { apiUpload, ApiError } from '@/app/lib/api'

interface Props {
  nome: string
  idade: string
  especie: string
  avatar: string | null
  onNomeChange: (v: string) => void
  onIdadeChange: (v: string) => void
  onEspecieChange: (v: string) => void
  onAvatarChange: (v: string | null) => void
}

const AVATAR_PRESETS = [
  'https://placehold.co/96x96/1B1D21/B8924A?text=1',
  'https://placehold.co/96x96/1B1D21/B8924A?text=2',
  'https://placehold.co/96x96/1B1D21/B8924A?text=3',
  'https://placehold.co/96x96/1B1D21/B8924A?text=4',
  'https://placehold.co/96x96/1B1D21/B8924A?text=5',
  'https://placehold.co/96x96/1B1D21/B8924A?text=6',
]

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(var(--gold-rgb),0.14)',
  borderRadius: 6,
  color: 'var(--text)',
  fontFamily: 'var(--font-im-fell)',
  fontStyle: 'italic' as const,
  fontSize: '0.95rem',
  outline: 'none',
}

const labelStyle = {
  fontFamily: 'var(--font-cinzel)',
  fontSize: '0.62rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold)',
  display: 'block',
  marginBottom: '0.5rem',
}

function AvatarPickerModal({ open, avatar, onClose, onSelectPreset }: {
  open: boolean
  avatar: string | null
  onClose: () => void
  onSelectPreset: (url: string) => void
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Selecionar Avatar"
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
    >
      <div
        onClick={onClose}
        aria-hidden
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
      />
      <div
        style={{
          position: 'relative', background: 'var(--card)', border: '1px solid rgba(var(--gold-rgb),0.25)',
          borderRadius: 10, maxWidth: 420, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 70px -20px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', borderBottom: '1px solid rgba(var(--gold-rgb),0.15)' }}>
          <h3 style={{ fontFamily: 'var(--font-cinzel-decorative)', fontSize: '1.15rem', color: 'var(--gold)', margin: 0 }}>Selecionar Avatar</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 0 }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '1.25rem 1.4rem', overflowY: 'auto' }}>
          <div className="flex gap-3 flex-wrap">
            {AVATAR_PRESETS.map(preset => (
              <button
                key={preset}
                onClick={() => onSelectPreset(preset)}
                className={avatar === preset ? 'card--selected' : ''}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: avatar === preset ? '2px solid var(--gold)' : '1px solid rgba(var(--gold-rgb),0.15)',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preset} alt="Avatar predefinido" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Step1Info({
  nome, idade, especie, avatar,
  onNomeChange, onIdadeChange, onEspecieChange, onAvatarChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { token } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const result = await apiUpload<{ url: string }>('/api/uploads/avatar', formData, token)
      onAvatarChange(result.url)
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Não foi possível enviar a imagem.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-6 flex-wrap">
        <div style={{ flexShrink: 0 }}>
          <label style={labelStyle}>Avatar</label>
          <div className="flex flex-col gap-2" style={{ width: 96 }}>
            <div style={{
              width: 96,
              height: 96,
              borderRadius: 10,
              overflow: 'hidden',
              border: '2px solid rgba(var(--gold-rgb),0.3)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="Avatar selecionado" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', fontFamily: 'var(--font-cinzel)' }}>Sem avatar</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="hk-btn hk-btn-soul"
              style={{ fontSize: '0.62rem', padding: '0.4rem 0.6rem', borderRadius: 6, opacity: uploading ? 0.6 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
            >
              {uploading ? 'Enviando...' : 'Enviar imagem'}
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="hk-btn hk-btn-soul"
              style={{ fontSize: '0.62rem', padding: '0.4rem 0.6rem', borderRadius: 6, cursor: 'pointer' }}
            >
              Selecionar
            </button>
            {uploadError && (
              <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.58rem', color: 'var(--error)' }}>
                {uploadError}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6" style={{ flex: 1, minWidth: 240 }}>
          <div>
            <label style={labelStyle}>
              Nome <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => onNomeChange(e.target.value)}
              style={inputStyle}
              autoFocus
            />
          </div>

          <div className="flex items-start gap-4 flex-wrap">
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={labelStyle}>
                Espécie <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)', fontSize: '0.72rem' }}>(opcional)</span>
              </label>
              <input
                type="text"
                value={especie}
                onChange={e => onEspecieChange(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ width: 90 }}>
              <label style={labelStyle}>
                Idade <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)', fontSize: '0.72rem' }}>(opc.)</span>
              </label>
              <input
                type="number"
                min={0}
                maxLength={3}
                value={idade}
                onChange={e => onIdadeChange(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <AvatarPickerModal
        open={modalOpen}
        avatar={avatar}
        onClose={() => setModalOpen(false)}
        onSelectPreset={url => { onAvatarChange(url); setModalOpen(false) }}
      />
    </div>
  )
}
