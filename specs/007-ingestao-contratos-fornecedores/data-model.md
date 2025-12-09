# Data Model: Ingestão de Contratos de Fornecedores

**Feature**: `007-ingestao-contratos-fornecedores`  
**Date**: 2024-12-09

## Diagrama de Entidades

```
┌─────────────────────┐       ┌─────────────────────────┐
│      Contract       │       │    ContractAnalysis     │
├─────────────────────┤       ├─────────────────────────┤
│ id (UUID, PK)       │───1:N─│ id (UUID, PK)           │
│ file_name           │       │ contract_id (FK)        │
│ file_path           │       │ status                  │
│ file_size           │       │ identified_supplier     │
│ file_type           │       │ identified_services     │
│ extracted_text      │       │ suggested_categories    │
│ supplier_id (FK)    │       │ tokens_used             │
│ contract_type       │       │ processing_time_ms      │
│ start_date          │       │ created_at              │
│ end_date            │       └─────────────────────────┘
│ status              │                    │
│ created_by (FK)     │                    │ 1:N
│ created_at          │                    ▼
└─────────────────────┘       ┌─────────────────────────┐
         │                    │   SuggestedProcess      │
         │ 1:N                ├─────────────────────────┤
         ▼                    │ id (UUID, PK)           │
┌─────────────────────┐       │ analysis_id (FK)        │
│  ContractHistory    │       │ process_name            │
├─────────────────────┤       │ process_category        │
│ id (UUID, PK)       │       │ description             │
│ contract_id (FK)    │       │ workflow_steps (JSONB)  │
│ event_type          │       │ mermaid_diagram         │
│ description         │       │ raci_matrix (JSONB)     │
│ event_data (JSONB)  │       │ confidence_score        │
│ user_id (FK)        │       │ is_accepted             │
│ created_at          │       │ generated_process_id(FK)│
└─────────────────────┘       └─────────────────────────┘
```

## Enums

```python
class ContractStatus(str, Enum):
    UPLOADED = "uploaded"
    EXTRACTING = "extracting"
    EXTRACTED = "extracted"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    GENERATING = "generating"
    COMPLETED = "completed"
    ERROR = "error"

class ContractType(str, Enum):
    SERVICO = "servico"
    MANUTENCAO = "manutencao"
    FORNECIMENTO = "fornecimento"
    TERCEIRIZACAO = "terceirizacao"
    OUTRO = "outro"

class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ContractEventType(str, Enum):
    UPLOADED = "uploaded"
    EXTRACTION_COMPLETED = "extraction_completed"
    ANALYSIS_COMPLETED = "analysis_completed"
    PROCESS_ACCEPTED = "process_accepted"
    PROCESS_REJECTED = "process_rejected"
    PROCESS_GENERATED = "process_generated"
```

## Modelos SQLAlchemy

### Contract

```python
class Contract(Base):
    __tablename__ = "contracts"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(50), nullable=False)
    file_hash = Column(String(64), nullable=True)
    extracted_text = Column(Text, nullable=True)
    contract_number = Column(String(100), nullable=True)
    contract_type = Column(Enum(ContractType), nullable=True)
    supplier_name = Column(String(255), nullable=True)
    supplier_id = Column(UUID, ForeignKey("entities.id"), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(Enum(ContractStatus), default=ContractStatus.UPLOADED)
    error_message = Column(Text, nullable=True)
    created_by = Column(UUID, ForeignKey("stakeholders.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

### ContractAnalysis

```python
class ContractAnalysis(Base):
    __tablename__ = "contract_analyses"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    contract_id = Column(UUID, ForeignKey("contracts.id"), nullable=False)
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING)
    error_message = Column(Text, nullable=True)
    identified_supplier = Column(JSONB, nullable=True)
    identified_services = Column(JSONB, nullable=True)
    suggested_categories = Column(JSONB, nullable=True)
    raw_response = Column(JSONB, nullable=True)
    tokens_used = Column(Integer, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    model_used = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
```

### SuggestedProcess

```python
class SuggestedProcess(Base):
    __tablename__ = "suggested_processes"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID, ForeignKey("contract_analyses.id"), nullable=False)
    process_name = Column(String(255), nullable=False)
    process_category = Column(Enum(ProcessCategory), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    description = Column(Text, nullable=False)
    workflow_steps = Column(JSONB, nullable=False)
    mermaid_diagram = Column(Text, nullable=True)
    raci_matrix = Column(JSONB, nullable=True)
    entities_involved = Column(JSONB, nullable=True)
    variables = Column(JSONB, nullable=True)
    confidence_score = Column(Float, nullable=False, default=0.0)
    justification = Column(Text, nullable=True)
    missing_entities = Column(JSONB, nullable=True)
    is_accepted = Column(Boolean, default=False)
    is_rejected = Column(Boolean, default=False)
    rejection_reason = Column(Text, nullable=True)
    accepted_by = Column(UUID, ForeignKey("stakeholders.id"), nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    generated_process_id = Column(UUID, ForeignKey("processes.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
```

### ContractHistory

```python
class ContractHistory(Base):
    __tablename__ = "contract_history"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    contract_id = Column(UUID, ForeignKey("contracts.id"), nullable=False)
    event_type = Column(Enum(ContractEventType), nullable=False)
    description = Column(Text, nullable=False)
    event_data = Column(JSONB, nullable=True)
    user_id = Column(UUID, ForeignKey("stakeholders.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
```

## Alteração no Modelo Process

```python
# Adicionar ao modelo Process existente
source_contract_id = Column(UUID, ForeignKey("contracts.id"), nullable=True)
is_ai_generated = Column(Boolean, default=False)
```

## Índices

```sql
CREATE INDEX ix_contracts_status ON contracts(status);
CREATE INDEX ix_contracts_supplier_id ON contracts(supplier_id);
CREATE INDEX ix_contracts_created_at ON contracts(created_at);
CREATE INDEX ix_contract_analyses_contract_id ON contract_analyses(contract_id);
CREATE INDEX ix_suggested_processes_analysis_id ON suggested_processes(analysis_id);
CREATE INDEX ix_suggested_processes_confidence ON suggested_processes(confidence_score);
CREATE INDEX ix_contract_history_contract_id ON contract_history(contract_id);
CREATE INDEX ix_processes_source_contract_id ON processes(source_contract_id);
```

## Exemplo de JSONB

### identified_supplier
```json
{
  "name": "ElevaTech Manutenção",
  "type": "manutencao_elevador",
  "cnpj": "12.345.678/0001-90",
  "confidence": 0.95
}
```

### workflow_steps
```json
[
  "1. Receber agendamento mensal",
  "2. Comunicar moradores",
  "3. Liberar acesso da equipe",
  "4. Acompanhar execução",
  "5. Receber relatório técnico",
  "6. Validar conclusão"
]
```

### raci_matrix
```json
[
  {
    "step": "1. Receber agendamento",
    "responsible": ["Portaria Online"],
    "accountable": ["Síndico"],
    "consulted": [],
    "informed": ["Administradora"]
  }
]
```
