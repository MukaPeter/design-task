'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  onSend?: (text: string) => void          // hook in real API here
  theirInitials?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Chat({
  initialMessages = [],
  placeholder = 'Type a message...',
  onSend,
  theirInitials = 'A',
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
            {msg.from === 'them' && (
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarFallback className="text-xs">{theirInitials}</AvatarFallback>
              </Avatar>
            )}
            <div className={cn(
              'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
              msg.from === 'me'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted rounded-bl-sm'
            )}>
              {msg.text}
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
