# Status do Extrator de Processos

**Data**: 2025-01-15  
**Status**: ⚠️ **PARCIALMENTE FUNCIONAL**

---

## ✅ O que está funcionando

### 1. **Edge Function `ingest-process`**
- ✅ Deployada e ativa no Supabase
- ✅ Processa processos aprovados
- ✅ Gera chunks e embeddings
- ✅ Salva na `knowledge_base_documents`
- ✅ Atualiza status de ingestão

### 2. **Triggers no Banco de Dados**
- ✅ `trigger_process_approved_for_ingestion`: Marca processos aprovados como `pending`
- ✅ `trigger_process_version_approved_for_ingestion`: Marca novas versões aprovadas como `pending`
- ✅ Triggers estão ativos e funcionando

### 3. **Página de Knowledge Base**
- ✅ Interface em `/admin/knowledge-base`
- ✅ Permite ingerir processos manualmente
- ✅ Mostra status de ingestão
- ✅ Estatísticas de chunks

---

## ❌ Problemas Identificados

### Problema 1: OPENAI_API_KEY não configurada

**Status**: Todos os 9 processos aprovados falharam com erro `"OPENAI_API_KEY não configurada"`

**Solução**: Configurar a variável de ambiente `OPENAI_API_KEY` na Edge Function `ingest-process` no Supabase Dashboard.

**Como configurar**:
1. Acesse Supabase Dashboard → Edge Functions → `ingest-process`
2. Vá em "Settings" → "Secrets"
3. Adicione: `OPENAI_API_KEY` = sua chave da OpenAI
4. Salve e redeploy a função

### Problema 2: Ingestão não é automática

**O trigger apenas marca processos como `pending`, mas NÃO chama automaticamente a Edge Function.**

**Fluxo Atual**:
1. Processo é aprovado → Trigger marca como `pending` em `knowledge_base_ingestion_status`
2. **Usuário precisa ir em `/admin/knowledge-base` e clicar em "Ingerir Processos"**
3. Sistema busca processos `pending` e chama Edge Function para cada um

**Fluxo Ideal (Automático)**:
1. Processo é aprovado → Trigger marca como `pending`
2. **Sistema automaticamente chama Edge Function** (via webhook ou job)
3. Processo é ingerido sem intervenção manual

---

## 🔧 Soluções Possíveis

### Opção 1: Webhook/HTTP Request no Trigger (Recomendado)

Criar uma função PostgreSQL que chama a Edge Function via HTTP quando um processo é marcado como `pending`.

**Prós**:
- Totalmente automático
- Processa imediatamente após aprovação

**Contras**:
- Requer extensão `http` ou `pg_net` no Supabase
- Pode falhar se Edge Function estiver indisponível

### Opção 2: Job/Cron Automático

Criar um job que roda periodicamente (ex: a cada 5 minutos) e processa processos `pending`.

**Prós**:
- Mais confiável (retry automático)
- Não depende de triggers HTTP

**Contras**:
- Não é imediato (atraso de até 5 minutos)
- Requer configuração de cron no Supabase

### Opção 3: Manter Manual (Atual)

Manter como está, com botão manual na interface.

**Prós**:
- Controle total pelo usuário
- Sem dependências adicionais

**Contras**:
- Requer ação manual
- Pode esquecer de ingerir processos

---

## 📊 Status Atual no Banco

**Última verificação**: 2025-01-15

- ✅ **9 processos aprovados** encontrados
- ✅ **9 processos** com status de ingestão criado
- ❌ **0 processos ingeridos** com sucesso
- ❌ **9 processos falharam** (erro: `OPENAI_API_KEY não configurada`)

**Query para verificar**:
```sql
SELECT 
  COUNT(*) as total_processos_aprovados,
  COUNT(CASE WHEN EXISTS (
    SELECT 1 FROM knowledge_base_ingestion_status 
    WHERE knowledge_base_ingestion_status.process_id = processes.id
  ) THEN 1 END) as processos_com_status_ingestao,
  COUNT(CASE WHEN EXISTS (
    SELECT 1 FROM knowledge_base_ingestion_status 
    WHERE knowledge_base_ingestion_status.process_id = processes.id
    AND knowledge_base_ingestion_status.status = 'completed'
  ) THEN 1 END) as processos_ingeridos
FROM processes
WHERE status = 'aprovado';
```

---

## 🎯 Recomendação

**Implementar Opção 2 (Job/Cron Automático)** por ser:
- Mais confiável
- Não depende de extensões adicionais
- Processa automaticamente sem intervenção
- Retry automático em caso de falha

**Próximos Passos**:
1. Criar Edge Function `process-pending-ingestions` que processa todos os `pending`
2. Configurar cron job no Supabase para chamar essa função a cada 5 minutos
3. Manter botão manual como fallback

---

## ✅ Como Usar Atualmente

### Passo 1: Configurar OPENAI_API_KEY (OBRIGATÓRIO)

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Edge Functions** → **ingest-process**
3. Clique em **Settings** → **Secrets**
4. Adicione a variável:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: sua chave da OpenAI (formato: `sk-...`)
5. Clique em **Save**
6. (Opcional) Faça redeploy da função para garantir que a variável seja carregada

### Passo 2: Ingerir Processos

1. Acesse `/admin/knowledge-base` na aplicação
2. Clique em **"Ingerir Processos"**
3. Sistema processa todos os processos aprovados que ainda não foram ingeridos
4. Aguarde conclusão (mostra sucesso/erros)
5. Verifique o status na lista abaixo

### Passo 3: Reprocessar Processos com Erro

Se houver processos com status `failed`:
1. Na página `/admin/knowledge-base`, veja a lista de processos
2. Processos com erro aparecem com badge vermelho
3. Clique em **"Ingerir Processos"** novamente para reprocessar
4. O sistema tentará processar novamente os que falharam

---

**Última Atualização**: 2025-01-15

