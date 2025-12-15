# Como Configurar OPENAI_API_KEY no Supabase

**Data**: 2025-01-15  
**Motivo**: Edge Functions `ingest-process` e `ingest-document` precisam da chave da OpenAI para gerar embeddings

---

## 🔑 Passo a Passo

### 1. Obter Chave da OpenAI

1. Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
2. Faça login na sua conta
3. Clique em **"Create new secret key"**
4. Copie a chave (formato: `sk-...`)
5. **IMPORTANTE**: Guarde a chave em local seguro, ela não será mostrada novamente

### 2. Configurar no Supabase Dashboard

#### Para Edge Function `ingest-process`:

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Edge Functions** (menu lateral)
4. Clique em **`ingest-process`**
5. Vá na aba **Settings** (ou **Configuration**)
6. Procure por **Secrets** ou **Environment Variables**
7. Clique em **Add Secret** ou **Add Environment Variable**
8. Preencha:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-...` (sua chave da OpenAI)
9. Clique em **Save**

#### Para Edge Function `ingest-document`:

Repita os mesmos passos acima, mas selecione a função **`ingest-document`** no passo 4.

### 3. Verificar Configuração

Após configurar, você pode testar:

1. Acesse `/admin/knowledge-base` na aplicação
2. Clique em **"Ingerir Processos"**
3. Verifique se os processos são processados com sucesso
4. Se ainda houver erro, verifique os logs da Edge Function no Supabase Dashboard

---

## 🔍 Verificar se está Configurado

### Via Supabase Dashboard:

1. Edge Functions → `ingest-process` → Settings
2. Verifique se `OPENAI_API_KEY` aparece na lista de Secrets

### Via Logs:

1. Edge Functions → `ingest-process` → Logs
2. Se aparecer erro `"OPENAI_API_KEY não configurada"`, a variável não está configurada

---

## ⚠️ Importante

- **Nunca** commite a chave da OpenAI no código
- **Nunca** exponha a chave em variáveis de ambiente do frontend
- Use apenas **Secrets** do Supabase para Edge Functions
- A chave é necessária apenas nas Edge Functions (backend), não no frontend

---

## 🧪 Testar Após Configurar

1. Acesse `/admin/knowledge-base`
2. Clique em **"Ingerir Processos"**
3. Aguarde processamento
4. Verifique se os processos aparecem com status `completed` (verde)
5. Verifique se `chunks_count` > 0

---

**Última Atualização**: 2025-01-15

