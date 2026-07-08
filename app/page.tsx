import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import HeroSection from '@/components/landing/HeroSection'
import PrologoSection from '@/components/landing/PrologoSection'
import EcosDaCrostaSection from '@/components/landing/EcosDaCrostaSection'
// import ReinoSection from '@/components/landing/ReinoSection'
import SistemaSection from '@/components/landing/SistemaSection'

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
        <PrologoSection />
        <EcosDaCrostaSection />
        {/* <ReinoSection /> */}
        <SistemaSection />
      </main>
      <SiteFooter />
    </div>
  )
}
