import DashboardShell from '@/components/dashboard/DashboardShell'

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell title="Painel">{children}</DashboardShell>
}
