# Implementation Plan: Ingestão de Contratos de Fornecedores

**Branch**: `007-ingestao-contratos-fornecedores` | **Date**: 2024-12-09

## Technical Context

**Backend**: Python 3.11, FastAPI, SQLAlchemy, OpenAI API  
**Frontend**: TypeScript, React 18, Next.js 14  
**Storage**: PostgreSQL (metadados), S3/MinIO (arquivos)  
**AI**: OpenAI GPT-4 para análise de contratos

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                        │
│  Upload → Análise View → Sugestões → Preview → Confirmação   │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │  Contract   │  │  Document   │  │    AI Analysis      │   │
│  │  Service    │──│  Extraction │──│    Service (GPT-4)  │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
│         │                                    │                │
│         └────────────┬───────────────────────┘                │
│                      ▼                                        │
│              ┌───────────────┐                                │
│              │   Process     │                                │
│              │   Generation  │                                │
│              └───────────────┘                                │
└──────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌───────────┐       ┌───────────┐       ┌───────────┐
   │PostgreSQL │       │  S3/MinIO │       │  OpenAI   │
   └───────────┘       └───────────┘       └───────────┘
```

## Phased Implementation

### Phase 0: Infraestrutura (2 dias)
- Dependências: openai, pdfplumber, python-docx, boto3
- Variáveis de ambiente para OpenAI e S3
- Migração de banco de dados

### Phase 1: Upload de Contratos (3 dias)
- Modelo Contract e schemas
- Serviço de extração de documentos
- Endpoints de upload e listagem
- UI de upload com drag-and-drop

### Phase 2: Análise por IA (4 dias)
- Modelos ContractAnalysis e SuggestedProcess
- Serviço de análise com GPT-4
- Prompts para identificação de serviços
- UI de visualização de análise

### Phase 3: Mapeamento de Workflow (3 dias)
- Geração de etapas do workflow
- Geração de diagrama Mermaid
- Templates de fallback por categoria
- UI de preview do workflow

### Phase 4: Matriz RACI (2 dias)
- Geração automática de RACI
- Validação de entidades existentes
- UI de edição de responsabilidades

### Phase 5: Geração de Processo (3 dias)
- Serviço de geração seguindo template
- Validação de campos obrigatórios
- Vínculo com contrato de origem
- UI de confirmação

### Phase 6: Rastreabilidade (2 dias)
- Relacionamentos contrato ↔ processos
- Timeline de eventos
- Navegação bidirecional

### Phase 7: Dashboard (2 dias)
- Métricas e estatísticas
- Gráficos de uso
- Filtros e exportação

**Total Estimado**: ~21 dias

## Key Files to Create

### Backend
```
backend/src/app/
├── models/
│   ├── contract.py
│   ├── contract_analysis.py
│   └── suggested_process.py
├── schemas/
│   └── contract.py
├── services/
│   ├── contract_service.py
│   ├── document_extraction_service.py
│   ├── ai_analysis_service.py
│   └── process_generation_service.py
└── api/v1/endpoints/
    └── contracts.py
```

### Frontend
```
frontend/src/
├── app/(dashboard)/contracts/
│   ├── page.tsx
│   ├── [id]/page.tsx
│   └── upload/page.tsx
├── components/contracts/
│   ├── ContractUpload.tsx
│   ├── ContractAnalysisView.tsx
│   ├── SuggestedProcessList.tsx
│   ├── ProcessPreview.tsx
│   └── RACIPreview.tsx
└── lib/api/
    └── contracts.ts
```

## AI Prompts Structure

### Prompt de Análise
```
SYSTEM: Você é um especialista em gestão de processos condominiais.
Analise o contrato e identifique:
1. Nome e tipo do fornecedor
2. Serviços prestados
3. Processos operacionais necessários
4. Responsabilidades do fornecedor

Categorias disponíveis: governanca, acesso_seguranca, operacao, 
areas_comuns, convivencia, eventos, emergencias
```

### Prompt de Workflow
```
Baseado no escopo do contrato, gere as etapas do workflow.
Cada etapa deve ter: número, descrição, responsável.
Gere também diagrama Mermaid com cores padrão.
```

### Prompt de RACI
```
Para cada etapa, defina:
R (Responsible): Quem executa
A (Accountable): Quem aprova
C (Consulted): Quem é consultado
I (Informed): Quem é informado

Entidades disponíveis: {lista de entidades do sistema}
Fornecedor: {nome do fornecedor}
```

## Risks and Mitigations

| Risco | Mitigação |
|-------|-----------|
| Custo OpenAI alto | Cache de análises, limitar por período |
| Qualidade das inferências | Revisão humana obrigatória |
| Contratos complexos | Templates de fallback |
| Timeout de processamento | Processamento assíncrono |
