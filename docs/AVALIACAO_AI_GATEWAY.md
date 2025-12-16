# Avaliação: AI Gateway da Vercel

**Data**: 2025-01-15  
**Referência**: [Vercel AI Gateway Documentation](https://vercel.com/docs/ai-gateway)

---

## 📋 Contexto Atual

### Uso de IA no Projeto

O projeto **Gabi - Síndica Virtual** utiliza OpenAI API em três contextos principais:

1. **Geração de Embeddings** (`ingest-process`, `ingest-document`)
   - Modelo: `text-embedding-3-small` (1536 dimensões)
   - Uso: Indexação de processos e documentos na base de conhecimento
   - Frequência: Quando processos são aprovados ou documentos são cadastrados

2. **Chat com RAG** (`chat-with-rag`)
   - Modelo: `gpt-4o-mini` (ou similar)
   - Uso: Geração de respostas baseadas em processos/documentos indexados
   - Frequência: A cada pergunta do usuário no chat

3. **Geração de Diagramas Mermaid** (`generate-mermaid-diagram`)
   - Modelo: `gpt-4o-mini` (ou similar)
   - Uso: Geração automática de diagramas de processos
   - Frequência: Opcional, quando solicitado

### Arquitetura Atual

- **Edge Functions**: Supabase Edge Functions (Deno)
- **Configuração**: `OPENAI_API_KEY` armazenada como Secret no Supabase
- **Chamadas**: Diretas à API da OpenAI via `fetch()`
- **Deploy**: Frontend na Vercel, Backend (Edge Functions) no Supabase

---

## 🎯 O Que é o AI Gateway da Vercel

O **AI Gateway** é um serviço da Vercel que fornece:

- **API Unificada**: Um único endpoint para acessar múltiplos provedores de IA
- **Alta Confiabilidade**: Retry automático e fallback entre provedores
- **Monitoramento**: Observabilidade de uso e custos
- **Orçamentos**: Controle de gastos por modelo/provedor
- **Sem Markup**: 0% de markup nos tokens (mesmo preço do provedor)
- **Compatibilidade OpenAI**: API compatível com OpenAI SDK

---

## ✅ Benefícios Potenciais

### 1. **Unificação de Endpoints**

**Situação Atual**:
- Cada Edge Function chama diretamente a API da OpenAI
- Múltiplas configurações de `OPENAI_API_KEY` (uma por função)

**Com AI Gateway**:
- Um único endpoint unificado da Vercel
- Uma única chave de autenticação (Vercel)
- Código mais simples e centralizado
- Suporte a mais de 100 modelos de diferentes provedores

**Impacto**: ⭐⭐⭐ (Médio-Alto)

### 2. **Alta Confiabilidade e Fallback**

**Situação Atual**:
- Se OpenAI falhar, a requisição falha
- Sem retry automático configurado
- Sem fallback para outros provedores

**Com AI Gateway**:
- Retry automático em caso de falha
- Fallback automático para outros provedores (ex: Anthropic, Google)
- Maior disponibilidade do serviço

**Impacto**: ⭐⭐⭐⭐ (Alto) - Importante para produção

### 3. **Monitoramento e Observabilidade**

**Situação Atual**:
- Logs apenas no Supabase Dashboard
- Sem visibilidade centralizada de uso
- Dificuldade para rastrear custos por funcionalidade

**Com AI Gateway**:
- Dashboard unificado na Vercel
- Métricas de uso por modelo/provedor
- Rastreamento de custos em tempo real
- Logs centralizados

**Impacto**: ⭐⭐⭐⭐⭐ (Muito Alto) - Essencial para gestão de custos

### 4. **Controle de Orçamentos**

**Situação Atual**:
- Sem controle de orçamento
- Risco de custos inesperados
- Sem alertas de uso excessivo

**Com AI Gateway**:
- Definir orçamentos por modelo/provedor
- Alertas automáticos quando próximo do limite
- Bloqueio automático ao exceder orçamento

**Impacto**: ⭐⭐⭐⭐⭐ (Muito Alto) - Crítico para controle financeiro

### 5. **Load Balancing e Rate Limiting**

**Situação Atual**:
- Sem balanceamento de carga
- Rate limiting gerenciado pela OpenAI
- Sem otimização de custos por provedor

**Com AI Gateway**:
- Load balancing entre múltiplos provedores
- Rate limiting configurável
- Otimização automática de custos
- **Latência baixa**: Roteamento com latência inferior a 20ms
- **Tempos de inferência estáveis**: Independente do provedor

**Impacto**: ⭐⭐⭐⭐ (Alto) - Melhora performance e escala

### 6. **Compatibilidade OpenAI**

**Situação Atual**:
- Código específico para OpenAI
- Difícil migrar para outros provedores

**Com AI Gateway**:
- API compatível com OpenAI SDK
- Migração mínima de código
- Facilita teste de outros provedores

**Impacto**: ⭐⭐⭐⭐ (Alto) - Flexibilidade futura

### 7. **Sem Markup de Custos**

**Situação Atual**:
- Custo direto da OpenAI
- Sem intermediários

**Com AI Gateway**:
- **0% markup** - Mesmo preço da OpenAI
- Sem custos adicionais nos tokens
- **BYOK (Bring Your Own Key)**: Suportado sem markup
- Benefícios sem custo extra
- **Fase atual**: Gratuito durante fase alfa (com limites baseados no plano Vercel)

**Impacto**: ⭐⭐⭐⭐⭐ (Muito Alto) - Sem custo adicional

---

## ⚠️ Desvantagens e Considerações

### 1. **Dependência Adicional**

**Impacto**: ⭐⭐ (Baixo-Médio)

- Adiciona uma camada de dependência (Vercel AI Gateway)
- Se Vercel falhar, todo o sistema de IA falha
- **Mitigação**: 
  - AI Gateway tem alta disponibilidade
  - Failover automático entre provedores
  - Latência baixa (< 20ms) garante performance
  - BYOK permite usar chaves próprias dos provedores

### 2. **Migração de Código**

**Impacto**: ⭐⭐⭐ (Médio)

- Requer atualização das Edge Functions
- Mudança de endpoint e autenticação
- Testes necessários para validar funcionamento

**Esforço Estimado**: 2-4 horas de desenvolvimento + testes

### 3. **Arquitetura Híbrida**

**Impacto**: ⭐⭐ (Baixo-Médio)

- Frontend na Vercel
- Edge Functions no Supabase
- AI Gateway na Vercel
- **Consideração**: Não é um problema, mas adiciona complexidade arquitetural

### 4. **Limitações de Provedores**

**Impacto**: ⭐ (Baixo)

- Mais de 100 modelos suportados de diversos provedores
- OpenAI está totalmente suportado
- Suporte a múltiplos provedores: Anthropic, Google, xAI, Groq, Perplexity, Together AI, etc.
- **Mitigação**: Amplo suporte reduz limitações

### 5. **Configuração Inicial**

**Impacto**: ⭐⭐ (Baixo-Médio)

- Requer configuração no dashboard da Vercel
- Configuração de orçamentos e alertas
- Integração simples com AI SDK da Vercel
- **Esforço**: ~30 minutos de configuração
- **Facilidade**: Construído sobre AI SDK, facilitando integração

---

## 💰 Análise de Custos

### Situação Atual

- **Custo**: Direto da OpenAI
- **Modelo Embeddings**: `text-embedding-3-small` - $0.02 por 1M tokens
- **Modelo Chat**: `gpt-4o-mini` - ~$0.15 por 1M tokens input, $0.60 por 1M tokens output
- **Sem markup**: Custo direto

### Com AI Gateway

- **Custo**: Mesmo da OpenAI (0% markup)
- **Benefícios adicionais**: Sem custo extra
- **Economia potencial**: Pode reduzir custos com fallback para provedores mais baratos
- **Fase atual**: Gratuito durante fase alfa (com limites baseados no plano Vercel)
- **Futuro**: Modelo de pagamento conforme uso, sem acréscimos nos preços dos tokens
- **BYOK**: Suportado sem markup adicional

**Conclusão**: ✅ **Sem impacto negativo nos custos, potencialmente gratuito durante fase alfa**

---

## 🏗️ Impacto na Arquitetura

### Mudanças Necessárias

1. **Edge Functions** (Supabase):
   - Alterar endpoint de `https://api.openai.com/v1/...` para endpoint do AI Gateway da Vercel
   - Alterar autenticação de `Bearer ${OPENAI_API_KEY}` para `Bearer ${VERCEL_AI_GATEWAY_KEY}`
   - Código permanece praticamente igual (compatibilidade OpenAI)
   - **Nota**: Endpoint exato será obtido após configuração no dashboard da Vercel

2. **Configuração**:
   - Remover `OPENAI_API_KEY` dos Secrets do Supabase
   - Adicionar `VERCEL_AI_GATEWAY_KEY` nos Secrets do Supabase
   - Configurar AI Gateway no dashboard da Vercel

3. **Variáveis de Ambiente**:
   - Adicionar variável `VERCEL_AI_GATEWAY_KEY` no Supabase
   - Adicionar variável `VERCEL_AI_GATEWAY_URL` no Supabase (endpoint)
   - Configurar orçamentos e alertas no Vercel (opcional)

### Arquitetura Proposta

```
Frontend (Vercel)
    ↓
Edge Functions (Supabase)
    ↓
AI Gateway (Vercel)
    ↓
OpenAI API (ou outros provedores)
```

---

## 📊 Casos de Uso Específicos

### 1. **Geração de Embeddings**

**Atual**:
```typescript
const response = await fetch('https://api.openai.com/v1/embeddings', {
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'text-embedding-3-small',
    input: text,
  }),
});
```

**Com AI Gateway**:
```typescript
// Endpoint será fornecido após configuração no dashboard da Vercel
const AI_GATEWAY_URL = Deno.env.get('VERCEL_AI_GATEWAY_URL') // Ex: https://gateway.vercel.ai/v1
const response = await fetch(`${AI_GATEWAY_URL}/embeddings`, {
  headers: {
    'Authorization': `Bearer ${VERCEL_AI_GATEWAY_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'text-embedding-3-small',
    input: text,
  }),
});
```

**Mudança**: Mínima (apenas endpoint e chave)

### 2. **Chat com RAG**

**Atual**:
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [...],
  }),
});
```

**Com AI Gateway**:
```typescript
// Endpoint será fornecido após configuração no dashboard da Vercel
const AI_GATEWAY_URL = Deno.env.get('VERCEL_AI_GATEWAY_URL') // Ex: https://gateway.vercel.ai/v1
const response = await fetch(`${AI_GATEWAY_URL}/chat/completions`, {
  headers: {
    'Authorization': `Bearer ${VERCEL_AI_GATEWAY_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [...],
  }),
});
```

**Mudança**: Mínima (apenas endpoint e chave)

---

## 🎯 Recomendação

### ✅ **ALTAMENTE RECOMENDADO** para este projeto

### Razões:

1. **Monitoramento de Custos** ⭐⭐⭐⭐⭐
   - Projeto em produção precisa de controle financeiro
   - Base de conhecimento pode gerar muitos embeddings
   - Chat pode ter uso variável

2. **Alta Confiabilidade** ⭐⭐⭐⭐
   - Sistema crítico para usuários
   - Fallback automático aumenta disponibilidade
   - Retry automático reduz falhas

3. **Sem Custo Adicional** ⭐⭐⭐⭐⭐
   - 0% markup significa mesmo custo
   - Benefícios sem pagar mais

4. **Facilita Escalabilidade** ⭐⭐⭐⭐
   - Preparado para crescimento
   - Facilita migração para outros provedores
   - Load balancing automático

5. **Esforço de Migração Baixo** ⭐⭐⭐⭐
   - Mudança mínima de código
   - Compatibilidade OpenAI facilita migração
   - Testes rápidos

### Quando Implementar

- ✅ **Imediatamente**: Se houver preocupação com custos
- ✅ **Imediatamente**: Se quiser melhor observabilidade
- ⏳ **Futuro**: Se o sistema atual estiver funcionando bem e não houver urgência

### Prioridade

**Prioridade**: **ALTA**

- Não é crítico para funcionamento básico
- Mas traz benefícios significativos:
  - **Gratuito durante fase alfa** (economia imediata)
  - Monitoramento de custos essencial para produção
  - Alta confiabilidade com failover automático
  - Latência baixa (< 20ms) melhora experiência
- Esforço de implementação é baixo
- **Recomendado para implementação imediata** devido à fase alfa gratuita

---

## 📝 Plano de Implementação (Se Aprovado)

### Fase 1: Configuração (30 min)

1. Acessar dashboard da Vercel → AI Gateway
2. Criar/Configurar AI Gateway
3. Configurar provedores (OpenAI como principal)
4. Configurar orçamentos e alertas (opcional)
5. Obter chave de autenticação e endpoint
6. Configurar BYOK (Bring Your Own Key) se necessário

### Fase 2: Migração de Código (2-4 horas)

1. Atualizar `ingest-process/index.ts`
2. Atualizar `ingest-document/index.ts`
3. Atualizar `chat-with-rag/index.ts`
4. Atualizar `generate-embeddings/index.ts` (se usado)
5. Atualizar `generate-mermaid-diagram/index.ts` (se usado)

### Fase 3: Testes (1-2 horas)

1. Testar geração de embeddings
2. Testar chat com RAG
3. Validar monitoramento no dashboard
4. Verificar custos

### Fase 4: Deploy (30 min)

1. Atualizar Secrets no Supabase
2. Deploy das Edge Functions atualizadas
3. Monitorar logs e métricas

**Total Estimado**: 4-7 horas

---

## 🔗 Referências

- [Vercel AI Gateway Documentation](https://vercel.com/docs/ai-gateway)
- [AI Gateway - Getting Started](https://vercel.com/docs/ai-gateway/getting-started)
- [AI Gateway - Models & Providers](https://vercel.com/docs/ai-gateway/models-providers)
- [AI Gateway - Observability](https://vercel.com/docs/ai-gateway/observability)
- [AI Gateway - Pricing](https://vercel.com/docs/ai-gateway/pricing)
- [AI Gateway - Authentication](https://vercel.com/docs/ai-gateway/authentication)
- [AI Gateway - BYOK (Bring Your Own Key)](https://vercel.com/docs/ai-gateway/byok)
- [AI Gateway - OpenAI Compatibility](https://vercel.com/docs/ai-gateway/openai-compatibility)
- [AI Gateway Blog Post](https://vercel.com/blog/ai-gateway)
- [AI Gateway Community AMA](https://www.youtube.com/watch?v=Jg4imi8PfbU)

---

## 📊 Resumo Executivo

| Aspecto | Avaliação | Impacto |
|---------|-----------|---------|
| **Custo** | ✅ Sem markup (0%) | Positivo |
| **Confiabilidade** | ✅ Retry + Fallback | Muito Positivo |
| **Monitoramento** | ✅ Dashboard completo | Muito Positivo |
| **Controle de Orçamento** | ✅ Alertas e limites | Muito Positivo |
| **Esforço de Migração** | ⚠️ Baixo-Médio (4-7h) | Neutro |
| **Dependência** | ⚠️ Adiciona camada | Neutro-Negativo |
| **Recomendação** | ✅ **ALTAMENTE RECOMENDADO** | **Muito Positivo** |
| **Fase Alfa Gratuita** | ✅ Disponível agora | **Oportunidade de economia** |

---

**Última Atualização**: 2025-01-15

