'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

export interface Repository {
  id: string
  name: string
}

interface AppHeaderProps {
  repositories: Repository[]
  defaultRepositoryId?: string
  actions?: React.ReactNode
}

export function AppHeader({ repositories, defaultRepositoryId, actions }: AppHeaderProps) {
  const [selectedId, setSelectedId] = useState(
    defaultRepositoryId ?? repositories[0]?.id ?? null
  )

  const selected = repositories.find(r => r.id === selectedId)

  return (
    <div className="h-14 flex items-center justify-between px-4 border-b shrink-0">
      {repositories.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium hover:text-foreground/80 focus:outline-none cursor-pointer">
            {selected?.name ?? 'Select repository'}
            <ChevronDown size={14} className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {repositories.map(repo => (
              <DropdownMenuItem
                key={repo.id}
                onClick={() => setSelectedId(repo.id)}
                className="flex items-center justify-between gap-4"
              >
                {repo.name}
                {repo.id === selectedId && <Check size={14} />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="text-sm text-muted-foreground">No repository</span>
      )}

      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
