'use client'

import { useState } from 'react'
import { ChevronDown, Copy } from 'lucide-react'
import { TableRow, TableCell } from '@/components/ui/table'
import { SectionTable } from './section-table'
import { Input } from '@/components/ui/input'

interface CodeSyntaxEntry { id: string; name: string; value: string }

interface Props {
  defaultEntries?: CodeSyntaxEntry[]
}

const FALLBACK_ENTRIES: CodeSyntaxEntry[] = [
  { id: '1', name: 'Web',     value: '' },
  { id: '2', name: 'iOS',     value: '' },
  { id: '3', name: 'Android', value: '' },
]

export function CodeSyntax({ defaultEntries }: Props) {
  const [open, setOpen] = useState(true)
  const [entries, setEntries] = useState<CodeSyntaxEntry[]>(defaultEntries ?? FALLBACK_ENTRIES)
  const [editing, setEditing] = useState<{ id: string; field: 'name' | 'value' } | null>(null)

  return (
    <div className="flex flex-col gap-2">
      <button
        className="flex items-center gap-2 text-xs font-semibold text-foreground py-1 outline-none w-full"
        onClick={() => setOpen(o => !o)}
      >
        <ChevronDown size={12} className={`shrink-0 transition-transform duration-150 ${open ? '' : '-rotate-90'}`} />
        Code syntax
      </button>
      {open && (
        <>
          <SectionTable headers={['Name', 'Value']}>
              {entries.map(entry => (
                <TableRow key={entry.id} className="group">
                  <TableCell className="pr-3">
                    {editing?.id === entry.id && editing.field === 'name' ? (
                      <Input
                        autoFocus
                        value={entry.name}
                        onChange={e => setEntries(prev => prev.map(s => s.id === entry.id ? { ...s, name: e.target.value } : s))}
                        onBlur={() => setEditing(null)}
                        onKeyDown={e => e.key === 'Enter' && setEditing(null)}
                        className="h-6 text-xs px-1 py-0"
                      />
                    ) : (
                      <span
                        className="text-muted-foreground cursor-text hover:text-foreground"
                        onClick={() => setEditing({ id: entry.id, field: 'name' })}
                      >
                        {entry.name || <span className="italic opacity-40">name</span>}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editing?.id === entry.id && editing.field === 'value' ? (
                      <Input
                        autoFocus
                        value={entry.value}
                        onChange={e => setEntries(prev => prev.map(s => s.id === entry.id ? { ...s, value: e.target.value } : s))}
                        onBlur={() => setEditing(null)}
                        onKeyDown={e => e.key === 'Enter' && setEditing(null)}
                        className="h-6 text-xs px-1 py-0 font-mono"
                      />
                    ) : (
                      <div className="flex items-center justify-between gap-1 min-w-0">
                        <span
                          className="font-mono cursor-text truncate"
                          onClick={() => setEditing({ id: entry.id, field: 'value' })}
                        >
                          {entry.value || <span className="italic opacity-40 font-sans">value</span>}
                        </span>
                        {entry.value && (
                          <button
                            tabIndex={-1}
                            className="text-muted-foreground hover:text-foreground shrink-0 transition-opacity opacity-0 group-hover:opacity-100"
                            onClick={() => navigator.clipboard.writeText(entry.value)}
                          >
                            <Copy size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </SectionTable>
          <button
            className="text-xs text-muted-foreground hover:text-foreground mt-2 pl-[12px] w-fit"
            onClick={() => setEntries(prev => [...prev, { id: String(Date.now()), name: '', value: '' }])}
          >
            + Add
          </button>
        </>
      )}
    </div>
  )
}
