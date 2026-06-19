'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { useAuth } from '@/app/lib/auth-context'
import { ApiError } from '@/app/lib/api'

export default function CadastroPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await register({ name, email, password, password_confirmation: passwordConfirmation })
      router.push('/painel')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a conta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <SiteHeader activePath="/cadastro" />

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
            <Link href="/" style={{ color: 'var(--gold-light)' }} className="transition-opacity hover:opacity-80">
              ← Início
            </Link>
            <span className="breadcrumb-sep" aria-hidden>◈</span>
            <span className="breadcrumb-current" aria-current="page">Criar conta</span>
          </nav>

          <h1
            className="gold-glow"
            style={{
              fontFamily: 'var(--font-cinzel-decorative)',
              fontSize: 'clamp(1.6rem, 4vw, 2.1rem)',
              fontWeight: 900,
              color: 'var(--text)',
              marginBottom: '0.4rem',
            }}
          >
            Criar conta
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
            Registre-se para criar suas fichas e participar de campanhas.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            <label className="flex flex-col gap-1.5">
              <span className="input-label">Nome</span>
              <input
                type="text"
                required
                autoComplete="name"
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

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

            <label className="flex flex-col gap-1.5">
              <span className="input-label">Senha</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                className="input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="input-label">Confirmar senha</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                className="input"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
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
              {isSubmitting ? 'Criando conta…' : 'Criar conta'}
            </button>
          </form>

          <div className="flex items-center justify-center mt-6">
            <Link href="/entrar" style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>
              Já tem uma conta? Entrar
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
