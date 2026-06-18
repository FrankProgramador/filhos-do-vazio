import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import HeroSection from '@/components/landing/HeroSection'
import ReinoSection from '@/components/landing/ReinoSection'
import LegadoSection from '@/components/landing/LegadoSection'
import SistemaSection from '@/components/landing/SistemaSection'
import PartidasSection from '@/components/landing/PartidasSection'

export const metadata: Metadata = {
  title: 'Filhos do Vazio – Aventuras em um reino decadente de insetos',
  description: 'Um RPG de mesa inspirado em Hollow Knight. Forje seu legado nas sombras de Hallownest.',
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <SiteHeader activePath="/" />
      <main>
        <HeroSection />
        <ReinoSection />
        <LegadoSection />
        <SistemaSection />
        <PartidasSection />
      </main>
      <SiteFooter />
    </div>
  )
}
