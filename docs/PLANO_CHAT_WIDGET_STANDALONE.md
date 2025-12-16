# Plano: Chat Widget Flutuante e Sistema Standalone

**Data**: 2025-01-15  
**Objetivo**: Transformar o chat em widget flutuante e sistema standalone para totem digital e PWA

---

## 📋 Visão Geral

Este plano detalha a transformação do sistema de chat atual em:

1. **Widget Flutuante**: Balão de chat fixo na aplicação (não no menu)
2. **Página Standalone**: Chat independente para totem digital
3. **Sistema de Mensageria Autônomo**: Funcionalidade tipo WhatsApp
4. **PWA (Progressive Web App)**: Suporte para instalação como app

**Benefícios Esperados**:
- ✅ Chat sempre acessível (widget flutuante)
- ✅ Página standalone para uso dedicado
- ✅ Experiência mobile nativa (PWA)
- ✅ Sistema de mensageria completo
- ✅ Funciona offline (PWA)
- ✅ Segurança com autenticação obrigatória

**Tempo Estimado**: 20-30 horas

---

## 🎯 Arquitetura Proposta

### Estrutura de Arquivos

```
frontend/src/
├── app/
│   ├── (dashboard)/
│   │   └── chat/              # Chat integrado (manter para compatibilidade)
│   ├── chat/                  # NOVO: Página standalone do chat
│   │   ├── page.tsx           # Página standalone
│   │   └── layout.tsx         # Layout minimalista
│   └── layout.tsx             # Root layout (adicionar PWA meta tags)
│
├── components/
│   ├── chat/
│   │   ├── ChatWidget.tsx     # NOVO: Widget flutuante
│   │   ├── ChatWindow.tsx     # NOVO: Componente compartilhado de chat
│   │   ├── ChatMessage.tsx    # NOVO: Componente de mensagem
│   │   ├── ChatInput.tsx      # NOVO: Input de mensagem
│   │   └── ChatHeader.tsx     # NOVO: Header do chat
│   │
│   └── pwa/
│       └── InstallPrompt.tsx  # NOVO: Prompt de instalação PWA
│
├── lib/
│   ├── chat/
│   │   ├── useChatWidget.ts   # NOVO: Hook para widget
│   │   ├── useChatStandalone.ts # NOVO: Hook para standalone
│   │   ├── chatStorage.ts     # NOVO: Persistência local (IndexedDB)
│   │   └── chatService.ts     # NOVO: Serviço de mensageria
│   │
│   └── pwa/
│       ├── install.ts         # NOVO: Lógica de instalação PWA
│       └── serviceWorker.ts   # NOVO: Service Worker
│
└── public/
    ├── manifest.json          # NOVO: Manifest PWA
    ├── icons/                 # NOVO: Ícones PWA
    │   ├── icon-192x192.png
    │   ├── icon-512x512.png
    │   └── maskable-icon.png
    └── sw.js                  # NOVO: Service Worker
```

---

## 🎯 Fase 1: Widget Flutuante

### 1.1. Criar Componente ChatWidget

**Tempo**: 3-4 horas

**Arquivo**: `frontend/src/components/chat/ChatWidget.tsx`

**Funcionalidades**:
- Balão flutuante fixo (canto inferior direito)
- Animação de entrada/saída
- Estado minimizado/maximizado
- Badge com contador de mensagens não lidas
- Responsivo (mobile e desktop)
- Z-index alto para ficar acima de tudo
- Persistência de estado (localStorage)

**Características**:
- **Posição**: Canto inferior direito (configurável)
- **Tamanho**: 
  - Minimizado: 60x60px (balão circular)
  - Maximizado: 400x600px (desktop), 100vw x 100vh (mobile)
- **Animações**: 
  - Slide up/down ao abrir/fechar
  - Pulse no balão quando há notificações
  - Smooth transitions

**Código Estrutural**:

```typescript
// frontend/src/components/chat/ChatWidget.tsx
"use client"

import { useState, useEffect } from 'react'
import { MessageCircle, X, Minimize2 } from 'lucide-react'
import { ChatWindow } from './ChatWindow'
import { useChatWidget } from '@/lib/chat/useChatWidget'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const { unreadCount, markAsRead } = useChatWidget()

  // Persistir estado
  useEffect(() => {
    const saved = localStorage.getItem('chat-widget-state')
    if (saved) {
      const { isOpen: savedOpen } = JSON.parse(saved)
      setIsOpen(savedOpen)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chat-widget-state', JSON.stringify({ isOpen }))
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      markAsRead()
    }
  }

  return (
    <>
      {/* Widget Button (sempre visível) */}
      <button
        onClick={handleToggle}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full
          bg-primary text-white
          shadow-lg hover:shadow-xl
          transition-all duration-300
          flex items-center justify-center
          ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
          ${unreadCount > 0 ? 'animate-pulse' : ''}
        `}
        aria-label="Abrir chat"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window (quando aberto) */}
      {isOpen && (
        <div
          className={`
            fixed bottom-6 right-6 z-50
            ${isMinimized ? 'w-80 h-16' : 'w-[400px] h-[600px]'}
            max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]
            bg-card border border-border rounded-lg shadow-2xl
            flex flex-col
            transition-all duration-300
            ${isMinimized ? 'animate-slide-down' : 'animate-slide-up'}
          `}
        >
          <ChatWindow
            onClose={() => setIsOpen(false)}
            onMinimize={() => setIsMinimized(!isMinimized)}
            isMinimized={isMinimized}
            standalone={false}
          />
        </div>
      )}
    </>
  )
}
```

### 1.2. Criar Componente ChatWindow Compartilhado

**Tempo**: 4-5 horas

**Arquivo**: `frontend/src/components/chat/ChatWindow.tsx`

**Funcionalidades**:
- Componente reutilizável para widget e standalone
- Header com título e ações (minimizar, fechar)
- Área de mensagens com scroll
- Input de mensagem
- Loading states
- Error handling
- Suporte a streaming

**Props**:
- `onClose`: Callback para fechar
- `onMinimize`: Callback para minimizar (opcional)
- `isMinimized`: Estado minimizado
- `standalone`: Se é modo standalone (sem header de fechar)

### 1.3. Integrar Widget no Layout Principal

**Tempo**: 1 hora

**Arquivo**: `frontend/src/app/layout.tsx`

**Mudanças**:
- Adicionar `<ChatWidget />` no root layout
- Garantir que apareça em todas as páginas
- Não aparecer em páginas de autenticação

**Código**:

```typescript
// frontend/src/app/layout.tsx
import { ChatWidget } from '@/components/chat/ChatWidget'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ChatWidget /> {/* Widget sempre visível */}
      </body>
    </html>
  )
}
```

### 1.4. Remover Chat do Menu (Opcional)

**Tempo**: 30 minutos

**Arquivo**: `frontend/src/components/app-sidebar.tsx`

**Mudanças**:
- Remover item "Chat" do menu
- Manter rota `/chat` para compatibilidade (redirecionar para widget)

**Resultado Esperado**:
- ✅ Widget flutuante funcionando
- ✅ Chat acessível de qualquer página
- ✅ Estado persistido
- ✅ Notificações visuais

---

## 🎯 Fase 2: Página Standalone

### 2.1. Criar Página Standalone

**Tempo**: 2-3 horas

**Arquivo**: `frontend/src/app/chat/page.tsx`

**Funcionalidades**:
- Página independente do chat
- Layout minimalista (sem sidebar, sem header)
- Fullscreen (100vw x 100vh)
- Suporte a modo totem (sem autenticação opcional)
- URL pública (ex: `/chat` ou `/chat/:token`)

**Características**:
- **Autenticação Obrigatória**: 
  - Requer login para acessar
  - Usa autenticação atual (Supabase Auth)
  - Redireciona para login se não autenticado
- **Token de Acesso**: Token JWT da sessão do usuário
- **Layout**: Apenas o chat, sem elementos da aplicação (sidebar, header)

**Código Estrutural**:

```typescript
// frontend/src/app/chat/page.tsx
"use client"

import { ChatWindow } from '@/components/chat/ChatWindow'
import { useChatStandalone } from '@/lib/chat/useChatStandalone'

export default function ChatStandalonePage() {
  const { isAuthenticated, isLoading } = useChatStandalone()
  const router = useRouter()

  // Autenticação obrigatória
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/chat')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Será redirecionado
  }

  return (
    <div className="w-screen h-screen bg-background">
      <ChatWindow
        standalone={true}
        fullscreen={true}
      />
    </div>
  )
}
```

### 2.2. Criar Layout Minimalista

**Tempo**: 1 hora

**Arquivo**: `frontend/src/app/chat/layout.tsx`

**Funcionalidades**:
- Layout sem sidebar
- Layout sem header da aplicação
- Meta tags para PWA
- Viewport otimizado

### 2.3. Autenticação e Segurança

**Tempo**: 2 horas

**Funcionalidades**:
- Verificar autenticação do usuário
- Redirecionar para login se não autenticado
- Validar permissões (RBAC)
- Usar token JWT da sessão
- Proteger rotas da API

**Arquivo**: `frontend/src/lib/chat/useChatStandalone.ts`

**Código Estrutural**:

```typescript
// frontend/src/lib/chat/useChatStandalone.ts
"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRBAC } from '@/lib/hooks/useRBAC'

export function useChatStandalone() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { canAccessChat } = useRBAC()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      setIsAuthorized(isAuthenticated && canAccessChat())
    }
  }, [isAuthenticated, authLoading, canAccessChat])

  return {
    isAuthenticated,
    isAuthorized,
    isLoading: authLoading,
    user,
  }
}
```

**Resultado Esperado**:
- ✅ Página standalone funcionando
- ✅ Autenticação obrigatória
- ✅ Layout minimalista
- ✅ Validação de permissões

---

## 🎯 Fase 3: Sistema de Mensageria Autônomo

**Nota**: Esta fase requer autenticação. Todas as funcionalidades de mensageria são vinculadas ao usuário autenticado.

### 3.1. Persistência Local (IndexedDB)

**Tempo**: 4-5 horas

**Arquivo**: `frontend/src/lib/chat/chatStorage.ts`

**Funcionalidades**:
- Armazenar mensagens localmente (IndexedDB)
- Sincronização com servidor
- Cache de conversas
- Offline-first approach
- Queue de mensagens offline

**Biblioteca Sugerida**: `idb` (IndexedDB wrapper)

**Estrutura de Dados**:

```typescript
interface ChatStorage {
  userId: string  // ID do usuário autenticado
  conversations: Conversation[]
  messages: Message[]
  syncQueue: SyncItem[]
  lastSync: Date
}

interface Conversation {
  id: string
  userId: string  // Sempre vinculado ao usuário autenticado
  title: string
  lastMessage: Date
  unreadCount: number
  createdAt: Date
}

interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  synced: boolean
  sources?: Source[]
}
```

### 3.2. Serviço de Mensageria

**Tempo**: 5-6 horas

**Arquivo**: `frontend/src/lib/chat/chatService.ts`

**Funcionalidades**:
- Enviar mensagens (com autenticação)
- Receber mensagens (WebSocket ou polling com auth)
- Sincronização bidirecional (por usuário)
- Notificações push (vinculadas ao usuário)
- Histórico de conversas (do usuário autenticado)
- Busca em conversas (do usuário)
- Múltiplas conversas (por usuário)

**Arquitetura**:
- **WebSocket**: Para mensagens em tempo real (com autenticação)
- **REST API**: Para sincronização e histórico (com JWT)
- **Service Worker**: Para notificações push (vinculadas ao usuário)
- **Autenticação**: Todas as requisições incluem token JWT

**Segurança**:
- Validar token JWT em todas as requisições
- Filtrar conversas/mensagens por userId
- RLS (Row Level Security) no banco de dados
- Validação de permissões no backend

### 3.3. Múltiplas Conversas

**Tempo**: 3-4 horas

**Funcionalidades**:
- Lista de conversas (do usuário autenticado)
- Criar nova conversa (vinculada ao usuário)
- Alternar entre conversas
- Buscar conversas (do usuário)
- Arquivar conversas (do usuário)
- Deletar conversas (do usuário)

**Segurança**:
- Todas as conversas são filtradas por userId
- Validação de propriedade antes de ações
- RLS no banco garante isolamento de dados

**UI**:
- Sidebar com lista de conversas (modo desktop)
- Drawer com lista de conversas (modo mobile)
- Badge com contador de não lidas

### 3.4. Notificações Push

**Tempo**: 3-4 horas

**Funcionalidades**:
- Notificações quando app está fechado (vinculadas ao usuário)
- Notificações quando app está em background
- Som de notificação
- Badge no ícone do app (contador de não lidas do usuário)
- Configurações de notificação (por usuário)

**Segurança**:
- Notificações apenas para o usuário autenticado
- Validação de subscription no backend
- Filtro por userId nas notificações

**Resultado Esperado**:
- ✅ Mensageria completa funcionando
- ✅ Persistência local
- ✅ Sincronização offline
- ✅ Múltiplas conversas
- ✅ Notificações push

---

## 🎯 Fase 4: PWA (Progressive Web App)

### 4.1. Manifest PWA

**Tempo**: 1-2 horas

**Arquivo**: `frontend/public/manifest.json`

**Funcionalidades**:
- Configuração do app
- Ícones em múltiplos tamanhos
- Tema e cores
- Modo de exibição (standalone, fullscreen)
- Orientação (portrait, landscape)
- Shortcuts (atalhos)

**Código**:

```json
{
  "name": "Gabi - Síndica Virtual",
  "short_name": "Gabi",
  "description": "Chat com a Síndica Virtual",
  "start_url": "/chat",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#00ade8",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/maskable-icon.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Abrir Chat",
      "short_name": "Chat",
      "description": "Abrir o chat com a Gabi",
      "url": "/chat",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    }
  ]
}
```

### 4.2. Service Worker

**Tempo**: 4-5 horas

**Arquivo**: `frontend/public/sw.js`

**Funcionalidades**:
- Cache de assets estáticos
- Cache de API responses
- Estratégia de cache (Network First, Cache First, Stale While Revalidate)
- Background sync para mensagens offline
- Push notifications
- Update prompt

**Estratégias**:
- **Assets estáticos**: Cache First
- **API responses**: Network First com fallback para cache
- **Mensagens**: Background sync quando offline

### 4.3. Ícones PWA

**Tempo**: 1 hora

**Arquivos**: `frontend/public/icons/*.png`

**Tamanhos Necessários**:
- 192x192px (ícone padrão)
- 512x512px (ícone grande)
- Maskable icon (512x512px com safe area)

**Ferramentas**:
- PWA Asset Generator
- Figma/Photoshop
- Online tools (realfavicongenerator.net)

### 4.4. Prompt de Instalação

**Tempo**: 2 horas

**Arquivo**: `frontend/src/components/pwa/InstallPrompt.tsx`

**Funcionalidades**:
- Detectar se PWA pode ser instalado
- Mostrar prompt de instalação
- Botão de instalação
- Persistir escolha do usuário

**Código Estrutural**:

```typescript
// frontend/src/components/pwa/InstallPrompt.tsx
"use client"

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }

    setDeferredPrompt(null)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-6 left-6 z-50 bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start gap-3">
        <Download className="w-5 h-5 text-primary mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-sm">Instalar App</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Instale o app para acesso rápido e notificações
          </p>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <Button
        onClick={handleInstall}
        size="sm"
        className="w-full mt-3"
      >
        Instalar
      </Button>
    </div>
  )
}
```

### 4.5. Meta Tags e Configuração

**Tempo**: 1 hora

**Arquivo**: `frontend/src/app/layout.tsx`

**Mudanças**:
- Adicionar meta tags PWA
- Link para manifest.json
- Link para service worker
- Meta tags para iOS (apple-touch-icon, etc.)

**Resultado Esperado**:
- ✅ PWA instalável
- ✅ Funciona offline
- ✅ Notificações push
- ✅ Ícones e tema configurados

---

## 🎯 Fase 5: Integração e Testes

### 5.1. Integração com Sistema Atual

**Tempo**: 3-4 horas

**Tarefas**:
- Integrar widget com autenticação atual
- Integrar standalone com sistema de tokens
- Manter compatibilidade com chat atual
- Migrar dados se necessário

### 5.2. Testes

**Tempo**: 4-5 horas

**Cenários**:
1. Widget flutuante em todas as páginas
2. Página standalone acessível
3. Modo totem com token
4. PWA instalável e funcional
5. Offline mode funcionando
6. Notificações push
7. Sincronização de mensagens
8. Múltiplas conversas

### 5.3. Otimizações

**Tempo**: 2-3 horas

**Otimizações**:
- Performance do widget
- Bundle size
- Lazy loading
- Code splitting
- Image optimization

**Resultado Esperado**:
- ✅ Tudo integrado
- ✅ Testes passando
- ✅ Performance otimizada

---

## 📊 Cronograma Detalhado

| Fase | Descrição | Tempo | Dependências |
|------|-----------|-------|--------------|
| **1** | Widget Flutuante | 8-10h | - |
| **2** | Página Standalone | 6-8h | Fase 1 |
| **3** | Sistema de Mensageria | 15-19h | Fase 1, 2 |
| **4** | PWA | 8-10h | Fase 2, 3 |
| **5** | Integração e Testes | 9-12h | Todas |
| **TOTAL** | | **46-59 horas** | |

---

## 🔧 Dependências Necessárias

### Novas Dependências

```json
{
  "dependencies": {
    "idb": "^8.0.0",              // IndexedDB wrapper
    "workbox-window": "^7.0.0",   // Service Worker management
    "framer-motion": "^11.0.0"    // Animações (opcional)
  }
}
```

### Dependências Opcionais

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",  // Já existe, usar para cache
    "zustand": "^4.0.0"                 // Já existe, usar para estado global
  }
}
```

---

## 🎨 Design e UX

### Widget Flutuante

- **Posição**: Canto inferior direito (configurável)
- **Tamanho Minimizado**: 60x60px (balão circular)
- **Tamanho Maximizado**: 400x600px (desktop), fullscreen (mobile)
- **Cores**: Primary (#00ade8) para o balão
- **Animações**: Slide up/down, pulse para notificações
- **Responsivo**: Adapta-se a mobile e desktop

### Página Standalone

- **Layout**: Fullscreen, sem elementos da aplicação
- **Header**: Minimalista (apenas título e ações essenciais)
- **Background**: Dark theme (slate-950)
- **Tipografia**: Inter (já existente)

### PWA

- **Tema**: Dark (#0a0a0a background, #00ade8 primary)
- **Ícones**: Design consistente com branding
- **Splash Screen**: Cor de fundo #0a0a0a

---

## 🔐 Segurança e Autenticação

### Autenticação Obrigatória

**Widget e Standalone**:
- Usar autenticação atual (Supabase Auth)
- Token JWT para requisições
- RLS (Row Level Security) no banco
- Validação de permissões (RBAC)
- Redirecionamento para login se não autenticado

**Sistema de Mensageria**:
- Todas as conversas vinculadas ao userId
- Validação de token JWT em todas as requisições
- Filtro por userId no frontend e backend
- RLS garante isolamento de dados no banco
- Validação de propriedade antes de ações (editar, deletar)

**API Endpoints Protegidos**:
- Todas as rotas de chat requerem autenticação
- Validação de token JWT no middleware
- Verificação de permissões (canAccessChat)

**Exemplo de Proteção**:

```typescript
// API Route protegida
export async function POST(req: NextRequest) {
  // Verificar autenticação
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return new Response('Não autorizado', { status: 401 })
  }

  // Verificar permissões
  const { canAccessChat } = await checkPermissions(user.id)
  if (!canAccessChat) {
    return new Response('Sem permissão', { status: 403 })
  }

  // Processar requisição...
  // Todas as operações são filtradas por userId
}
```

---

## 📱 Funcionalidades Mobile

### PWA Features

- **Instalação**: Prompt nativo
- **Offline**: Funciona sem internet (cache + IndexedDB)
- **Notificações**: Push notifications
- **Badge**: Contador de mensagens não lidas
- **Splash Screen**: Tela de carregamento
- **Fullscreen**: Modo standalone

### Mobile Optimizations

- Touch gestures (swipe para fechar)
- Keyboard handling (iOS/Android)
- Viewport fixes
- Safe area insets (notch, etc.)

---

## 🚀 Deploy e Configuração

### Variáveis de Ambiente

```env
# Chat Standalone (sempre requer autenticação)
NEXT_PUBLIC_CHAT_URL=/chat   # URL do chat standalone

# PWA
NEXT_PUBLIC_PWA_ENABLED=true
NEXT_PUBLIC_PWA_NAME="Gabi - Síndica Virtual"

# Autenticação (já existentes)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Build e Deploy

- PWA requer HTTPS (Vercel já fornece)
- Service Worker precisa estar em `/sw.js` ou `/service-worker.js`
- Manifest precisa estar em `/manifest.json`
- Ícones precisam estar em `/icons/`

---

## 📊 Métricas de Sucesso

### Widget

- ✅ Visível em todas as páginas
- ✅ Abre/fecha suavemente
- ✅ Notificações visuais funcionando
- ✅ Estado persistido

### Standalone

- ✅ Acessível via URL `/chat`
- ✅ Requer autenticação obrigatória
- ✅ Layout minimalista
- ✅ Responsivo
- ✅ Redireciona para login se não autenticado

### Mensageria

- ✅ Múltiplas conversas
- ✅ Persistência local
- ✅ Sincronização offline
- ✅ Notificações push

### PWA

- ✅ Instalável
- ✅ Funciona offline
- ✅ Notificações funcionando
- ✅ Performance adequada

---

## 🔄 Estratégia de Migração

### Fase 1: Widget (Sem Remover Menu)

- Adicionar widget
- Manter menu item
- Usuários podem escolher

### Fase 2: Remover Menu (Opcional)

- Remover item do menu
- Manter rota `/chat` (redireciona para widget)

### Fase 3: Standalone

- Adicionar página standalone
- Implementar autenticação obrigatória
- Testar fluxo de login/redirecionamento
- Ajustar conforme feedback

### Fase 4: PWA

- Adicionar PWA
- Testar instalação
- Validar offline mode

---

## 🚨 Considerações Importantes

### Performance

- Widget não deve impactar performance da aplicação
- Lazy load do chat quando widget é aberto
- Code splitting para reduzir bundle inicial

### Acessibilidade

- ARIA labels em todos os elementos
- Navegação por teclado
- Screen reader support
- Contraste adequado

### Compatibilidade

- Testar em diferentes navegadores
- Testar em diferentes dispositivos
- Testar PWA em iOS e Android
- Fallbacks para funcionalidades não suportadas

### Privacidade

- Dados locais vinculados ao usuário autenticado
- Limpar dados locais ao fazer logout
- Consentimento para notificações
- Política de privacidade
- Isolamento de dados por usuário (RLS)

---

## 📝 Próximos Passos (Quando Aprovado)

1. **Revisar e Aprovar Plano**
2. **Criar Branch**: `feature/chat-widget-standalone`
3. **Fase 1**: Implementar widget flutuante
4. **Fase 2**: Implementar página standalone
5. **Fase 3**: Implementar mensageria
6. **Fase 4**: Implementar PWA
7. **Fase 5**: Testes e ajustes
8. **Deploy**: Deploy gradual (feature flag)

---

## 🔗 Referências

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push Notifications](https://web.dev/push-notifications-overview/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Framer Motion](https://www.framer.com/motion/) (para animações)

---

**Última Atualização**: 2025-01-15

