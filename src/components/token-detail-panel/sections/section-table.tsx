'use client'

import { Table, TableHeader, TableBody, TableHead, TableRow } from '@/components/ui/table'

interface Props {
  headers?: string[]
  cols?: number
  children: React.ReactNode
}

export function SectionTable({ headers, cols, children }: Props) {
  const colCount = cols ?? headers?.length ?? 2
  return (
    <div className="pl-[12px] overflow-x-auto">
      <Table className="text-xs table-fixed">
        <colgroup>
          <col style={{ width: '92px' }} />
          {Array.from({ length: colCount - 1 }).map((_, i) => <col key={i} />)}
        </colgroup>
        {headers && headers.length > 0 && (
          <TableHeader>
            <TableRow>
              {headers.map((h) => (
                <TableHead key={h} className="text-foreground whitespace-nowrap">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  )
}
