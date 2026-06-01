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
  attachments?: string[]
}

export interface ChatProps {
  initialMessages?: ChatMessage[]
  messages?: ChatMessage[]
  onMessagesChange?: (messages: ChatMessage[]) => void
  placeholder?: string
  onSend?: (text: string) => void
  theirName?: string
  myName?: string
  onArtifactClick?: (id: string) => void
}

const ARTIFACT_RE = /\b(REQ|RISK|SPEC|TEST|HAZ|SOP|DOC)[-][A-Z0-9]+(?:[-][A-Z0-9]+)*/g
const LINK_RE = /\b(PR\s*#\d+|KTX-\d+)/g

function renderParagraph(text: string, onArtifactClick?: (id: string) => void, dark?: boolean): React.ReactNode {
  const linkClass = dark ? 'text-white underline font-medium' : 'text-primary underline font-medium'
  const combined = new RegExp(`${ARTIFACT_RE.source}|${LINK_RE.source}`, 'g')
  const parts: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  while ((match = combined.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    if (LINK_RE.test(token)) {
      parts.push(<a key={match.index} href="#" className={linkClass}>{token}</a>)
    } else if (onArtifactClick) {
      parts.push(<span key={match.index} className={`${linkClass} cursor-pointer`} onClick={() => onArtifactClick(token)}>{token}</span>)
    } else {
      parts.push(token)
    }
    last = match.index + token.length
    LINK_RE.lastIndex = 0
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

function MessageText({ text, onArtifactClick, dark }: { text: string; onArtifactClick?: (id: string) => void; dark?: boolean }) {
  const paragraphs = text.split('\n\n').filter(Boolean)
  if (paragraphs.length <= 1) return <>{renderParagraph(text, onArtifactClick, dark)}</>
  return (
    <div className="space-y-2">
      {paragraphs.map((p, i) => (
        <p key={i}>{renderParagraph(p, onArtifactClick, dark)}</p>
      ))}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Chat({
  initialMessages = [],
  messages: controlledMessages,
  onMessagesChange,
  placeholder = 'Type a message...',
  onSend,
  theirName,
  myName,
  onArtifactClick,
}: ChatProps) {
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>(initialMessages)
  const messages = controlledMessages ?? internalMessages
  const setMessages = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    const next = typeof updater === 'function' ? updater(messages) : updater
    if (onMessagesChange) onMessagesChange(next)
    else setInternalMessages(next)
  }
  const [input, setInput] = useState('')
  const bottomRef         = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text) return
    const msg: ChatMessage = { id: Date.now(), from: 'me', text }
    setMessages([...messages, msg])
    setInput('')
    onSend?.(text)
  }

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
              <MessageText text={msg.text} onArtifactClick={msg.from === 'them' ? onArtifactClick : undefined} dark={msg.from === 'me'} />
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-col gap-1 mt-2">
                  {msg.attachments.map((file, i) => (
                    <div key={i} className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium ${msg.from === 'me' ? 'bg-white/20 text-white' : 'bg-white border border-border text-foreground'}`}>
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      {file}
                    </div>
                  ))}
                </div>
              )}
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
