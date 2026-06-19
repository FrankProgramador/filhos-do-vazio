'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'

export default function EsqueciSenhaPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetLink, setResetLink] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const { token } = await forgotPassword(email)
      const params = new URLSearchParams({ email, token })
      setResetLink(`/redefinir-senha?${params.toString()}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível gerar o token. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <SiteHeader activePath="/esqueci-senha" />

      <main
        className="flex-1 flex items-center justify-center px-6"
        style={{ paddingTop: 104, paddingBottom: 64 }}
      >
        <div className="parchment hk-frame w-full rounded-xl p-8" style={{ maxWidth: 440 }}>
          <nav
            className="flex items-center gap-2 mb-6"
            aria-label="Navegação estrutural"
            style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            <Link href="/entrar" style={{ color: 'var(--gold-light)' }} className="transition-opacity hover:opacity-80">
              ← Entrar
            </Link>
            <span className="breadcrumb-sep" aria-hidden>◈</span>
            <span className="breadcrumb-current" aria-current="page">Esqueci minha senha</span>
          </nav>

          <h1
            className="gold-glow"
            style={{
              fontFamily: 'var(--font-cinzel-decorative)',
              fontSize: 'clamp(1.5rem, 4vw, 1.9rem)',
              fontWeight: 900,
              color: 'var(--text)',
              marginBottom: '0.4rem',
            }}
          >
            Recuperar senha
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-im-fell)',
              fontStyle: 'italic',
              fontSize: '0.9rem',
              color: 'rgba(var(--text-rgb),0.55)',
              lineHeight: 1.7,
            }}
          >
            Informe seu e-mail para gerar um token de redefinição de senha.
          </p>

          {!resetLink ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
              <label className="flex flex-col gap-1.5">
                <span className="input-label">E-mail</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              {error && (
                <div className="alert alert--error" style={{ fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="hk-btn hk-btn-gold rounded-md py-2.5 mt-2"
              >
                {isSubmitting ? 'Gerando…' : 'Gerar token de redefinição'}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-4 mt-6">
              <div className="alert alert--success" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                Token gerado. Em breve isso será enviado por e-mail — por enquanto, use o link
                abaixo para redefinir sua senha.
              </div>

              <Link href={resetLink} className="hk-btn hk-btn-gold rounded-md py-2.5 text-center">
                Redefinir senha agora
              </Link>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
