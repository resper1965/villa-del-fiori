# Instruções: Configuração do AI Gateway

**Data**: 2025-01-15

---

## 📋 Pré-requisitos

A implementação do AI Gateway e AI SDK UI foi concluída. Agora é necessário configurar o AI Gateway no dashboard da Vercel.

---

## 🎯 Passo 1: Configurar AI Gateway no Dashboard da Vercel

### 1.1. Acessar Dashboard

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto `villadelfiori` (ou crie se necessário)

### 1.2. Criar AI Gateway

1. Navegue para **AI** → **AI Gateway**
2. Clique em **"Create Gateway"** ou **"Get Started"**
3. Configure:
   - **Nome**: `gabi-ai-gateway` (ou similar)
   - **Provider Principal**: OpenAI
   - **Modelos**: 
     - `text-embedding-3-small` (embeddings)
     - `gpt-4o-mini` (chat)

### 1.3. Configurar Provedor OpenAI

1. No AI Gateway, adicionar provedor **OpenAI**:
   - **API Key**: Use sua chave OpenAI existente
   - **Modelos disponíveis**: Selecionar modelos necessários
   - **Configurar como provedor principal**

### 1.4. Obter Credenciais

1. No AI Gateway, navegue para **Settings** → **Authentication**
2. Copie:
   - **Gateway URL**: Endpoint do gateway (ex: `https://gateway.vercel.ai/v1`)
   - **API Key**: Chave de autenticação do gateway (formato: `vgw_...`)

---

## 🔧 Passo 2: Configurar Variáveis de Ambiente

### 2.1. Variáveis Locais (`.env.local`)

Adicione ao arquivo `frontend/.env.local`:

```env
# AI Gateway
VERCEL_AI_GATEWAY_URL=https://gateway.vercel.ai/v1
VERCEL_AI_GATEWAY_KEY=vgw_...

# Supabase (já existentes)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2.2. Variáveis na Vercel (Produção)

1. Acesse **Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**
2. Adicione as seguintes variáveis para **todos os ambientes** (Production, Preview, Development):

   - `VERCEL_AI_GATEWAY_URL` = `https://gateway.vercel.ai/v1` (ou URL fornecida)
   - `VERCEL_AI_GATEWAY_KEY` = `vgw_...` (marcar como **Sensitive**)
   - `SUPABASE_SERVICE_ROLE_KEY` = `...` (se não existir, marcar como **Sensitive**)

### 2.3. Variáveis no Supabase (Edge Functions)

1. Acesse **Supabase Dashboard** → **Edge Functions** → **Settings**
2. Adicione as seguintes **Secrets**:

   - `VERCEL_AI_GATEWAY_URL` = `https://gateway.vercel.ai/v1` (ou URL fornecida)
   - `VERCEL_AI_GATEWAY_KEY` = `vgw_...` (marcar como **Secret**)

**Nota**: As Edge Functions usarão AI Gateway se `VERCEL_AI_GATEWAY_KEY` estiver configurado, caso contrário usarão `OPENAI_API_KEY` como fallback.

---

## ✅ Verificação

Após configurar:

1. **Frontend**: O chat deve usar streaming (respostas aparecem em tempo real)
2. **Edge Functions**: `ingest-process` e `ingest-document` devem usar AI Gateway para embeddings
3. **Monitoramento**: Verificar dashboard do AI Gateway para uso e custos

---

## 🔄 Fallback

Se o AI Gateway não estiver configurado:

- **Frontend**: Retornará erro "AI Gateway não configurado"
- **Edge Functions**: Usarão `OPENAI_API_KEY` diretamente (comportamento anterior)

---

## 📊 Monitoramento

Após configurar, monitore:

- **Dashboard do AI Gateway**: Uso de tokens, custos, latência
- **Logs da Vercel**: Verificar se API route está funcionando
- **Logs do Supabase**: Verificar se Edge Functions estão usando AI Gateway

---

**Última Atualização**: 2025-01-15

