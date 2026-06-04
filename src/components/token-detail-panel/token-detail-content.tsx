'use client'

import React from 'react'
import type { Token } from './types'
import type { NumberIntent } from '@/types/tokens'
import { TokenMeta } from './sections/token-meta'
import { Description } from './sections/description'
import { TOKEN_CONFIGS, DEFAULT_CONFIG } from './token-configs'
import { Separator } from '@/components/ui/separator'

interface Props {
  token: Token
  modeValues: Record<string, string>
  numberIntent: NumberIntent
  onNumberIntentChange: (intent: NumberIntent) => void
}

export function TokenDetailContent({ token, modeValues, numberIntent, onNumberIntentChange }: Props) {
  const config = TOKEN_CONFIGS[token.type] ?? DEFAULT_CONFIG

  const sections = config.sections({ modeValues, numberIntent, onNumberIntentChange })

  return (
    <div className="p-panel-padding flex flex-col gap-6 text-xs">
      <TokenMeta token={token} />
      <Description text={config.description} />
      <Separator />
      {sections.map((section, i) => (
        <React.Fragment key={i}>
          {section}
          {i < sections.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </div>
  )
}
