'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: number
  from: 'me' | 'them'
  text: string
}

export interface ChatProps {
  initialMessages?: ChatMessage[]
  placeholder?: string
  onSend?: (text: string) => void
  theirName?: string
  myName?: string
  onArtifactClick?: (id: string) => void
}

const ARTIFACT_RE = /\b(REQ|RISK|SPEC|TEST|HAZ|SOP|DOC)[-][A-Z0-9]+(?:[-][A-Z0-9]+)*/g

function MessageText({ text, onArtifactClick }: { text: string; onArtifactClick?: (id: string) => void }) {
  if (!onArtifactClick) return <>{text}</>
  const parts: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  ARTIFACT_RE.lastIndex = 0
  while ((match = ARTIFACT_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const id = match[0]
    parts.push(
      <span key={match.index} className="text-primary underline cursor-pointer font-medium" onClick={() => onArtifactClick(id)}>{id}</span>
    )
    last = match.index + id.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Chat({
  initialMessages = [],
  placeholder = 'Type a message...',
  onSend,
  theirName,
  myName,
  onArtifactClick,
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput]       = useState('')
  const bottomRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text) return

    const msg: ChatMessage = { id: Date.now(), from: 'me', text }
    setMessages(prev => [...prev, msg])
    setInput('')
    onSend?.(text)
  }

  // Expose addMessage so a parent / API route can push messages in
  function addMessage(msg: Omit<ChatMessage, 'id'>) {
    setMessages(prev => [...prev, { ...msg, id: Date.now() }])
  }

  // Attach addMessage to the component so callers can use a ref if needed
  // (for LLM streaming responses, call addMessage from onSend callback)

  return (
    <div className="flex flex-col h-full">

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn('flex items-end gap-2', msg.from === 'me' && 'flex-row-reverse')}
          >
            <div className={cn(
              'max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
              msg.from === 'me'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-gray-100 text-foreground rounded-bl-sm'
            )}>
              {msg.from === 'them' && theirName && (
                <div className="font-semibold text-xs mb-2">{theirName}</div>
              )}
              {msg.from === 'me' && myName && (
                <div className="font-semibold text-xs mb-2 text-primary-foreground/80">{myName}</div>
              )}
              <MessageText text={msg.text} onArtifactClick={msg.from === 'them' ? onArtifactClick : undefined} />
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-3 py-3 flex gap-2 shrink-0">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={placeholder}
          className="text-sm"
        />
        <Button size="sm" onClick={send}>Send</Button>
      </div>

    </div>
  )
}
