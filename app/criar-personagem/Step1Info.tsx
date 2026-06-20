'use client'

import { useRef, useState } from 'react'
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

export default function Step1Info({
  nome, idade, especie, avatar,
  onNomeChange, onIdadeChange, onEspecieChange, onAvatarChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { token } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

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
      <p style={{
        fontFamily: 'var(--font-im-fell)',
        fontStyle: 'italic',
        color: 'rgba(var(--text-rgb),0.55)',
        lineHeight: 1.8,
        maxWidth: 600,
      }}>
        Antes de definir corpo e habilidades, dê identidade ao seu inseto. O nome é
        obrigatório — os demais campos podem ser preenchidos ou ajustados depois.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label style={labelStyle}>
            Nome <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            type="text"
            value={nome}
            onChange={e => onNomeChange(e.target.value)}
            placeholder="Como seu inseto é chamado?"
            style={inputStyle}
            autoFocus
          />
        </div>

        <div>
          <label style={labelStyle}>
            Idade <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)', fontSize: '0.72rem' }}>(opcional)</span>
          </label>
          <input
            type="number"
            min={0}
            value={idade}
            onChange={e => onIdadeChange(e.target.value)}
            placeholder="Em estações de vida"
            style={inputStyle}
          />
        </div>

        <div className="md:col-span-2">
          <label style={labelStyle}>
            Espécie <span style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)', fontSize: '0.72rem' }}>(opcional)</span>
          </label>
          <input
            type="text"
            value={especie}
            onChange={e => onEspecieChange(e.target.value)}
            placeholder="Formiga, Besouro, Mariposa..."
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Avatar</label>
        <div className="flex items-start gap-6 flex-wrap">
          <div style={{
            width: 96,
            height: 96,
            borderRadius: 10,
            overflow: 'hidden',
            border: '2px solid rgba(var(--gold-rgb),0.3)',
            background: 'var(--bg-secondary)',
            flexShrink: 0,
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

          <div className="flex flex-col gap-3" style={{ flex: 1, minWidth: 240 }}>
            <p style={{
              fontFamily: 'var(--font-im-fell)',
              fontStyle: 'italic',
              fontSize: '0.78rem',
              color: 'rgba(var(--text-rgb),0.45)',
            }}>
              Escolha um avatar pronto ou envie sua própria imagem.
            </p>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => onAvatarChange(preset)}
                  className={avatar === preset ? 'card--selected' : ''}
                  style={{
                    width: 48,
                    height: 48,
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
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="hk-btn hk-btn-soul"
                style={{ fontSize: '0.68rem', padding: '0.5rem 1.1rem', borderRadius: 6, opacity: uploading ? 0.6 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
              >
                {uploading ? 'Enviando...' : 'Enviar imagem'}
              </button>
              {avatar && (
                <button
                  onClick={() => onAvatarChange(null)}
                  className="hk-btn hk-btn-soul"
                  style={{ fontSize: '0.68rem', padding: '0.5rem 1.1rem', borderRadius: 6, marginLeft: '0.5rem' }}
                >
                  Remover
                </button>
              )}
              {uploadError && (
                <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.62rem', color: 'var(--error)', marginTop: '0.5rem' }}>
                  {uploadError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
