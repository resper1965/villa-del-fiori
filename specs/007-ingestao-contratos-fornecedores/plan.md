# Implementation Plan: Ingestão de Contratos de Fornecedores com Geração Automática de Processos

**Branch**: `007-ingestao-contratos-fornecedores` | **Date**: 2024-12-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-ingestao-contratos-fornecedores/spec.md`

## Summary

Esta feature implementa sistema de ingestão de contratos de fornecedores que utiliza IA para analisar contratos, identificar serviços prestados, inferir processos condominiais necessários, mapear workflows completos, definir responsabilidades RACI e gerar processos automaticamente seguindo o template de processos do sistema. O objetivo é automatizar a criação de processos a partir de contratos, reduzindo tempo e esforço manual enquanto mantém qualidade e conformidade com o template.

**Abordagem Técnica**: 
- Backend: API FastAPI para upload, processamento e geração de processos
- IA: Integração com API de modelo de linguagem (OpenAI GPT-4 ou Anthropic Claude) para análise de contratos
- Processamento: Extração de texto de PDF/DOCX, análise por IA, geração estruturada de processos
- Frontend: Interface para upload, visualização de análise, revisão e edição de processos gerados

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/Next.js (frontend)  
**Primary Dependencies**: 
- Backend: FastAPI, SQLAlchemy, PyPDF2/pdfplumber, python-docx, openai/anthropic, pydantic
- Frontend: Next.js, React, TypeScript, react-dropzone, axios
**Storage**: PostgreSQL (dados estruturados), Sistema de arquivos ou S3 (contratos originais)  
**Testing**: pytest (backend), jest/react-testing-library (frontend)  
**Target Platform**: Linux server (backend), Web browser (frontend)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 
- Upload e extração de texto: < 30s para contratos de até 50 páginas
- Análise por IA: < 60s para contratos médios
- Geração de processo: < 30s por processo
**Constraints**: 
- Limite de tamanho de arquivo: 10MB
- Suporte a PDF, DOCX, TXT
- Processamento assíncrono para contratos grandes
- Validação de estrutura de processos gerados
**Scale/Scope**: 
- Múltiplos contratos simultâneos
- Processos gerados devem seguir template existente
- Integração com sistema de processos e entidades existente

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Feature adiciona valor claro: automação de criação de processos
- ✅ Não adiciona complexidade desnecessária: reutiliza sistemas existentes (processos, entidades)
- ✅ Segue padrões existentes: usa template de processos, estrutura de API similar
- ✅ Escopo bem definido: ingestão, análise, geração de processos
- ⚠️ Dependência externa (IA): requer API key e pode ter custos - necessário planejamento de custos
- ✅ Testável: cada etapa pode ser testada independentemente

## Project Structure

### Documentation (this feature)

```text
specs/007-ingestao-contratos-fornecedores/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
└── contracts/           # Phase 1 output (to be created)
    └── openapi.yaml     # API contracts
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   ├── contract.py          # Modelo de Contrato
│   │   │   └── contract_analysis.py # Modelo de Análise
│   │   ├── services/
│   │   │   ├── contract_service.py      # Serviço de gestão de contratos
│   │   │   ├── text_extraction_service.py # Extração de texto de PDF/DOCX
│   │   │   ├── ai_analysis_service.py    # Análise por IA
│   │   │   └── process_generation_service.py # Geração de processos
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── endpoints/
│   │   │           └── contracts.py  # Endpoints de contratos
│   │   └── schemas/
│   │       └── contract.py           # Schemas Pydantic
│   └── tests/
│       ├── unit/
│       │   ├── test_text_extraction.py
│       │   ├── test_ai_analysis.py
│       │   └── test_process_generation.py
│       ├── integration/
│       │   └── test_contract_flow.py
│       └── contract/
│           └── test_contracts_api.py

frontend/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       └── contracts/
│   │           ├── page.tsx          # Lista de contratos
│   │           ├── upload/
│   │           │   └── page.tsx      # Upload de contrato
│   │           └── [id]/
│   │               └── page.tsx      # Detalhes e revisão
│   ├── components/
│   │   └── contracts/
│   │       ├── ContractUpload.tsx
│   │       ├── ContractAnalysis.tsx
│   │       ├── ProcessPreview.tsx
│   │       └── ProcessReview.tsx
│   ├── lib/
│   │   └── api/
│   │       └── contracts.ts          # Cliente API
│   └── hooks/
│       └── useContracts.ts
```

**Structure Decision**: Web application com backend FastAPI e frontend Next.js, seguindo estrutura existente do projeto. Novos modelos, serviços e endpoints são adicionados ao backend existente. Frontend adiciona novas páginas e componentes seguindo padrão de roteamento do Next.js.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Dependência de IA externa | Análise inteligente de contratos requer capacidade de NLP avançada | Análise por regex/regras seria muito limitada e não conseguiria inferir processos complexos |
| Múltiplos serviços especializados | Separação de responsabilidades (extração, análise, geração) melhora testabilidade e manutenção | Serviço monolítico seria difícil de testar e manter |

## Phase 0: Research (To be completed)

### Research Areas

1. **Bibliotecas de Extração de Texto**
   - Comparar PyPDF2, pdfplumber, pymupdf para PDF
   - Comparar python-docx para DOCX
   - Avaliar necessidade de OCR (Tesseract) para PDFs escaneados
   - Decisão: Escolher biblioteca mais robusta e com melhor suporte a diferentes formatos

2. **APIs de IA para Análise de Texto**
   - Comparar OpenAI GPT-4, Anthropic Claude, Google Gemini
   - Avaliar custos, latência, qualidade de resposta
   - Definir prompts estruturados para análise de contratos
   - Decisão: Escolher API com melhor custo-benefício e qualidade

3. **Geração de Diagramas Mermaid**
   - Validar bibliotecas Python para geração de Mermaid
   - Definir estratégia de geração baseada em workflow
   - Decisão: Escolher abordagem mais confiável

4. **Armazenamento de Arquivos**
   - Avaliar armazenamento local vs cloud (S3)
   - Considerar segurança e backup
   - Decisão: Escolher solução adequada ao ambiente

5. **Processamento Assíncrono**
   - Avaliar Celery, Background Tasks do FastAPI, ou processamento síncrono
   - Considerar tempo de processamento de IA
   - Decisão: Escolher abordagem que não bloqueie requisições

## Phase 1: Design & Contracts (To be completed)

### Data Model

- **Contract**: Tabela para armazenar contratos ingeridos
- **ContractAnalysis**: Tabela para armazenar resultados de análise por IA
- **Relacionamentos**: Contract -> Entity (fornecedor), Contract -> Process[] (processos gerados)

### API Contracts

- `POST /api/v1/contracts/upload` - Upload de contrato
- `GET /api/v1/contracts` - Listar contratos
- `GET /api/v1/contracts/{id}` - Detalhes do contrato
- `POST /api/v1/contracts/{id}/analyze` - Iniciar análise por IA
- `GET /api/v1/contracts/{id}/analysis` - Obter resultado da análise
- `POST /api/v1/contracts/{id}/generate-processes` - Gerar processos a partir da análise
- `GET /api/v1/contracts/{id}/generated-processes` - Listar processos gerados
- `PUT /api/v1/contracts/{id}/processes/{process_id}` - Editar processo gerado
- `POST /api/v1/contracts/{id}/processes/{process_id}/confirm` - Confirmar e criar processo no sistema

### Quickstart Scenarios

1. Upload de contrato de manutenção de elevadores
2. Análise automática identificando processo de manutenção
3. Geração de processo completo com workflow e RACI
4. Revisão e edição do processo gerado
5. Confirmação e criação do processo no sistema

## Implementation Phases

### Phase 2: Core Infrastructure
- Modelos de dados (Contract, ContractAnalysis)
- Migrações de banco de dados
- Serviço de extração de texto
- Armazenamento de arquivos

### Phase 3: IA Integration
- Serviço de análise por IA
- Prompts estruturados para análise de contratos
- Processamento assíncrono

### Phase 4: Process Generation
- Serviço de geração de processos
- Geração de workflow
- Geração de matriz RACI
- Geração de diagramas Mermaid

### Phase 5: API Endpoints
- Endpoints de upload e gestão de contratos
- Endpoints de análise e geração
- Validações e tratamento de erros

### Phase 6: Frontend
- Interface de upload
- Visualização de análise
- Revisão e edição de processos
- Integração com sistema de processos existente

### Phase 7: Testing & Polish
- Testes unitários
- Testes de integração
- Testes end-to-end
- Ajustes de UX

## Risks & Mitigations

1. **Risco**: Qualidade da análise por IA pode variar
   - **Mitigação**: Permitir revisão e edição manual, melhorar prompts iterativamente

2. **Risco**: Custos de API de IA podem ser altos
   - **Mitigação**: Implementar cache, otimizar prompts, considerar modelos mais baratos

3. **Risco**: PDFs escaneados podem ter baixa qualidade de OCR
   - **Mitigação**: Validar qualidade de extração, permitir upload de texto manual como alternativa

4. **Risco**: Processos gerados podem não seguir template corretamente
   - **Mitigação**: Validação rigorosa antes de salvar, testes extensivos

## Next Steps

1. Completar Phase 0: Research (bibliotecas, APIs, estratégias)
2. Completar Phase 1: Design & Contracts (data model, API contracts, quickstart)
3. Criar tasks.md com breakdown detalhado de implementação
4. Iniciar implementação seguindo fases definidas
