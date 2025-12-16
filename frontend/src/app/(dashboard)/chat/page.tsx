"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useRBAC } from "@/lib/hooks/useRBAC"
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { supabase } from '@/lib/supabase/client'

export default function ChatPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { canAccessChat } = useRBAC()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Estado local para input
  const [input, setInput] = useState('')

  // Usar useChat do AI SDK UI
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      // Headers para autenticação
      headers: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        return {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        }
      },
      body: {
        conversationId: `conv-${user?.id || 'anonymous'}-${Date.now()}`,
        userId: user?.id,
      },
    }),
    messages: [
      {
        id: '1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Olá! Sou a Gabi, Síndica Virtual do Condomínio Villa Dei Fiori. Como posso ajudá-lo hoje?' }],
      },
    ],
    onError: (error) => {
      console.error('Erro no chat:', error)
    },
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const messageToSend = input.trim()
    setInput('')
    await sendMessage({ parts: [{ type: 'text', text: messageToSend }] })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Redirecionar se não pode acessar chat
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !canAccessChat())) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (!canAccessChat()) {
        router.push("/auth/unauthorized")
      }
    }
  }, [authLoading, isAuthenticated, canAccessChat, router])

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (authLoading || !isAuthenticated || !canAccessChat()) {
    return (
      <div className="h-[calc(100vh-73px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground stroke-1" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border/50 bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Bot className="h-5 w-5 text-primary stroke-1" />
          </div>
          <div>
            <h1 className="text-base font-medium text-foreground">Gabi</h1>
            <p className="text-xs text-muted-foreground">Síndica Virtual</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message: any) => {
          const isUser = message.role === "user"
          const isAssistant = message.role === "assistant"
          const textContent = message.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || ''
          
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {isAssistant && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary stroke-1" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isUser
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {isAssistant ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{textContent}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{textContent}</p>
                )}
              </div>

              {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-foreground stroke-1" />
                </div>
              )}
            </div>
          )
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary stroke-1" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground stroke-1" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-3 justify-start">
            <div className="bg-destructive/10 text-destructive rounded-2xl px-4 py-2">
              <p className="text-sm">Erro: {error.message}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border bg-card p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1 min-h-[44px]"
            autoFocus
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="min-w-[44px] min-h-[44px] bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin stroke-1" />
            ) : (
              <Send className="h-5 w-5 stroke-1" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
