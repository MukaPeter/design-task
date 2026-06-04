import { Database, Settings } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { AppShell } from '@/components/app-shell'
import { AppHeader } from '@/components/app-header'
import { TokensView } from '@/components/tokens-view'
import { supabase } from '@/lib/supabase'
import { buildTreeData } from '@/lib/tree-utils'
import type { LiveToken } from '@/components/token-grid'
import type { DtcgType } from '@/types/tokens'

const NAV_ITEMS = [
  { id: 'repositories', label: 'Repositories', icon: <Database size={16} /> },
  { id: 'settings',     label: 'Settings',     icon: <Settings size={16} /> },
]

export default async function TokenizerDemo() {
  const [{ data: repositories }, { data: collections }, { data: tokens }, { data: modeValuesRaw }] = await Promise.all([
    supabase.from('repositories').select('id, name'),
    supabase.from('collections').select('id, name'),
    supabase.from('tokens').select('id, name, dtcg_type, description, collection_id, path'),
    supabase.from('mode_values').select('token_id, value, unit'),
  ])

  const collectionMap = Object.fromEntries((collections ?? []).map(c => [c.id, c.name]))

  const treeData = buildTreeData(collections ?? [], tokens ?? [])

  const liveTokens: LiveToken[] = (tokens ?? []).map(t => ({
    id: t.id,
    name: t.name,
    type: t.dtcg_type as DtcgType,
    description: t.description,
    collection_name: collectionMap[t.collection_id] ?? '',
    path: t.path,
  }))

  const modeValues: Record<string, string> = Object.fromEntries(
    (modeValuesRaw ?? []).map(mv => [mv.token_id, String(mv.value)])
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={NAV_ITEMS} />
      <AppShell>
        <AppHeader repositories={repositories ?? []} />
        <TokensView treeData={treeData} liveTokens={liveTokens} modeValues={modeValues} />
      </AppShell>
    </div>
  )
}
