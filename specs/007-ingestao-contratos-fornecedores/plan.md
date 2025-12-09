# Technical Plan: Ingestão de Contratos de Fornecedores com IA

**Feature**: 007-ingestao-contratos-fornecedores  
**Status**: Planning  
**Created**: 2024-12-08

## Overview

Sistema de ingestão de contratos de fornecedores que utiliza IA para:
1. Extrair informações do contrato (PDF, DOCX, texto)
2. Inferir quais processos o fornecedor executará
3. Mapear automaticamente os processos identificados
4. Definir responsabilidades (RACI) baseado no contrato e padrões do sistema
5. Gerar processos completos seguindo o template de processos do sistema

## Arquitetura

### Componentes Principais

1. **Upload e Armazenamento de Contratos**
   - Upload de arquivos (PDF, DOCX, TXT)
   - Armazenamento seguro dos contratos originais
   - Versionamento de contratos

2. **Processamento de Documentos**
   - Extração de texto de PDFs e DOCX
   - OCR para contratos escaneados (opcional)
   - Limpeza e normalização de texto

3. **IA de Análise de Contratos**
   - LLM para análise do conteúdo do contrato
   - Identificação de serviços a serem prestados
   - Extração de informações estruturadas (prazos, responsabilidades, etc.)
   - Inferência de processos relacionados

4. **Geração Automática de Processos**
   - Mapeamento de serviços para processos do sistema
   - Geração de workflow baseado no contrato
   - Definição automática de responsabilidades RACI
   - Geração de diagrama Mermaid
   - Criação de entidades relacionadas (fornecedor)

5. **Validação e Aprovação**
   - Processos gerados entram no workflow de aprovação existente
   - Revisão e ajustes manuais quando necessário
   - Histórico de geração automática

## Fluxo de Processamento

```
1. Upload do Contrato
   ↓
2. Extração de Texto
   ↓
3. Análise com IA
   ├─→ Identificação de serviços
   ├─→ Extração de informações (prazos, responsabilidades)
   └─→ Mapeamento para processos
   ↓
4. Geração de Processos
   ├─→ Criação/atualização de entidade (fornecedor)
   ├─→ Geração de workflow
   ├─→ Definição de RACI
   ├─→ Geração de diagrama Mermaid
   └─→ Aplicação de template
   ↓
5. Validação e Revisão
   ├─→ Processos em status "rascunho"
   ├─→ Revisão manual opcional
   └─→ Envio para aprovação
```

## Technology Stack

**Backend:**
- FastAPI (Python)
- PyPDF2 / pdfplumber para PDFs
- python-docx para DOCX
- OpenAI GPT-4 / Anthropic Claude / Ollama (LLM local)
- LangChain para orquestração de prompts
- Celery para processamento assíncrono (opcional)

**Frontend:**
- Next.js 14, React, TypeScript
- Componente de upload de arquivos
- Visualização de contratos processados
- Interface de revisão de processos gerados

**Storage:**
- PostgreSQL (metadados e resultados)
- S3 ou filesystem (contratos originais)
- Vector DB (opcional, para busca semântica)

## Database Changes

### Nova Tabela: `contracts`

```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_name VARCHAR(255) NOT NULL,
    supplier_id UUID REFERENCES entities(id), -- Entidade do fornecedor
    contract_type VARCHAR(100), -- Tipo de contrato (manutenção, limpeza, etc.)
    file_path TEXT NOT NULL, -- Caminho do arquivo original
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50), -- pdf, docx, txt
    file_size BIGINT,
    status VARCHAR(50) NOT NULL, -- uploaded, processing, processed, error
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    error_message TEXT,
    extracted_text TEXT, -- Texto extraído do contrato
    ai_analysis JSONB, -- Análise completa da IA
    created_by UUID REFERENCES stakeholders(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contracts_supplier ON contracts(supplier_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_created_at ON contracts(created_at);
```

### Nova Tabela: `contract_process_mappings`

```sql
CREATE TABLE contract_process_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    process_id UUID REFERENCES processes(id) ON DELETE SET NULL,
    service_description TEXT NOT NULL, -- Descrição do serviço identificado
    confidence_score DECIMAL(3,2), -- Score de confiança da IA (0-1)
    auto_generated BOOLEAN DEFAULT TRUE,
    mapping_reason TEXT, -- Explicação do mapeamento
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mappings_contract ON contract_process_mappings(contract_id);
CREATE INDEX idx_mappings_process ON contract_process_mappings(process_id);
```

### Nova Tabela: `ai_generation_logs`

```sql
CREATE TABLE ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id),
    process_id UUID REFERENCES processes(id),
    generation_type VARCHAR(50), -- process_creation, workflow_generation, raci_mapping
    prompt_used TEXT,
    ai_response JSONB,
    tokens_used INTEGER,
    model_used VARCHAR(100),
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_contract ON ai_generation_logs(contract_id);
CREATE INDEX idx_logs_process ON ai_generation_logs(process_id);
```

## API Contracts

### POST /api/v1/contracts/upload

**Request:**
- Multipart form-data
- `file`: arquivo (PDF, DOCX, TXT)
- `supplier_name`: nome do fornecedor (opcional, pode ser extraído)
- `contract_type`: tipo de contrato (opcional)

**Response:**
```json
{
  "contract_id": "uuid",
  "status": "uploaded",
  "file_name": "contrato_fornecedor.pdf",
  "message": "Contrato recebido e aguardando processamento"
}
```

### POST /api/v1/contracts/{contract_id}/process

**Request:**
```json
{
  "force_reprocess": false
}
```

**Response:**
```json
{
  "contract_id": "uuid",
  "status": "processing",
  "estimated_time_seconds": 60
}
```

### GET /api/v1/contracts/{contract_id}/status

**Response:**
```json
{
  "contract_id": "uuid",
  "status": "processed",
  "progress": 100,
  "services_identified": [
    {
      "service": "Manutenção de elevadores",
      "process_mapped": "Manutenção Preventiva de Elevadores",
      "confidence": 0.95,
      "process_id": "uuid"
    }
  ],
  "processes_generated": 3,
  "errors": []
}
```

### GET /api/v1/contracts/{contract_id}/analysis

**Response:**
```json
{
  "contract_id": "uuid",
  "supplier_info": {
    "name": "Empresa XYZ",
    "contact": "contato@xyz.com",
    "phone": "(11) 9999-9999"
  },
  "services": [
    {
      "description": "Manutenção preventiva mensal de elevadores",
      "frequency": "mensal",
      "responsibilities": ["Empresa XYZ", "Síndico"],
      "processes_suggested": ["Manutenção Preventiva de Elevadores"]
    }
  ],
  "key_dates": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "renewal_date": "2024-11-01"
  },
  "responsibilities": {
    "supplier": ["Manutenção", "Relatórios"],
    "condominium": ["Acesso", "Pagamento"]
  }
}
```

### GET /api/v1/contracts/{contract_id}/processes

**Response:**
```json
{
  "contract_id": "uuid",
  "processes": [
    {
      "process_id": "uuid",
      "name": "Manutenção Preventiva de Elevadores",
      "status": "rascunho",
      "auto_generated": true,
      "confidence": 0.95,
      "needs_review": false
    }
  ]
}
```

### POST /api/v1/contracts/{contract_id}/processes/{process_id}/review

**Request:**
```json
{
  "action": "approve" | "reject" | "edit",
  "changes": {}, // Se action = "edit"
  "notes": "Texto opcional"
}
```

## Implementation Phases

### Phase 1: Upload e Extração Básica (MVP)
- Upload de contratos (PDF, DOCX, TXT)
- Extração de texto básica
- Armazenamento de contratos
- Interface básica de upload

**Entregáveis:**
- Endpoint de upload
- Extração de texto de PDFs e DOCX
- Armazenamento seguro
- Listagem de contratos

### Phase 2: Análise com IA
- Integração com LLM (OpenAI/Claude/Ollama)
- Análise de contratos para identificar serviços
- Extração de informações estruturadas
- Mapeamento inicial de serviços para processos

**Entregáveis:**
- Serviço de análise com IA
- Extração de informações do contrato
- Identificação de serviços
- Interface de visualização da análise

### Phase 3: Geração Automática de Processos
- Geração de workflow baseado no contrato
- Definição automática de RACI
- Geração de diagrama Mermaid
- Criação de processos seguindo template
- Criação/atualização de entidades (fornecedores)

**Entregáveis:**
- Geração completa de processos
- Integração com sistema de processos existente
- Validação de processos gerados
- Interface de revisão

### Phase 4: Refinamento e Otimização
- Melhoria de prompts para maior precisão
- Cache de análises similares
- Processamento em lote
- Métricas e monitoramento
- Feedback loop para melhorar geração

**Entregáveis:**
- Sistema otimizado
- Dashboard de métricas
- Processamento em lote
- Sistema de feedback

## Prompts de IA

### Prompt 1: Análise de Contrato

```
Analise o seguinte contrato de fornecedor e extraia informações estruturadas:

CONTRATO:
{texto_do_contrato}

Tarefas:
1. Identifique o nome do fornecedor e informações de contato
2. Liste todos os serviços que serão prestados
3. Para cada serviço, identifique:
   - Descrição detalhada
   - Frequência (diária, semanal, mensal, etc.)
   - Responsabilidades do fornecedor
   - Responsabilidades do condomínio
   - Prazos e datas importantes
4. Identifique processos condominiais relacionados a cada serviço

Retorne JSON estruturado com:
{
  "supplier": {
    "name": "...",
    "contact": {...}
  },
  "services": [
    {
      "description": "...",
      "frequency": "...",
      "supplier_responsibilities": [...],
      "condominium_responsibilities": [...],
      "related_processes": ["nome do processo"]
    }
  ],
  "key_dates": {...}
}
```

### Prompt 2: Geração de Workflow

```
Com base no seguinte serviço de contrato, gere um workflow completo de processo condominial:

SERVIÇO: {descricao_servico}
RESPONSABILIDADES FORNECEDOR: {responsabilidades_fornecedor}
RESPONSABILIDADES CONDOMÍNIO: {responsabilidades_condominio}
FREQUÊNCIA: {frequencia}

Gere um workflow passo a passo que:
1. Inclua todas as etapas necessárias
2. Defina responsáveis claros para cada etapa
3. Inclua pontos de aprovação quando necessário
4. Considere a frequência do serviço
5. Inclua validações e controles

Retorne JSON com:
{
  "workflow": [
    "1. Descrição da etapa",
    ...
  ],
  "entities": ["entidades envolvidas"],
  "variables": ["variáveis do sistema usadas"]
}
```

### Prompt 3: Definição de RACI

```
Para o workflow abaixo, defina a matriz RACI completa:

WORKFLOW:
{workflow}

ENTIDADES DISPONÍVEIS:
{lista_entidades}

Para cada etapa, defina:
- Responsible (R): Quem executa
- Accountable (A): Quem aprova (geralmente Síndico)
- Consulted (C): Quem é consultado
- Informed (I): Quem é informado

Retorne JSON com array de objetos RACI para cada etapa.
```

### Prompt 4: Geração de Diagrama Mermaid

```
Gere um diagrama Mermaid para o seguinte workflow:

WORKFLOW:
{workflow}

RACI:
{raci_matrix}

Regras:
- Cada nó deve incluir o responsável: A["Atividade<br/>(Responsável)"]
- Use cores: azul para execução, verde para aprovação, vermelho para urgência
- Inclua decisões quando necessário
- Mantenha fluxo lógico

Retorne apenas o código Mermaid.
```

## Integração com Sistema Existente

### Entidades
- Criar/atualizar entidade do fornecedor automaticamente
- Vincular contrato à entidade
- Validar existência de entidades mencionadas

### Processos
- Processos gerados seguem o mesmo modelo existente
- Entram no workflow de aprovação padrão
- Status inicial: "rascunho"
- Podem ser editados manualmente antes da aprovação

### Validação
- Usar sistema de validação de entidades existente
- Validar processos gerados antes de criar
- Sugerir correções quando necessário

## Segurança e Privacidade

- Contratos são dados sensíveis
- Armazenamento seguro (criptografia)
- Controle de acesso (apenas stakeholders autorizados)
- Logs de auditoria para acesso
- Retenção de dados conforme política

## Performance Considerations

- Processamento assíncrono para contratos grandes
- Cache de análises similares
- Limite de tamanho de arquivo (ex: 10MB)
- Timeout para processamento (ex: 5 minutos)
- Queue para processamento em lote

## Testing Strategy

- Unit tests para extração de texto
- Unit tests para prompts e parsing de respostas
- Integration tests para fluxo completo
- E2E tests com contratos reais (anônimos)
- Testes de performance com contratos grandes
- Validação de precisão da IA (métricas)

## Métricas de Sucesso

- Taxa de sucesso na extração de texto: >95%
- Precisão na identificação de serviços: >85%
- Precisão no mapeamento de processos: >80%
- Redução de tempo na criação de processos: >70%
- Taxa de aprovação de processos gerados: >60%

## Dependencies

- Sistema de processos existente (003)
- Sistema de entidades existente
- Sistema de aprovação existente (003)
- Sistema de validação (004) - opcional mas recomendado
- LLM disponível (OpenAI API, Claude API, ou Ollama local)

## Out of Scope

- Assinatura digital de contratos
- Renegociação automática de contratos
- Análise financeira de contratos
- Comparação de contratos de diferentes fornecedores
- Geração automática de documentos legais
