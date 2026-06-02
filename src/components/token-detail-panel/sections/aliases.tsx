'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table'

interface Alias { collection: string; group: string; token: string }

interface Props {
  aliases: Alias[]
}

export function Aliases({ aliases }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <div className="flex flex-col gap-2">
      <button
        className="flex items-center gap-2 text-xs font-semibold text-foreground py-1 outline-none w-full"
        onClick={() => setOpen(o => !o)}
      >
        <ChevronDown size={12} className={`shrink-0 transition-transform duration-150 ${open ? '' : '-rotate-90'}`} />
        Aliases
      </button>
      {open && (
        <div className="pl-[12px]">
          <Table className="text-xs">
            <TableBody>
              {aliases.map(({ collection, group, token }) => (
                <TableRow key={`${collection}/${group}/${token}`}>
                  <TableCell className="font-mono">
                    <span className="text-muted-foreground">{collection}</span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="text-muted-foreground">{group}</span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="font-medium text-foreground">{token}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
