'use client'

import { X } from 'lucide-react'
import type { Token } from './types'
import { TokenMeta } from './sections/token-meta'
import { TokenTypeContent } from './token-type-content'
import type { NumberIntent } from './sections/values-number'

interface Props {
  token: Token
  modeValues: Record<string, string>
  onClose: () => void
  numberIntent: NumberIntent
  onNumberIntentChange: (intent: NumberIntent) => void
}

export function TokenDetailPanel({ token, modeValues, onClose, numberIntent, onNumberIntentChange }: Props) {
  return (
    <div className="h-full bg-background flex flex-col">
      <div className="h-14 flex items-center px-4 border-b shrink-0 justify-between">
        <span className="text-sm font-semibold">Token details</span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-4 flex flex-col gap-6 text-xs">
        <TokenMeta token={token} />
        <TokenTypeContent token={token} modeValues={modeValues} numberIntent={numberIntent} onNumberIntentChange={onNumberIntentChange} />
      </div>
    </div>
  )
}
