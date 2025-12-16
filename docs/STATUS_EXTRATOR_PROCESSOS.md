# Status do Extrator de Processos

**Última Atualização**: 2025-01-15

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

## ⚠️ Requisitos

### OPENAI_API_KEY

**Status**: Necessário configurar manualmente

**O que é**: Chave da API da OpenAI necessária para gerar embeddings

**Onde configurar**:
- Supabase Dashboard → Edge Functions → `ingest-process` → Settings → Secrets
- Supabase Dashboard → Edge Functions → `ingest-document` → Settings → Secrets

**Impacto**:
- Sem a chave, processos e documentos não podem ser indexados
- O sistema funciona normalmente, mas a base de conhecimento não é populada
- Chat com Gabi não terá informações dos processos/documentos

**Documentação**: Ver [`CONFIGURAR_OPENAI_API_KEY.md`](CONFIGURAR_OPENAI_API_KEY.md)

---

## 🔄 Fluxo de Ingestão

### Fluxo Atual

1. Processo é aprovado → Trigger marca como `pending` em `knowledge_base_ingestion_status`
2. **Usuário precisa ir em `/admin/knowledge-base` e clicar em "Ingerir Processos"**
3. Sistema busca processos `pending` e chama Edge Function para cada um
4. Edge Function processa:
   - Divide em chunks
   - Gera embeddings
   - Salva na base de conhecimento
5. Status é atualizado para `completed` ou `failed`

### Ingestão Manual

A ingestão atualmente é **manual**:

1. Acesse `/admin/knowledge-base`
2. Clique em **"Ingerir Processos"**
3. Sistema processa todos os processos aprovados que ainda não foram ingeridos
4. Aguarde conclusão (mostra sucesso/erros)
5. Verifique o status na lista abaixo

---

## 📊 Status de Ingestão

### Estados

1. **`pending`**: Aguardando processamento
   - Ação: Será processado quando usuário clicar em "Ingerir Processos"

2. **`processing`**: Em processamento
   - Ação: Aguardar conclusão

3. **`completed`**: Indexado com sucesso
   - Ação: Disponível na base de conhecimento

4. **`failed`**: Erro na indexação
   - Ação: Ver erro e reprocessar

---

## 🔧 Como Usar

### Passo 1: Configurar OPENAI_API_KEY (OBRIGATÓRIO)

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Edge Functions** → **ingest-process**
3. Clique em **Settings** → **Secrets**
4. Adicione a variável:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: sua chave da OpenAI (formato: `sk-...`)
5. Clique em **Save**
6. Repita para a função **`ingest-document`**

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

## 📈 Monitoramento

### Verificar Status

```sql
SELECT 
  p.name as process_name,
  pv.version_number,
  ibs.status,
  ibs.chunks_count,
  ibs.error_message,
  ibs.completed_at
FROM knowledge_base_ingestion_status ibs
JOIN processes p ON p.id = ibs.process_id
JOIN process_versions pv ON pv.id = ibs.process_version_id
ORDER BY ibs.created_at DESC;
```

### Estatísticas

- **Total de processos aprovados**: `SELECT COUNT(*) FROM processes WHERE status = 'aprovado';`
- **Processos ingeridos**: `SELECT COUNT(*) FROM knowledge_base_ingestion_status WHERE status = 'completed';`
- **Processos pendentes**: `SELECT COUNT(*) FROM knowledge_base_ingestion_status WHERE status = 'pending';`
- **Processos com erro**: `SELECT COUNT(*) FROM knowledge_base_ingestion_status WHERE status = 'failed';`

---

## 🎯 Benefícios

### Para Usuários

- ✅ **Indexação Automática**: Processos aprovados são marcados para ingestão
- ✅ **Controle Manual**: Usuário decide quando processar
- ✅ **Rastreabilidade**: Status de ingestão sempre visível
- ✅ **Reprocessamento**: Pode reprocessar processos com erro

### Para Administradores

- ✅ **Monitoramento**: Status de ingestão sempre visível
- ✅ **Controle**: Decide quando processar processos
- ✅ **Debugging**: Erros são registrados e visíveis

---

## 📚 Referências

- **Edge Function**: `ingest-process`
- **Tabela**: `knowledge_base_ingestion_status`
- **Tabela**: `knowledge_base_documents`
- **Página**: `/admin/knowledge-base`

---

**Última Atualização**: 2025-01-15
