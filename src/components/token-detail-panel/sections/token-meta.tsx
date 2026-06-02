'use client'

import type { Token } from '../types'
import { TOKEN_TYPE_ICONS, toDisplayName } from '../types'

interface Props {
  token: Token
}

export function TokenMeta({ token }: Props) {
  return (
    <table className="text-xs w-full">
      <colgroup>
        <col style={{ width: '80px' }} />
        <col style={{ width: '24px' }} />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <td className="text-muted-foreground py-1">Type</td>
          <td className="py-1">{TOKEN_TYPE_ICONS[token.type]}</td>
          <td className="font-medium py-1">{toDisplayName(token.type)}</td>
        </tr>
        <tr>
          <td className="text-muted-foreground py-1">DTCG type</td>
          <td />
          <td className="font-medium font-mono py-1">{token.type}</td>
        </tr>
        <tr>
          <td className="text-muted-foreground py-1">Name</td>
          <td />
          <td className="font-medium py-1">{token.name}</td>
        </tr>
      </tbody>
    </table>
  )
}
