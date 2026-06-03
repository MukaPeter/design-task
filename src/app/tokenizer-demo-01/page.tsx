'use client'

import { Database, Settings } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { AppShell } from '@/components/app-shell'
import { AppHeader } from '@/components/app-header'
import { TokensView } from '@/components/tokens-view'

const NAV_ITEMS = [
  { id: 'repositories', label: 'Repositories', icon: <Database size={16} /> },
  { id: 'settings',     label: 'Settings',     icon: <Settings size={16} /> },
]

const REPOSITORIES = [
  { id: 'r1', name: 'Brand tokens' },
  { id: 'r2', name: 'Product tokens' },
  { id: 'r3', name: 'Marketing tokens' },
]

export default function TokenizerDemo() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={NAV_ITEMS} />
      <AppShell>
        <AppHeader repositories={REPOSITORIES} />
        <TokensView />
      </AppShell>
    </div>
  )
}
