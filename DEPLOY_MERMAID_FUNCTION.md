# Deploy da Edge Function: generate-mermaid-diagram

## 📋 Descrição

Edge Function que gera automaticamente código Mermaid a partir do workflow do processo usando OpenAI GPT-4o-mini.

## 🚀 Deploy via Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione o projeto: `obyrjbhomqtepebykavb`
3. Vá em **Edge Functions** no menu lateral
4. Clique em **Create a new function**
5. Nome da função: `generate-mermaid-diagram`
6. Cole o conteúdo do arquivo `supabase/functions/generate-mermaid-diagram/index.ts`
7. Configure as variáveis de ambiente:
   - `OPENAI_API_KEY`: Sua chave da OpenAI

## 🔧 Variáveis de Ambiente Necessárias

- `OPENAI_API_KEY`: Chave da API OpenAI (obrigatória)

## 📝 Uso

A função é chamada automaticamente pelo frontend quando o usuário clica em "Gerar Automaticamente" no formulário de processo.

### Request Body:
```json
{
  "workflow": ["Passo 1", "Passo 2", "Passo 3"],
  "process_name": "Nome do Processo",
  "entities": ["Entidade 1", "Entidade 2"],
  "description": "Descrição do processo"
}
```

### Response:
```json
{
  "success": true,
  "mermaid_diagram": "flowchart TD\n    A[...] --> B[...]",
  "message": "Diagrama Mermaid gerado com sucesso"
}
```

## ✅ Status

- ✅ Edge Function criada
- ✅ API client no frontend
- ✅ Botão "Gerar Automaticamente" no ProcessForm
- ⏳ Deploy da Edge Function (fazer via Dashboard)

