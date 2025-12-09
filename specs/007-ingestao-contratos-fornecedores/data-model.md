# Data Model: Ingestão de Contratos de Fornecedores

**Feature**: `007-ingestao-contratos-fornecedores`  
**Date**: 2024-12-09

## Visão Geral

Modelo de dados relacional usando PostgreSQL com SQLAlchemy ORM. Adiciona entidades para gerenciar contratos, análises por IA e processos sugeridos, mantendo rastreabilidade completa com o sistema existente.

## Novas Entidades

### 1. Contract

Representa um contrato de fornecedor ingerido no sistema.

```python
class ContractStatus(str, enum.Enum):
    UPLOADED = "uploaded"           # Arquivo enviado
    EXTRACTING = "extracting"       # Extraindo texto
    EXTRACTED = "extracted"         # Texto extraído com sucesso
    ANALYZING = "analyzing"         # Análise IA em andamento
    ANALYZED = "analyzed"           # Análise concluída
    GENERATING = "generating"       # Gerando processos
    COMPLETED = "completed"         # Processos gerados
    ERROR = "error"                 # Erro no processamento


class ContractType(str, enum.Enum):
    SERVICO = "servico"             # Prestação de serviços
    MANUTENCAO = "manutencao"       # Manutenção
    FORNECIMENTO = "fornecimento"   # Fornecimento de materiais
    TERCEIRIZACAO = "terceirizacao" # Terceirização
    OUTRO = "outro"


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Informações do arquivo
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)  # Caminho no S3/storage
    file_size = Column(Integer, nullable=False)       # Tamanho em bytes
    file_type = Column(String(50), nullable=False)    # pdf, doc, docx
    file_hash = Column(String(64), nullable=True)     # SHA256 para detectar duplicatas
    
    # Texto extraído
    extracted_text = Column(Text, nullable=True)
    extraction_metadata = Column(JSONB, nullable=True)  # Páginas, OCR usado, etc.
    
    # Metadados do contrato
    contract_number = Column(String(100), nullable=True, index=True)
    contract_type = Column(Enum(ContractType), nullable=True, index=True)
    supplier_name = Column(String(255), nullable=True, index=True)  # Nome extraído
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=True, index=True)
    
    # Datas
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    signature_date = Column(Date, nullable=True)
    
    # Status e processamento
    status = Column(Enum(ContractStatus), nullable=False, default=ContractStatus.UPLOADED, index=True)
    error_message = Column(Text, nullable=True)
    processing_started_at = Column(DateTime(timezone=True), nullable=True)
    processing_completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Auditoria
    created_by = Column(UUID(as_uuid=True), ForeignKey("stakeholders.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relacionamentos
    supplier = relationship("Entity", foreign_keys=[supplier_id])
    creator = relationship("Stakeholder", foreign_keys=[created_by])
    analyses = relationship("ContractAnalysis", back_populates="contract", order_by="ContractAnalysis.created_at.desc()")
    history = relationship("ContractHistory", back_populates="contract", order_by="ContractHistory.created_at.desc()")
    generated_processes = relationship("Process", back_populates="source_contract")

    def __repr__(self):
        return f"<Contract(id={self.id}, file_name='{self.file_name}', status={self.status.value})>"
```

**Índices**: `contract_number`, `contract_type`, `supplier_name`, `supplier_id`, `status`, `created_by`, `created_at`

---

### 2. ContractAnalysis

Representa uma análise de contrato realizada pela IA.

```python
class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"       # Aguardando processamento
    PROCESSING = "processing" # Em processamento
    COMPLETED = "completed"   # Concluída com sucesso
    FAILED = "failed"         # Falhou


class ContractAnalysis(Base):
    __tablename__ = "contract_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contract_id = Column(UUID(as_uuid=True), ForeignKey("contracts.id"), nullable=False, index=True)
    
    # Status
    status = Column(Enum(AnalysisStatus), nullable=False, default=AnalysisStatus.PENDING, index=True)
    error_message = Column(Text, nullable=True)
    
    # Resultados da análise
    identified_supplier = Column(JSONB, nullable=True)
    # {
    #   "name": "Empresa XYZ",
    #   "type": "manutencao_elevador",
    #   "confidence": 0.95,
    #   "extracted_info": { "cnpj": "...", "contact": "..." }
    # }
    
    identified_services = Column(JSONB, nullable=True)
    # [
    #   {
    #     "service": "Manutenção preventiva de elevadores",
    #     "frequency": "mensal",
    #     "confidence": 0.92
    #   }
    # ]
    
    identified_responsibilities = Column(JSONB, nullable=True)
    # [
    #   {
    #     "party": "fornecedor",
    #     "responsibility": "Executar manutenção mensal",
    #     "clause": "Cláusula 3.1"
    #   }
    # ]
    
    suggested_categories = Column(JSONB, nullable=True)
    # [
    #   {
    #     "category": "operacao",
    #     "confidence": 0.88,
    #     "justification": "Contrato de manutenção..."
    #   }
    # ]
    
    # Resposta raw do LLM (para debug/auditoria)
    raw_response = Column(JSONB, nullable=True)
    
    # Métricas
    tokens_used = Column(Integer, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)  # Tempo em milissegundos
    model_used = Column(String(50), nullable=True)       # gpt-4, gpt-3.5-turbo, etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relacionamentos
    contract = relationship("Contract", back_populates="analyses")
    suggested_processes = relationship("SuggestedProcess", back_populates="analysis", order_by="SuggestedProcess.confidence_score.desc()")

    def __repr__(self):
        return f"<ContractAnalysis(id={self.id}, contract_id={self.contract_id}, status={self.status.value})>"
```

**Índices**: `contract_id`, `status`, `created_at`

---

### 3. SuggestedProcess

Representa um processo sugerido pela IA baseado na análise do contrato.

```python
class SuggestedProcess(Base):
    __tablename__ = "suggested_processes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("contract_analyses.id"), nullable=False, index=True)
    
    # Dados do processo sugerido
    process_name = Column(String(255), nullable=False)
    process_category = Column(Enum(ProcessCategory), nullable=False, index=True)
    document_type = Column(Enum(DocumentType), nullable=False)
    description = Column(Text, nullable=False)
    
    # Workflow
    workflow_steps = Column(JSONB, nullable=False)
    # [
    #   "1. Receber solicitação de manutenção",
    #   "2. Agendar visita técnica",
    #   "3. Executar manutenção",
    #   "4. Registrar relatório",
    #   "5. Validar conclusão"
    # ]
    
    # Diagrama Mermaid
    mermaid_diagram = Column(Text, nullable=True)
    
    # Matriz RACI
    raci_matrix = Column(JSONB, nullable=True)
    # [
    #   {
    #     "step": "1. Receber solicitação",
    #     "responsible": ["Portaria Online"],
    #     "accountable": ["Síndico"],
    #     "consulted": [],
    #     "informed": ["Moradores"]
    #   }
    # ]
    
    # Entidades identificadas
    entities_involved = Column(JSONB, nullable=True)
    # ["Síndico", "Empresa XYZ", "Moradores"]
    
    # Variáveis do sistema
    variables = Column(JSONB, nullable=True)
    # ["horario_manutencao", "telefone_emergencia"]
    
    # Métricas de confiança
    confidence_score = Column(Float, nullable=False, default=0.0, index=True)
    justification = Column(Text, nullable=True)
    
    # Entidades faltantes (validação)
    missing_entities = Column(JSONB, nullable=True)
    # ["Empresa XYZ Elevadores"]  # Entidades que precisam ser criadas
    
    # Status de aceitação
    is_accepted = Column(Boolean, default=False, index=True)
    is_rejected = Column(Boolean, default=False)
    rejection_reason = Column(Text, nullable=True)
    accepted_by = Column(UUID(as_uuid=True), ForeignKey("stakeholders.id"), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Processo gerado (se aceito)
    generated_process_id = Column(UUID(as_uuid=True), ForeignKey("processes.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relacionamentos
    analysis = relationship("ContractAnalysis", back_populates="suggested_processes")
    acceptor = relationship("Stakeholder", foreign_keys=[accepted_by])
    generated_process = relationship("Process", foreign_keys=[generated_process_id])

    def __repr__(self):
        return f"<SuggestedProcess(id={self.id}, name='{self.process_name}', confidence={self.confidence_score})>"
```

**Índices**: `analysis_id`, `process_category`, `confidence_score`, `is_accepted`

---

### 4. ContractHistory

Histórico de eventos relacionados a um contrato.

```python
class ContractEventType(str, enum.Enum):
    UPLOADED = "uploaded"                     # Contrato enviado
    EXTRACTION_STARTED = "extraction_started" # Extração iniciada
    EXTRACTION_COMPLETED = "extraction_completed"
    EXTRACTION_FAILED = "extraction_failed"
    ANALYSIS_STARTED = "analysis_started"
    ANALYSIS_COMPLETED = "analysis_completed"
    ANALYSIS_FAILED = "analysis_failed"
    PROCESS_SUGGESTED = "process_suggested"   # Processo sugerido
    PROCESS_ACCEPTED = "process_accepted"     # Sugestão aceita
    PROCESS_REJECTED = "process_rejected"     # Sugestão rejeitada
    PROCESS_GENERATED = "process_generated"   # Processo criado
    SUPPLIER_LINKED = "supplier_linked"       # Fornecedor vinculado
    METADATA_UPDATED = "metadata_updated"     # Metadados atualizados


class ContractHistory(Base):
    __tablename__ = "contract_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contract_id = Column(UUID(as_uuid=True), ForeignKey("contracts.id"), nullable=False, index=True)
    
    event_type = Column(Enum(ContractEventType), nullable=False, index=True)
    description = Column(Text, nullable=False)
    
    # Dados adicionais do evento (flexível)
    event_data = Column(JSONB, nullable=True)
    # Ex: { "process_id": "...", "confidence_score": 0.85 }
    
    # Quem fez a ação (sistema se null)
    user_id = Column(UUID(as_uuid=True), ForeignKey("stakeholders.id"), nullable=True, index=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Relacionamentos
    contract = relationship("Contract", back_populates="history")
    user = relationship("Stakeholder", foreign_keys=[user_id])

    def __repr__(self):
        return f"<ContractHistory(id={self.id}, event={self.event_type.value})>"
```

**Índices**: `contract_id`, `event_type`, `user_id`, `created_at`

---

## Alterações em Entidades Existentes

### Process (adicionar campo)

```python
# Adicionar ao modelo Process existente
class Process(Base):
    # ... campos existentes ...
    
    # NOVO: Vínculo com contrato de origem
    source_contract_id = Column(UUID(as_uuid=True), ForeignKey("contracts.id"), nullable=True, index=True)
    
    # NOVO: Flag indicando se foi gerado por IA
    is_ai_generated = Column(Boolean, default=False, nullable=False)
    
    # NOVO: Relacionamento
    source_contract = relationship("Contract", back_populates="generated_processes")
```

---

## Relacionamentos Completos

```
Contract (1) ──< (N) ContractAnalysis
Contract (1) ──< (N) ContractHistory
Contract (1) ──< (N) Process (via source_contract_id)
Contract (N) >── (1) Entity (supplier_id)
Contract (N) >── (1) Stakeholder (created_by)

ContractAnalysis (1) ──< (N) SuggestedProcess

SuggestedProcess (1) ── (0..1) Process (generated_process_id)
SuggestedProcess (N) >── (1) Stakeholder (accepted_by)

ContractHistory (N) >── (1) Contract
ContractHistory (N) >── (0..1) Stakeholder (user_id)
```

---

## Constraints e Validações

1. **Contract.file_hash**: Pode ser usado para detectar uploads duplicados
2. **Contract.status**: Deve seguir fluxo válido (UPLOADED → EXTRACTING → EXTRACTED → ANALYZING → ...)
3. **SuggestedProcess.confidence_score**: Valor entre 0.0 e 1.0
4. **SuggestedProcess.is_accepted + is_rejected**: Mutuamente exclusivos
5. **SuggestedProcess.generated_process_id**: Só pode ser preenchido se is_accepted = true

---

## Queries Otimizadas

### Contratos Pendentes de Análise
```sql
SELECT * FROM contracts
WHERE status = 'extracted'
ORDER BY created_at ASC
LIMIT 10;
```

### Processos Sugeridos com Alta Confiança
```sql
SELECT sp.*, c.file_name, c.supplier_name
FROM suggested_processes sp
JOIN contract_analyses ca ON sp.analysis_id = ca.id
JOIN contracts c ON ca.contract_id = c.id
WHERE sp.is_accepted = false
  AND sp.is_rejected = false
  AND sp.confidence_score >= 0.75
ORDER BY sp.confidence_score DESC;
```

### Dashboard de Métricas
```sql
-- Total de contratos por status
SELECT status, COUNT(*) as total
FROM contracts
GROUP BY status;

-- Taxa de aceitação de sugestões
SELECT 
  COUNT(*) FILTER (WHERE is_accepted = true) as aceitos,
  COUNT(*) FILTER (WHERE is_rejected = true) as rejeitados,
  COUNT(*) as total,
  ROUND(COUNT(*) FILTER (WHERE is_accepted = true)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as taxa_aceitacao
FROM suggested_processes;

-- Processos gerados por período
SELECT 
  DATE_TRUNC('month', p.created_at) as mes,
  COUNT(*) as total_processos
FROM processes p
WHERE p.is_ai_generated = true
GROUP BY DATE_TRUNC('month', p.created_at)
ORDER BY mes DESC;
```

### Timeline de Contrato
```sql
SELECT 
  ch.event_type,
  ch.description,
  ch.created_at,
  s.name as user_name
FROM contract_history ch
LEFT JOIN stakeholders s ON ch.user_id = s.id
WHERE ch.contract_id = :contract_id
ORDER BY ch.created_at DESC;
```

---

## Migração Alembic

```python
# alembic/versions/004_add_contracts_tables.py

def upgrade():
    # Enum types
    op.execute("CREATE TYPE contractstatus AS ENUM ('uploaded', 'extracting', 'extracted', 'analyzing', 'analyzed', 'generating', 'completed', 'error')")
    op.execute("CREATE TYPE contracttype AS ENUM ('servico', 'manutencao', 'fornecimento', 'terceirizacao', 'outro')")
    op.execute("CREATE TYPE analysisstatus AS ENUM ('pending', 'processing', 'completed', 'failed')")
    op.execute("CREATE TYPE contracteventtype AS ENUM ('uploaded', 'extraction_started', 'extraction_completed', 'extraction_failed', 'analysis_started', 'analysis_completed', 'analysis_failed', 'process_suggested', 'process_accepted', 'process_rejected', 'process_generated', 'supplier_linked', 'metadata_updated')")
    
    # contracts table
    op.create_table('contracts',
        sa.Column('id', UUID(), primary_key=True),
        sa.Column('file_name', sa.String(255), nullable=False),
        sa.Column('file_path', sa.String(500), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('file_type', sa.String(50), nullable=False),
        sa.Column('file_hash', sa.String(64), nullable=True),
        sa.Column('extracted_text', sa.Text(), nullable=True),
        sa.Column('extraction_metadata', JSONB(), nullable=True),
        sa.Column('contract_number', sa.String(100), nullable=True),
        sa.Column('contract_type', sa.Enum('contracttype', name='contracttype'), nullable=True),
        sa.Column('supplier_name', sa.String(255), nullable=True),
        sa.Column('supplier_id', UUID(), sa.ForeignKey('entities.id'), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('signature_date', sa.Date(), nullable=True),
        sa.Column('status', sa.Enum('contractstatus', name='contractstatus'), nullable=False, server_default='uploaded'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('processing_started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('processing_completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', UUID(), sa.ForeignKey('stakeholders.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    
    # Índices
    op.create_index('ix_contracts_contract_number', 'contracts', ['contract_number'])
    op.create_index('ix_contracts_contract_type', 'contracts', ['contract_type'])
    op.create_index('ix_contracts_supplier_name', 'contracts', ['supplier_name'])
    op.create_index('ix_contracts_supplier_id', 'contracts', ['supplier_id'])
    op.create_index('ix_contracts_status', 'contracts', ['status'])
    op.create_index('ix_contracts_created_by', 'contracts', ['created_by'])
    op.create_index('ix_contracts_created_at', 'contracts', ['created_at'])
    
    # contract_analyses table
    op.create_table('contract_analyses',
        sa.Column('id', UUID(), primary_key=True),
        sa.Column('contract_id', UUID(), sa.ForeignKey('contracts.id'), nullable=False),
        sa.Column('status', sa.Enum('analysisstatus', name='analysisstatus'), nullable=False, server_default='pending'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('identified_supplier', JSONB(), nullable=True),
        sa.Column('identified_services', JSONB(), nullable=True),
        sa.Column('identified_responsibilities', JSONB(), nullable=True),
        sa.Column('suggested_categories', JSONB(), nullable=True),
        sa.Column('raw_response', JSONB(), nullable=True),
        sa.Column('tokens_used', sa.Integer(), nullable=True),
        sa.Column('processing_time_ms', sa.Integer(), nullable=True),
        sa.Column('model_used', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )
    
    op.create_index('ix_contract_analyses_contract_id', 'contract_analyses', ['contract_id'])
    op.create_index('ix_contract_analyses_status', 'contract_analyses', ['status'])
    op.create_index('ix_contract_analyses_created_at', 'contract_analyses', ['created_at'])
    
    # suggested_processes table
    op.create_table('suggested_processes',
        sa.Column('id', UUID(), primary_key=True),
        sa.Column('analysis_id', UUID(), sa.ForeignKey('contract_analyses.id'), nullable=False),
        sa.Column('process_name', sa.String(255), nullable=False),
        sa.Column('process_category', sa.Enum('processcategory', name='processcategory'), nullable=False),
        sa.Column('document_type', sa.Enum('documenttype', name='documenttype'), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('workflow_steps', JSONB(), nullable=False),
        sa.Column('mermaid_diagram', sa.Text(), nullable=True),
        sa.Column('raci_matrix', JSONB(), nullable=True),
        sa.Column('entities_involved', JSONB(), nullable=True),
        sa.Column('variables', JSONB(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('justification', sa.Text(), nullable=True),
        sa.Column('missing_entities', JSONB(), nullable=True),
        sa.Column('is_accepted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_rejected', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('accepted_by', UUID(), sa.ForeignKey('stakeholders.id'), nullable=True),
        sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('generated_process_id', UUID(), sa.ForeignKey('processes.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    
    op.create_index('ix_suggested_processes_analysis_id', 'suggested_processes', ['analysis_id'])
    op.create_index('ix_suggested_processes_process_category', 'suggested_processes', ['process_category'])
    op.create_index('ix_suggested_processes_confidence_score', 'suggested_processes', ['confidence_score'])
    op.create_index('ix_suggested_processes_is_accepted', 'suggested_processes', ['is_accepted'])
    
    # contract_history table
    op.create_table('contract_history',
        sa.Column('id', UUID(), primary_key=True),
        sa.Column('contract_id', UUID(), sa.ForeignKey('contracts.id'), nullable=False),
        sa.Column('event_type', sa.Enum('contracteventtype', name='contracteventtype'), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('event_data', JSONB(), nullable=True),
        sa.Column('user_id', UUID(), sa.ForeignKey('stakeholders.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    
    op.create_index('ix_contract_history_contract_id', 'contract_history', ['contract_id'])
    op.create_index('ix_contract_history_event_type', 'contract_history', ['event_type'])
    op.create_index('ix_contract_history_user_id', 'contract_history', ['user_id'])
    op.create_index('ix_contract_history_created_at', 'contract_history', ['created_at'])
    
    # Adicionar colunas na tabela processes
    op.add_column('processes', sa.Column('source_contract_id', UUID(), sa.ForeignKey('contracts.id'), nullable=True))
    op.add_column('processes', sa.Column('is_ai_generated', sa.Boolean(), nullable=False, server_default='false'))
    op.create_index('ix_processes_source_contract_id', 'processes', ['source_contract_id'])
    op.create_index('ix_processes_is_ai_generated', 'processes', ['is_ai_generated'])


def downgrade():
    # Remover colunas da tabela processes
    op.drop_index('ix_processes_is_ai_generated', table_name='processes')
    op.drop_index('ix_processes_source_contract_id', table_name='processes')
    op.drop_column('processes', 'is_ai_generated')
    op.drop_column('processes', 'source_contract_id')
    
    # Remover tabelas
    op.drop_table('contract_history')
    op.drop_table('suggested_processes')
    op.drop_table('contract_analyses')
    op.drop_table('contracts')
    
    # Remover enums
    op.execute("DROP TYPE contracteventtype")
    op.execute("DROP TYPE analysisstatus")
    op.execute("DROP TYPE contracttype")
    op.execute("DROP TYPE contractstatus")
```

---

## Considerações de Performance

1. **Índices**: Todos os campos frequentemente consultados indexados
2. **JSONB**: Usado para dados flexíveis (análises, RACI) com suporte a queries
3. **Paginação**: Sempre paginar listas (especialmente histórico)
4. **Cache**: Resultados de análise podem ser cacheados no Redis
5. **Async**: Upload e análise devem ser processados de forma assíncrona
6. **Full-text search**: `extracted_text` pode receber índice GIN para busca
