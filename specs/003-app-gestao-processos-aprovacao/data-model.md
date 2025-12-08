# Data Model: Aplicação de Gestão de Processos Condominiais

**Feature**: `003-app-gestao-processos-aprovacao`  
**Date**: 2024-12-08

## Visão Geral

Modelo de dados relacional usando PostgreSQL com SQLAlchemy ORM. Foco em rastreabilidade completa, versionamento imutável e relacionamentos complexos entre processos, versões, aprovações e stakeholders.

## Entidades Principais

### 1. Stakeholder

Representa pessoa ou entidade que pode aprovar/revisar processos.

```python
class Stakeholder(Base):
    id: UUID (PK)
    name: str (required, max 255)
    email: str (required, unique, indexed)
    type: Enum (sindico, conselheiro, administradora, morador, outro)
    role: Enum (aprovador, visualizador, editor)
    is_active: bool (default True)
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    approvals: List[Approval]
    rejections: List[Rejection]
    created_processes: List[Process]  # creator_id
    assigned_workflows: List[WorkflowApproval]  # Many-to-Many
    notifications: List[Notification]
    history_events: List[History]
```

**Índices**: email (unique), type, is_active

### 2. Process

Representa um processo condominial documentado.

```python
class Process(Base):
    id: UUID (PK)
    name: str (required, max 255, indexed)
    category: Enum (governanca, acesso_seguranca, operacao, areas_comuns, convivencia, eventos, emergencias)
    subcategory: str (nullable, max 255)
    document_type: Enum (pop, manual, regulamento, fluxograma, aviso, comunicado, checklist, formulario, politica)
    status: Enum (rascunho, em_revisao, aprovado, rejeitado) (indexed)
    current_version_number: int (default 1)
    creator_id: UUID (FK -> Stakeholder)
    created_at: datetime (indexed)
    updated_at: datetime
    
    # Relationships
    versions: List[ProcessVersion]
    current_version: ProcessVersion  # current_version_id FK
    approvals: List[Approval]
    rejections: List[Rejection]
    workflow_config: WorkflowApproval  # One-to-One
    notifications: List[Notification]
    history: List[History]
    related_processes: List[ProcessRelation]  # Many-to-Many self-referential
```

**Índices**: category, status, creator_id, created_at

### 3. ProcessVersion

Representa uma versão específica de um processo. Versões são imutáveis após criação.

```python
class ProcessVersion(Base):
    id: UUID (PK)
    process_id: UUID (FK -> Process, indexed)
    version_number: int (required, unique per process)
    content: JSONB (required)  # Estrutura flexível do conteúdo
    content_text: Text  # Versão texto para busca full-text
    variables_applied: JSONB  # Variáveis aplicadas nesta versão
    entities_involved: JSONB  # Entidades envolvidas
    created_by: UUID (FK -> Stakeholder)
    created_at: datetime (indexed)
    status: Enum (rascunho, em_revisao, aprovado, rejeitado)
    change_summary: Text (nullable)  # Resumo das mudanças
    
    # Relationships
    process: Process
    approvals: List[Approval]
    rejections: List[Rejection]
    previous_version: ProcessVersion  # previous_version_id FK (nullable)
    next_version: ProcessVersion  # Reverse relationship
    history: List[History]
```

**Índices**: process_id, version_number (composite unique), created_at  
**Full-text search**: content_text (GIN index)

### 4. Approval

Representa aprovação de processo por stakeholder.

```python
class Approval(Base):
    id: UUID (PK)
    process_id: UUID (FK -> Process, indexed)
    version_id: UUID (FK -> ProcessVersion, indexed)
    stakeholder_id: UUID (FK -> Stakeholder, indexed)
    approved_at: datetime (required, indexed)
    comments: Text (nullable)
    approval_type: Enum (aprovado, aprovado_com_ressalvas)
    ressalvas: Text (nullable)  # Se aprovado_com_ressalvas
    
    # Relationships
    process: Process
    version: ProcessVersion
    stakeholder: Stakeholder
```

**Índices**: process_id, version_id, stakeholder_id, approved_at  
**Unique constraint**: (version_id, stakeholder_id) - um stakeholder só pode aprovar uma vez por versão

### 5. Rejection

Representa rejeição de processo por stakeholder.

```python
class Rejection(Base):
    id: UUID (PK)
    process_id: UUID (FK -> Process, indexed)
    version_id: UUID (FK -> ProcessVersion, indexed)
    stakeholder_id: UUID (FK -> Stakeholder, indexed)
    rejected_at: datetime (required, indexed)
    reason: Text (required)  # Motivo obrigatório
    additional_comments: Text (nullable)
    addressed_in_version: UUID (FK -> ProcessVersion, nullable)  # Versão que endereçou esta rejeição
    
    # Relationships
    process: Process
    version: ProcessVersion
    stakeholder: Stakeholder
    addressed_version: ProcessVersion
```

**Índices**: process_id, version_id, stakeholder_id, rejected_at

### 6. WorkflowApproval

Configuração de workflow de aprovação para categoria/tipo de processo.

```python
class WorkflowApproval(Base):
    id: UUID (PK)
    process_category: Enum (required, indexed)
    document_type: Enum (nullable, indexed)
    approval_type: Enum (unanimous, majority, any_one)
    required_approvers: int (default 1)
    deadline_days: int (nullable)  # Prazo em dias para aprovação
    is_active: bool (default True)
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    process: Process  # One-to-One
    required_stakeholders: List[Stakeholder]  # Many-to-Many via WorkflowStakeholder
```

**Tabela de associação**: WorkflowStakeholder (workflow_id, stakeholder_id, is_required)

### 7. Notification

Notificações enviadas a stakeholders.

```python
class Notification(Base):
    id: UUID (PK)
    stakeholder_id: UUID (FK -> Stakeholder, indexed)
    process_id: UUID (FK -> Process, nullable, indexed)
    type: Enum (approval_pending, approved, rejected, reminder, process_refactored)
    title: str (required, max 255)
    message: Text (required)
    is_read: bool (default False, indexed)
    read_at: datetime (nullable)
    created_at: datetime (indexed)
    email_sent: bool (default False)
    email_sent_at: datetime (nullable)
    
    # Relationships
    stakeholder: Stakeholder
    process: Process
```

**Índices**: stakeholder_id, is_read, created_at, process_id

### 8. History

Histórico completo de todas as ações em processos.

```python
class History(Base):
    id: UUID (PK)
    process_id: UUID (FK -> Process, indexed)
    version_id: UUID (FK -> ProcessVersion, nullable, indexed)
    event_type: Enum (created, edited, approved, rejected, refactored, status_changed)
    stakeholder_id: UUID (FK -> Stakeholder, nullable, indexed)
    event_data: JSONB  # Dados adicionais do evento
    description: Text (required)
    created_at: datetime (required, indexed)
    
    # Relationships
    process: Process
    version: ProcessVersion
    stakeholder: Stakeholder
```

**Índices**: process_id, version_id, stakeholder_id, event_type, created_at

### 9. ProcessRelation

Relacionamentos entre processos (dependências, relacionados).

```python
class ProcessRelation(Base):
    id: UUID (PK)
    source_process_id: UUID (FK -> Process, indexed)
    target_process_id: UUID (FK -> Process, indexed)
    relation_type: Enum (depends_on, related_to, replaces)
    created_at: datetime
    
    # Relationships
    source_process: Process
    target_process: Process
```

**Índices**: source_process_id, target_process_id  
**Unique constraint**: (source_process_id, target_process_id, relation_type)

## Relacionamentos Principais

```
Stakeholder (1) ──< (N) Process (creator)
Stakeholder (1) ──< (N) Approval
Stakeholder (1) ──< (N) Rejection
Stakeholder (1) ──< (N) Notification
Stakeholder (N) >──< (N) WorkflowApproval (via WorkflowStakeholder)

Process (1) ──< (N) ProcessVersion
Process (1) ──< (N) Approval
Process (1) ──< (N) Rejection
Process (1) ──< (N) History
Process (1) ──< (N) Notification
Process (1) ── (1) WorkflowApproval
Process (N) >──< (N) Process (via ProcessRelation)

ProcessVersion (1) ──< (N) Approval
ProcessVersion (1) ──< (N) Rejection
ProcessVersion (1) ──< (N) History
ProcessVersion (1) ── (1) ProcessVersion (previous_version)
```

## Constraints e Validações

1. **ProcessVersion**: version_number deve ser sequencial e único por processo
2. **Approval**: Um stakeholder só pode aprovar uma vez por versão
3. **Rejection**: Motivo (reason) é obrigatório
4. **Process**: Status deve seguir fluxo válido (rascunho → em_revisao → aprovado/rejeitado)
5. **WorkflowApproval**: required_approvers deve ser <= número de stakeholders atribuídos
6. **ProcessVersion**: Versões são imutáveis após criação (apenas leitura)

## Queries Otimizadas

### Busca de Processos Pendentes de Aprovação
```sql
SELECT p.* FROM processes p
JOIN workflow_approvals wa ON p.workflow_config_id = wa.id
JOIN workflow_stakeholders ws ON wa.id = ws.workflow_id
WHERE p.status = 'em_revisao'
  AND ws.stakeholder_id = :stakeholder_id
  AND NOT EXISTS (
    SELECT 1 FROM approvals a
    WHERE a.version_id = p.current_version_id
      AND a.stakeholder_id = :stakeholder_id
  )
```

### Histórico Completo de Processo
```sql
SELECT h.*, s.name as stakeholder_name
FROM history h
LEFT JOIN stakeholders s ON h.stakeholder_id = s.id
WHERE h.process_id = :process_id
ORDER BY h.created_at DESC
```

### Comparação de Versões
```sql
SELECT v1.*, v2.*
FROM process_versions v1
JOIN process_versions v2 ON v1.process_id = v2.process_id
WHERE v1.id = :version1_id AND v2.id = :version2_id
```

## Migrations

Usar Alembic para gerenciar migrations:
- Migration inicial: Criar todas as tabelas
- Migration seed: Inserir processos pré-cadastrados
- Migration índices: Adicionar índices para performance

## Considerações de Performance

1. **Índices**: Todos os FKs e campos frequentemente consultados indexados
2. **Full-text search**: GIN index em content_text para busca
3. **JSONB**: Usar JSONB para campos flexíveis (content, variables_applied)
4. **Paginação**: Sempre paginar listas grandes (LIMIT/OFFSET ou cursor-based)
5. **Eager loading**: Usar joinedload/selectinload do SQLAlchemy para evitar N+1 queries


