'use client'

import Link from 'next/link'
import { useAuth } from '@/app/lib/auth-context'
import { IconBook, IconMap, IconQuestion, IconScroll } from '@/components/dashboard/icons'

const quickActions = [
  { href: '/criar-personagem', label: 'Criar Personagem', desc: 'Inicie a criação de uma nova ficha.', icon: IconScroll },
  { href: '/locais', label: 'Explorar o Mundo', desc: 'Conheça os locais de Hallownest.', icon: IconMap },
  { href: '/historia', label: 'Ler a História', desc: 'Mergulhe no legado do reino.', icon: IconBook, accent: 'void' },
  { href: '/como-jogar', label: 'Como Jogar', desc: 'Revise as regras do sistema.', icon: IconQuestion },
]

export default function PainelPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-8" style={{ maxWidth: 1100 }}>
      <div>
        <h1
          className="gold-glow"
          style={{
            fontFamily: 'var(--font-cinzel-decorative)',
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            fontWeight: 900,
            color: 'var(--text)',
            marginBottom: '0.4rem',
          }}
        >
          Bem-vindo(a), {user?.name}
        </h1>
        <p style={{ color: 'rgba(var(--text-rgb),0.6)', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
          Hallownest aguarda. Escolha seu próximo passo.
        </p>
      </div>

      <div>
        <h2 className="ddb-section-title">Ações Rápidas</h2>
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {quickActions.map(({ href, label, desc, icon: Icon, accent }) => (
            <Link key={href} href={href} className={`ddb-action-card ${accent === 'void' ? 'void-accent' : ''}`}>
              <Icon className="dash-nav-icon" />
              <p style={{ color: 'var(--text)', fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem' }}>{label}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="ddb-panel p-5">
        <h2 className="ddb-section-title">Atividade Recente</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-im-fell)', fontStyle: 'italic' }}>
          Nenhuma atividade por aqui ainda. Suas fichas e campanhas aparecerão neste espaço.
        </p>
      </div>
    </div>
  )
}
