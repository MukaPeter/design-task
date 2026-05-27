'use client'

import { Sidebar } from '@/components/sidebar'
import { LayoutDashboard, GitBranch, AlignLeft, ShieldAlert, FlaskConical, GitPullRequest, ScrollText } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',        icon: <LayoutDashboard size={16} /> },
  { id: 'requirements', label: 'Requirements',    icon: <AlignLeft size={16} /> },
  { id: 'traceability', label: 'Traceability',    icon: <GitBranch size={16} /> },
  { id: 'risk',         label: 'Risk Management', icon: <ShieldAlert size={16} /> },
  { id: 'tests',        label: 'Test Results',    icon: <FlaskConical size={16} /> },
  { id: 'changes',      label: 'Change Control',  icon: <GitPullRequest size={16} /> },
  { id: 'audit',        label: 'Audit Log',       icon: <ScrollText size={16} /> },
]

export default function Demo() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={NAV_ITEMS} />
      <main className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Content goes here
      </main>
    </div>
  )
}
