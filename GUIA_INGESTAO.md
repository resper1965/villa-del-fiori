# 📥 Guia de Ingestão de Contratos

## 🎯 Onde Encontrar

### 1. **Página de Importação de Contratos**

**Rota:** `/processes/import`

**Como Acessar:**
1. Faça login no sistema
2. Vá para **Processos** no menu lateral
3. Clique no botão **"Importar Contrato"** (ícone de Upload) no topo da página

**URL Direta:**
```
https://villadelfiori.vercel.app/processes/import
```

### 2. **Funcionalidades Disponíveis**

#### ✅ **Upload de PDF**
- Arraste e solte o arquivo PDF
- Ou clique para selecionar
- Apenas arquivos PDF são aceitos

#### ✅ **Processamento com IA**
- Conversão automática de PDF para Markdown
- Extração de dados estruturados:
  - Nome do processo
  - Descrição
  - Workflow (etapas)
  - Entidades envolvidas
  - Variáveis
  - Matriz RACI
  - Diagrama Mermaid

#### ✅ **Interface de Curadoria (Human-in-the-Loop)**
- Visualização dos dados extraídos
- Edição antes de salvar
- Alertas para ambiguidades
- Formulário pré-preenchido

#### ✅ **Salvamento como Processo**
- Criação automática do processo
- Integração com o sistema de aprovação
- Status inicial: "em_revisao"

## 🔧 Endpoints da API

### **POST /v1/ingestion/analyze**

**Descrição:** Analisa um contrato PDF e extrai dados estruturados

**Request:**
```bash
curl -X POST https://villadelfiori.vercel.app/v1/ingestion/analyze \
  -H "Authorization: Bearer <token>" \
  -F "file=@contrato.pdf"
```

**Response:**
```json
{
  "process_name": "Nome do Processo",
  "description": "Descrição detalhada",
  "category": "categoria",
  "workflow": ["Etapa 1", "Etapa 2"],
  "entities": ["Entidade 1", "Entidade 2"],
  "variables": ["var1", "var2"],
  "raci": [
    {
      "step": "Etapa 1",
      "responsible": ["Responsável"],
      "accountable": ["Aprovador"],
      "consulted": ["Consultado"],
      "informed": ["Informado"]
    }
  ],
  "mermaid_diagram": "flowchart TD\n...",
  "ambiguities": ["Ambiguidade 1"],
  "confidence": 0.85
}
```

## 📊 Fluxo Completo

```
1. Usuário faz upload do PDF
   ↓
2. Backend converte PDF → Markdown (markitdown)
   ↓
3. IA processa Markdown (OpenAI GPT-4o)
   ↓
4. Extração estruturada (Pydantic schema)
   ↓
5. Retorna JSON para frontend
   ↓
6. Interface de curadoria exibe dados
   ↓
7. Usuário revisa e edita
   ↓
8. Salva como novo processo
   ↓
9. Processo fica "em_revisao" para aprovação
```

## 🎨 Interface

### **Componentes:**
- **Drag & Drop Area:** Área para upload
- **Loading State:** Feedback durante processamento
- **Extraction Result:** Visualização dos dados extraídos
- **Ambiguity Alerts:** Alertas para dados incertos
- **Process Form:** Formulário pré-preenchido para edição

### **Estados:**
- ⏳ **Processando:** Mostra spinner e progresso
- ✅ **Sucesso:** Exibe dados extraídos
- ⚠️ **Avisos:** Mostra ambiguidades
- ❌ **Erro:** Exibe mensagem de erro

## 🔐 Autenticação

A ingestão requer autenticação JWT:

```typescript
// Frontend usa automaticamente o token do AuthContext
const response = await ingestionApi.analyzeContract(file);
```

## 📝 Exemplo de Uso

1. **Acesse a página de importação:**
   - Menu → Processos → "Importar Contrato"

2. **Faça upload do PDF:**
   - Arraste o arquivo ou clique para selecionar

3. **Aguarde processamento:**
   - A IA processa o documento (pode levar alguns segundos)

4. **Revise os dados:**
   - Verifique nome, descrição, workflow
   - Edite se necessário
   - Veja alertas de ambiguidade

5. **Salve o processo:**
   - Clique em "Salvar Processo"
   - O processo será criado com status "em_revisao"

6. **Aprove ou rejeite:**
   - Vá para o detalhe do processo
   - Use os botões de aprovação/rejeição

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - Next.js
  - React Hook Form
  - React Query
  - Tailwind CSS

- **Backend:**
  - FastAPI
  - markitdown (PDF → Markdown)
  - langchain-openai (IA)
  - Pydantic (validação)

- **IA:**
  - OpenAI GPT-4o
  - Structured Output (Pydantic)
  - Human-in-the-Loop

## 📚 Documentação Relacionada

- **Especificação:** `specs/007-ingestao-contratos-fornecedores/spec.md`
- **Plano Técnico:** `specs/007-ingestao-contratos-fornecedores/plan.md`
- **Tarefas:** `specs/007-ingestao-contratos-fornecedores/tasks.md`

## ⚠️ Limitações

- Apenas arquivos PDF são suportados
- Tamanho máximo: 10MB (configurável)
- Processamento pode levar 30-60 segundos
- Requer conexão com OpenAI API

## 🚀 Melhorias Futuras

- Suporte para outros formatos (DOCX, TXT)
- Processamento em lote
- Histórico de importações
- Templates personalizados
- Validação automática de entidades

