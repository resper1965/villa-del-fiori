# Implementation Plan: Ingestão de Contratos de Fornecedores

**Branch**: `007-ingestao-contratos-fornecedores` | **Date**: 2024-12-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-ingestao-contratos-fornecedores/spec.md`

## Summary

Sistema para ingestão de contratos de fornecedores com análise automática por IA (GPT-4) que infere processos, mapeia workflows, define responsabilidades RACI e gera processos seguindo o template existente. Integra-se ao sistema de aprovação existente (spec 003) e validação de entidades (spec 004).

## Technical Context

**Language/Version**: TypeScript/Deno (Edge Functions), TypeScript/React 18 (Frontend)  
**Primary Dependencies**: Supabase Edge Functions, OpenAI API, Deno libraries para PDF/DOCX, Supabase Storage  
**Storage**: PostgreSQL (metadados via Supabase), Supabase Storage (arquivos)  
**Testing**: Testes de Edge Functions (planejado)  
**Target Platform**: Linux server (Docker), Web browser  
**Project Type**: Web application (monorepo com backend e frontend)  
**Performance Goals**: Processamento de contrato < 2 min, API response < 500ms  
**Constraints**: Limite de tokens OpenAI, tamanho máximo de arquivo 50MB, OCR básico  
**Scale/Scope**: ~100 contratos/mês, ~10 fornecedores ativos, ~50 processos gerados/mês

## Project Structure

### Documentation (this feature)

```text
specs/007-ingestao-contratos-fornecedores/
├── spec.md              # Especificação funcional
├── plan.md              # Este arquivo
├── data-model.md        # Modelo de dados (a ser criado)
├── contracts/           # Contratos de API
│   └── openapi.yaml     # Endpoints da funcionalidade
└── tasks.md             # Tarefas de implementação
```

### Source Code (repository root)

```text
supabase/
├── functions/
│   ├── upload-contract/
│   │   └── index.ts              # Edge Function de upload
│   ├── extract-document-text/
│   │   └── index.ts              # Edge Function de extração
│   ├── analyze-contract/
│   │   └── index.ts              # Edge Function de análise IA
│   └── generate-process-from-contract/
│       └── index.ts              # Edge Function de geração
└── migrations/
    └── XXX_create_contracts_tables.sql   # Migration SQL
└── tests/ (planejado)
    ├── unit/
    │   ├── test_document_extraction.ts
    │   ├── test_ai_analysis.ts
    │   └── test_process_generation.ts
    └── integration/
        └── test_contract_workflow.ts

frontend/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       └── contracts/
│   │           ├── page.tsx              # Lista de contratos
│   │           ├── [id]/
│   │           │   └── page.tsx          # Detalhes do contrato
│   │           └── upload/
│   │               └── page.tsx          # Upload de contrato
│   ├── components/
│   │   └── contracts/
│   │       ├── ContractUpload.tsx        # Componente de upload
│   │       ├── ContractAnalysisView.tsx  # Visualização da análise
│   │       ├── SuggestedProcessList.tsx  # Lista de processos sugeridos
│   │       ├── ProcessPreview.tsx        # Preview do processo gerado
│   │       └── RACIPreview.tsx           # Preview da matriz RACI
│   ├── lib/
│   │   └── api/
│   │       └── contracts.ts              # Cliente API contratos
│   └── types/
│       └── contract.ts                   # Tipos TypeScript
└── tests/
    └── contracts/
        └── ContractUpload.test.tsx
```

**Structure Decision**: Web application com backend via Supabase (Edge Functions + PostgreSQL) e frontend (Next.js). Novos endpoints via Edge Functions integrados à estrutura existente.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────┐  ┌─────────────────────────────┐   │
│  │   Upload     │  │  Análise View    │  │    Processo Preview          │   │
│  │   Contract   │──│  (IA Results)    │──│    (Workflow + RACI)         │   │
│  └──────────────┘  └──────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Supabase Edge Functions)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      Edge Functions                                   │   │
│  │  upload-contract    analyze-contract    generate-process             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼────────────────────────────────────┐   │
│  │                          SERVICES                                     │   │
│  │  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────────┐   │   │
│  │  │   Contract     │  │    Document     │  │      AI Analysis     │   │   │
│  │  │   Service      │──│    Extraction   │──│      Service         │   │   │
│  │  └────────────────┘  └─────────────────┘  └──────────────────────┘   │   │
│  │         │                                           │                 │   │
│  │         │            ┌─────────────────┐            │                 │   │
│  │         └────────────│    Process      │────────────┘                 │   │
│  │                      │    Generation   │                              │   │
│  │                      └─────────────────┘                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
    ┌───────────┐            ┌───────────┐            ┌───────────┐
    │PostgreSQL │            │ Supabase  │            │  OpenAI   │
    │ (metadata)│            │  Storage  │            │   API     │
    │ (Supabase)│            │  (files)  │            │           │
    └───────────┘            └───────────┘            └───────────┘
```

## Phased Implementation

### Phase 0: Preparação e Infraestrutura

**Objetivo**: Configurar dependências, modelos de dados e infraestrutura básica.

**Tarefas**:
1. Adicionar dependências Deno para extração de documentos (PDF/DOCX)
2. Criar migração SQL para novas tabelas no Supabase
3. Configurar Supabase Storage para arquivos
4. Configurar variáveis de ambiente para OpenAI API nas Edge Functions

**Entregável**: Infraestrutura pronta para desenvolvimento.

---

### Phase 1: Ingestão de Contratos (US-1)

**Objetivo**: Upload e extração de texto de contratos.

**Tarefas**:

1. **Backend: Tabela Contract**
   - Criar tabela SQL `contracts` via migration
   - Criar tipos TypeScript para request/response
   - Criar migration SQL no Supabase

2. **Backend: Serviço de Extração de Documentos**
   - Implementar extração de PDF (bibliotecas Deno)
   - Implementar extração de DOC/DOCX (bibliotecas Deno)
   - Criar interface unificada para diferentes formatos

3. **Backend: Serviço de Contratos**
   - Implementar upload de arquivo (multipart)
   - Salvar arquivo no storage
   - Chamar serviço de extração
   - Salvar metadados no banco

4. **Backend: Endpoints**
   - `POST /api/v1/contracts/upload` - Upload de contrato
   - `GET /api/v1/contracts` - Listar contratos
   - `GET /api/v1/contracts/{id}` - Detalhes do contrato

5. **Frontend: Página de Upload**
   - Componente de drag-and-drop para upload
   - Progress bar de processamento
   - Formulário de metadados adicionais
   - Lista de contratos com filtros

**Entregável**: Sistema de upload e visualização de contratos funcional.

---

### Phase 2: Análise por IA (US-2)

**Objetivo**: Análise de contratos e inferência de processos por IA.

**Tarefas**:

1. **Backend: Tabelas ContractAnalysis e SuggestedProcess**
   - Criar tabelas SQL para análise e sugestões
   - Migration SQL no Supabase

2. **Backend: Edge Function de Análise por IA**
   - Configurar cliente OpenAI (Deno)
   - Criar prompts estruturados para análise
   - Implementar extração de:
     - Identificação do fornecedor
     - Tipo de serviço
     - Escopo de trabalho
     - Responsabilidades
   - Implementar mapeamento para categorias de processos
   - Calcular score de confiança
   - Gerar justificativas

3. **Backend: Prompts de Análise**
   ```python
   SYSTEM_PROMPT = """
   Você é um especialista em gestão de processos condominiais.
   Analise o contrato de fornecedor e identifique:
   1. Nome e tipo do fornecedor
   2. Serviços prestados
   3. Processos condominiais relacionados
   4. Responsabilidades do fornecedor
   
   Categorias de processos disponíveis:
   - governanca: Processos administrativos e de gestão
   - acesso_seguranca: Controle de acesso, segurança
   - operacao: Operações do dia a dia (limpeza, manutenção)
   - areas_comuns: Uso de áreas compartilhadas
   - convivencia: Regras de convivência
   - eventos: Assembleias, festas, reservas
   - emergencias: Procedimentos de emergência
   """
   ```

4. **Backend: Endpoints**
   - `POST /api/v1/contracts/{id}/analyze` - Iniciar análise
   - `GET /api/v1/contracts/{id}/analysis` - Obter resultado da análise

5. **Frontend: Visualização da Análise**
   - Componente de status da análise (em andamento, concluída)
   - Exibição de processos sugeridos com scores
   - Justificativas para cada sugestão

**Entregável**: Análise automática de contratos com sugestões de processos.

---

### Phase 3: Mapeamento de Workflow (US-3)

**Objetivo**: Geração de workflows com diagrama Mermaid.

**Tarefas**:

1. **Backend: Geração de Workflow**
   - Expandir serviço de IA para gerar etapas de workflow
   - Criar templates de workflow por categoria
   - Gerar etapas baseadas no escopo do contrato

2. **Backend: Geração de Diagrama Mermaid**
   - Template de diagrama com responsáveis
   - Aplicar cores padrão (azul/verde/vermelho)
   - Validar sintaxe Mermaid

3. **Prompts de Workflow**
   ```python
   WORKFLOW_PROMPT = """
   Baseado no escopo do contrato, gere as etapas do workflow:
   
   Formato de saída:
   {
     "workflow": [
       "1. Primeira etapa do processo",
       "2. Segunda etapa do processo"
     ],
     "mermaid": "flowchart TD\n  A[\"Etapa 1<br/>(Responsável)\"]..."
   }
   
   Regras:
   - Cada nó deve ter formato: A["Nome da Atividade<br/>(Responsável)"]
   - Use cores: azul (#1e3a8a) para execução, verde (#166534) para aprovação
   - Inclua decisões quando apropriado (formato diamante)
   """
   ```

4. **Frontend: Preview do Workflow**
   - Renderização do diagrama Mermaid
   - Editor de etapas do workflow
   - Preview em tempo real

**Entregável**: Workflows visuais com diagramas Mermaid.

---

### Phase 4: Matriz RACI (US-4)

**Objetivo**: Geração automática de responsabilidades RACI.

**Tarefas**:

1. **Backend: Geração de RACI**
   - Expandir serviço de IA para gerar matriz RACI
   - Mapear responsabilidades baseadas no contrato
   - Validar entidades contra cadastro existente

2. **Backend: Validação de Entidades**
   - Integrar com serviço de validação de entidades (spec 004)
   - Identificar entidades faltantes
   - Sugerir criação de entidades

3. **Prompts de RACI**
   ```python
   RACI_PROMPT = """
   Para cada etapa do workflow, defina a matriz RACI:
   
   R (Responsible): Quem executa a tarefa
   A (Accountable): Quem aprova/decide (sempre 1)
   C (Consulted): Quem é consultado antes
   I (Informed): Quem é informado depois
   
   Entidades disponíveis no sistema: {entities}
   Fornecedor do contrato: {supplier}
   
   Regras:
   - Fornecedor deve ser Responsible nas tarefas de execução
   - Síndico deve ser Accountable na maioria dos casos
   - Se entidade não existir, indique como "CRIAR: Nome da Entidade"
   """
   ```

4. **Frontend: Preview RACI**
   - Tabela visual da matriz RACI
   - Indicadores de entidades faltantes
   - Modal de criação rápida de entidades

**Entregável**: Matriz RACI automática com validação de entidades.

---

### Phase 5: Geração de Processo (US-5)

**Objetivo**: Geração do processo completo seguindo template.

**Tarefas**:

1. **Backend: Serviço de Geração de Processo**
   - Montar objeto Process completo
   - Preencher todos os campos obrigatórios
   - Selecionar ícone por categoria
   - Identificar variáveis aplicáveis
   - Definir tipo de documento

2. **Backend: Integração com Processo Existente**
   - Usar modelo Process existente
   - Criar ProcessVersion inicial
   - Status "rascunho"

3. **Backend: Endpoints**
   - `POST /api/v1/contracts/{id}/generate` - Gerar processo
   - `POST /api/v1/contracts/{id}/suggested-processes/{sp_id}/accept` - Aceitar sugestão

4. **Frontend: Preview e Confirmação**
   - Preview completo do processo
   - Edição de campos antes de confirmar
   - Botão de confirmação de geração
   - Feedback de sucesso com link para processo

**Entregável**: Processos gerados automaticamente e integrados ao sistema.

---

### Phase 6: Vinculação e Rastreabilidade (US-6)

**Objetivo**: Relacionamentos entre contrato, fornecedor e processos.

**Tarefas**:

1. **Backend: Relacionamentos**
   - FK Contract → Entity (fornecedor)
   - FK Process → Contract (origem)
   - Histórico de eventos

2. **Backend: Endpoints**
   - `GET /api/v1/contracts/{id}/processes` - Processos do contrato
   - `GET /api/v1/entities/{id}/contracts` - Contratos do fornecedor

3. **Frontend: Navegação**
   - Links bidirecionais
   - Timeline de eventos do contrato
   - Badge indicando "Gerado por Contrato"

**Entregável**: Rastreabilidade completa contrato ↔ processos.

---

### Phase 7: Integração com Aprovação (US-7)

**Objetivo**: Processos gerados seguem workflow de aprovação.

**Tarefas**:

1. **Backend: Fluxo de Aprovação**
   - Reutilizar workflow existente (spec 003)
   - Notificar stakeholders automaticamente
   - Registrar origem do processo (contrato)

2. **Frontend: Fluxo de Revisão**
   - Indicador de "processo gerado por IA"
   - Acesso ao contrato de origem durante revisão
   - Fluxo normal de aprovação/rejeição

**Entregável**: Processos gerados integrados ao workflow de aprovação.

---

### Phase 8: Dashboard e Métricas (US-8)

**Objetivo**: Visibilidade sobre contratos e eficiência da IA.

**Tarefas**:

1. **Backend: Endpoints de Métricas**
   - Total de contratos por status
   - Processos gerados por período
   - Taxa de aceitação de sugestões
   - Tempo médio de processamento

2. **Frontend: Dashboard de Contratos**
   - Cards com métricas principais
   - Gráficos de tendência
   - Lista de contratos recentes
   - Filtros avançados

**Entregável**: Dashboard operacional de contratos.

---

## Data Model Summary

```
┌─────────────────────┐       ┌─────────────────────────┐
│      Contract       │       │    ContractAnalysis     │
├─────────────────────┤       ├─────────────────────────┤
│ id                  │──────<│ id                      │
│ file_name           │       │ contract_id (FK)        │
│ file_path           │       │ analysis_status         │
│ file_size           │       │ identified_services     │
│ file_type           │       │ raw_response (JSONB)    │
│ extracted_text      │       │ processing_time         │
│ supplier_id (FK)    │>──────│ created_at              │
│ contract_type       │       └─────────────────────────┘
│ start_date          │                    │
│ end_date            │                    │ 1:N
│ status              │                    ▼
│ created_by (FK)     │       ┌─────────────────────────┐
│ created_at          │       │   SuggestedProcess      │
│ updated_at          │       ├─────────────────────────┤
└─────────────────────┘       │ id                      │
         │                    │ analysis_id (FK)        │
         │ 1:N                │ process_category        │
         ▼                    │ process_name            │
┌─────────────────────┐       │ description             │
│  ContractHistory    │       │ workflow_steps (JSONB)  │
├─────────────────────┤       │ mermaid_diagram         │
│ id                  │       │ raci_matrix (JSONB)     │
│ contract_id (FK)    │       │ confidence_score        │
│ event_type          │       │ justification           │
│ event_data (JSONB)  │       │ is_accepted             │
│ user_id (FK)        │       │ generated_process_id(FK)│
│ created_at          │       │ accepted_at             │
└─────────────────────┘       └─────────────────────────┘
         │
         │ Contract.supplier_id
         ▼
┌─────────────────────┐       ┌─────────────────────────┐
│      Entity         │       │       Process           │
│   (existente)       │       │     (existente)         │
├─────────────────────┤       ├─────────────────────────┤
│ id                  │       │ id                      │
│ name                │       │ contract_id (FK) - NOVO │
│ type                │       │ ... campos existentes   │
│ ...                 │       └─────────────────────────┘
└─────────────────────┘
```

## API Endpoints (Resumo)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/contracts/upload` | Upload de contrato |
| GET | `/api/v1/contracts` | Listar contratos |
| GET | `/api/v1/contracts/{id}` | Detalhes do contrato |
| POST | `/api/v1/contracts/{id}/analyze` | Iniciar análise IA |
| GET | `/api/v1/contracts/{id}/analysis` | Resultado da análise |
| POST | `/api/v1/contracts/{id}/generate` | Gerar processo |
| POST | `/api/v1/contracts/{id}/suggested-processes/{sp_id}/accept` | Aceitar sugestão |
| GET | `/api/v1/contracts/{id}/processes` | Processos do contrato |
| GET | `/api/v1/contracts/dashboard` | Métricas e dashboard |

## Complexity Tracking

| Aspecto | Decisão | Justificativa |
|---------|---------|---------------|
| LLM Provider | OpenAI GPT-4 | Melhor qualidade para análise de texto em português |
| Extração PDF | pdfplumber | Mais robusto que PyPDF2 para PDFs complexos |
| Prompt Engineering | Templates por categoria | Permite ajuste fino sem alterar código |
| Cache | Redis | Evita re-análise de contratos já processados |

## Risks and Mitigations

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Custo OpenAI alto | Alto | Implementar cache, limitar análises por período |
| Qualidade das inferências | Médio | Revisão humana obrigatória, feedback loop |
| Contratos complexos | Médio | Templates de fallback, análise parcial |
| Timeout de processamento | Baixo | Processamento assíncrono com status |

## Timeline Estimado

| Phase | Duração | Dependências |
|-------|---------|--------------|
| Phase 0: Infraestrutura | 2 dias | - |
| Phase 1: Ingestão | 3 dias | Phase 0 |
| Phase 2: Análise IA | 4 dias | Phase 1 |
| Phase 3: Workflow | 3 dias | Phase 2 |
| Phase 4: RACI | 2 dias | Phase 3 |
| Phase 5: Geração | 3 dias | Phase 4 |
| Phase 6: Vinculação | 2 dias | Phase 5 |
| Phase 7: Aprovação | 2 dias | Phase 5, spec 003 |
| Phase 8: Dashboard | 2 dias | Phase 6, 7 |
| **Total** | **~23 dias** | - |
