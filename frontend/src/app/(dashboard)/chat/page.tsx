"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useRBAC } from "@/lib/hooks/useRBAC"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  role: "user" | "bot"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { canAccessChat, canAccessDashboard } = useRBAC()
  
  // Redirecionar se não pode acessar chat
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !canAccessChat())) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (!canAccessChat()) {
        router.push("/auth/unauthorized")
      }
    }
  }, [authLoading, isAuthenticated, canAccessChat, canAccessDashboard, router])
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Olá! Sou a Gabi, Síndica Virtual do Condomínio Villa Dei Fiori. Como posso ajudá-lo hoje?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focar no input ao carregar
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      inputRef.current?.focus()
    }
  }, [authLoading, isAuthenticated])

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isLoading) return

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setSuggestions([])

    try {
      // Importar função de chat dinamicamente para evitar erro de importação circular
      const { sendChatMessage } = await import('@/lib/api/chat')
      
      // Chamar API de chat com RAG
      const response = await sendChatMessage(text)

      if (response.success && response.message) {
        // Resposta do bot com RAG
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: response.message,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])

        // Se houver fontes, adicionar como informação adicional
        if (response.sources && response.sources.length > 0) {
          const sourcesText = `\n\n*Fontes: ${response.sources.map(s => s.process_name).join(', ')}*`
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage && lastMessage.role === 'bot') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + sourcesText }
              ]
            }
            return prev
          })
        }
      } else {
        // Erro ou resposta vazia
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: response.message || "Desculpe, não consegui processar sua mensagem. Tente novamente.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "bot" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary stroke-1" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === "user"
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground"
              }`}
            >
              {message.role === "bot" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-foreground stroke-1" />
              </div>
            )}
          </div>
        ))}

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

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 border-t border-border bg-card">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(suggestion)}
                className="text-xs"
                disabled={isLoading}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border bg-card p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
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

