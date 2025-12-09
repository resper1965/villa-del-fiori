# Data Model: Gabi - Síndica Virtual

**Feature**: `003-app-gestao-processos-aprovacao`  
**Date**: 2024-12-08  
**Updated**: 2025-01-09  
**Application Name**: Gabi - Síndica Virtual

## Visão Geral

Modelo de dados relacional usando PostgreSQL via Supabase. Foco em rastreabilidade completa, versionamento imutável e relacionamentos complexos entre processos, versões, aprovações e stakeholders. Integração com Supabase Auth para autenticação e sistema de aprovação de usuários.

## Estrutura do Banco de Dados

### Schema: `public`

Todas as tabelas estão no schema `public` com Row Level Security (RLS) habilitado.

## Entidades Principais

### 1. Stakeholder

Representa pessoa ou entidade que pode aprovar/revisar processos. Integrado com Supabase Auth.

**Tabela**: `stakeholders`

```sql
CREATE TABLE stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id),  -- Integração Supabase Auth
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    type stakeholdertype,  -- Enum: sindico, conselheiro, administradora, morador, staff, outro
    role stakeholderrole DEFAULT 'visualizador',  -- Enum: aprovador, visualizador, editor
    user_role userrole DEFAULT 'resident',  -- Enum: admin, syndic, subsindico, council, resident, staff
    is_approved BOOLEAN DEFAULT false,  -- Sistema de aprovação
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES stakeholders(id),
    approval_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos de Aprovação**:
- `is_approved`: Se o usuário foi aprovado para acessar o sistema
- `approved_at`: Data/hora da aprovação
- `approved_by`: ID do stakeholder que aprovou
- `approval_notes`: Notas sobre a aprovação

**Roles (user_role)**:
- `admin`: Administrador da aplicação
- `syndic`: Síndico
- `subsindico`: Subsíndico
- `council`: Conselheiro
- `staff`: Staff/Administradora
- `resident`: Morador (apenas acesso ao chat)

**Índices**: 
- `email` (unique)
- `auth_user_id` (unique)
- `is_approved`
- `user_role`

### 2. Process

Representa um processo condominial documentado.

**Tabela**: `processes`

```sql
CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category processcategory NOT NULL,  -- Enum: governanca, acesso_seguranca, operacao, areas_comuns, convivencia, eventos, emergencias
    subcategory VARCHAR(255),
    document_type documenttype NOT NULL,  -- Enum: pop, manual, regulamento, fluxograma, aviso, comunicado, checklist, formulario, politica
    status processstatus DEFAULT 'rascunho',  -- Enum: rascunho, em_revisao, aprovado, rejeitado
    current_version_number INTEGER DEFAULT 1,
    creator_id UUID NOT NULL REFERENCES stakeholders(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices**: 
- `name`
- `category`
- `status`
- `creator_id`
- `created_at`

**Relacionamentos**:
- `creator_id` → `stakeholders.id`
- `process_versions` (1:N)
- `approvals` (1:N)
- `rejections` (1:N)

### 3. ProcessVersion

Representa uma versão específica de um processo. Versões são imutáveis após criação.

**Tabela**: `process_versions`

```sql
CREATE TABLE process_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id),
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,  -- Estrutura flexível do conteúdo
    content_text TEXT,  -- Versão texto para busca full-text
    variables_applied JSONB,  -- Variáveis aplicadas nesta versão
    entities_involved JSONB,  -- Entidades envolvidas
    created_by UUID NOT NULL REFERENCES stakeholders(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status processstatus DEFAULT 'rascunho',
    change_summary TEXT,  -- Resumo das mudanças
    previous_version_id UUID REFERENCES process_versions(id),
    UNIQUE(process_id, version_number)
);
```

**Índices**: 
- `process_id`
- `created_at`
- `(process_id, version_number)` (unique)

**Relacionamentos**:
- `process_id` → `processes.id`
- `created_by` → `stakeholders.id`
- `previous_version_id` → `process_versions.id` (self-referential)

### 4. Approval

Representa aprovação de processo por stakeholder.

**Tabela**: `approvals`

```sql
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id),
    version_id UUID NOT NULL REFERENCES process_versions(id),
    stakeholder_id UUID NOT NULL REFERENCES stakeholders(id),
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    comments TEXT,
    approval_type approvaltype DEFAULT 'aprovado',  -- Enum: aprovado, aprovado_com_ressalvas
    ressalvas TEXT,  -- Se aprovado_com_ressalvas
    UNIQUE(version_id, stakeholder_id)  -- Um stakeholder só pode aprovar uma vez por versão
);
```

**Índices**: 
- `process_id`
- `version_id`
- `stakeholder_id`
- `approved_at`

### 5. Rejection

Representa rejeição de processo por stakeholder.

**Tabela**: `rejections`

```sql
CREATE TABLE rejections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id),
    version_id UUID NOT NULL REFERENCES process_versions(id),
    stakeholder_id UUID NOT NULL REFERENCES stakeholders(id),
    rejected_at TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT NOT NULL,  -- Motivo obrigatório
    additional_comments TEXT,
    addressed_in_version_id UUID REFERENCES process_versions(id)  -- Versão que endereçou esta rejeição
);
```

**Índices**: 
- `process_id`
- `version_id`
- `stakeholder_id`
- `rejected_at`

### 6. Entity

Representa entidades envolvidas nos processos (pessoas, empresas, serviços).

**Tabela**: `entities`

```sql
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type entitytype NOT NULL,  -- Enum: pessoa, empresa, servico_emergencia, infraestrutura
    category entitycategory,  -- Enum: sindico, conselheiro, administradora, faxineiro, morador, portaria_online, seguranca, manutencao_elevador, jardinagem, dedetizacao, manutencao, gas, energia, outro_fornecedor, bombeiros, policia, samu, portao, elevador, sistema_biometria, sistema_cameras
    phone VARCHAR(255),
    email VARCHAR(255),
    contact_person VARCHAR(255),
    description TEXT,
    address TEXT,
    emergency_phone VARCHAR(255),
    meeting_point VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. ValidationResult

Resultados de validação de processos.

**Tabela**: `validation_results`

```sql
CREATE TABLE validation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID REFERENCES processes(id),
    is_valid BOOLEAN DEFAULT false,
    missing_entities JSONB,
    incomplete_entities JSONB,
    errors JSONB,
    validated_entities JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);
```

### 8. ChatConversation

Conversas do chat com Gabi (Síndica Virtual).

**Tabela**: `chat_conversations`

```sql
CREATE TABLE chat_conversations (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9. ChatMessage

Mensagens do chat.

**Tabela**: `chat_messages`

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id TEXT REFERENCES chat_conversations(id),
    user_id UUID REFERENCES auth.users(id),
    role TEXT CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10. Document

Documentos para base de conhecimento (futuro).

**Tabela**: `documents`

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    content TEXT,
    category TEXT,
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT DEFAULT 'text/markdown',
    embedding vector,  -- Para busca semântica
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Relacionamentos Principais

```
auth.users (1) ──< (1) stakeholders (auth_user_id)
stakeholders (1) ──< (N) processes (creator_id)
stakeholders (1) ──< (N) approvals
stakeholders (1) ──< (N) rejections
stakeholders (1) ──< (N) stakeholders (approved_by)

processes (1) ──< (N) process_versions
processes (1) ──< (N) approvals
processes (1) ──< (N) rejections
processes (1) ──< (N) validation_results

process_versions (1) ──< (N) approvals
process_versions (1) ──< (N) rejections
process_versions (1) ── (1) process_versions (previous_version_id)

auth.users (1) ──< (N) chat_conversations
chat_conversations (1) ──< (N) chat_messages
```

## Constraints e Validações

1. **ProcessVersion**: `version_number` deve ser sequencial e único por processo
2. **Approval**: Um stakeholder só pode aprovar uma vez por versão (UNIQUE constraint)
3. **Rejection**: Motivo (`reason`) é obrigatório (NOT NULL)
4. **Process**: Status deve seguir fluxo válido (rascunho → em_revisao → aprovado/rejeitado)
5. **Stakeholder**: `auth_user_id` é único (um usuário Auth = um stakeholder)
6. **ProcessVersion**: Versões são imutáveis após criação (apenas leitura)

## Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. Políticas básicas:

- **Leitura pública**: Processos podem ser visualizados por todos autenticados
- **Escrita**: Requer autenticação e permissões adequadas
- **Aprovação de usuários**: Apenas admin, syndic, subsindico
- **Chat**: Apenas usuários autenticados e aprovados

## Queries Otimizadas

### Busca de Processos Pendentes de Aprovação

```sql
SELECT p.* 
FROM processes p
JOIN process_versions pv ON p.id = pv.process_id AND pv.version_number = p.current_version_number
WHERE p.status = 'em_revisao'
  AND pv.status = 'em_revisao'
  AND NOT EXISTS (
    SELECT 1 FROM approvals a
    WHERE a.version_id = pv.id
      AND a.stakeholder_id = :stakeholder_id
  )
ORDER BY p.created_at DESC;
```

### Processos por Categoria

```sql
SELECT category, COUNT(*) as total, 
       COUNT(*) FILTER (WHERE status = 'aprovado') as aprovados,
       COUNT(*) FILTER (WHERE status = 'em_revisao') as em_revisao
FROM processes
GROUP BY category
ORDER BY category;
```

### Histórico Completo de Processo

```sql
SELECT 
  pv.version_number,
  pv.created_at,
  s.name as created_by_name,
  pv.status,
  COUNT(DISTINCT a.id) as total_approvals,
  COUNT(DISTINCT r.id) as total_rejections
FROM process_versions pv
JOIN processes p ON pv.process_id = p.id
JOIN stakeholders s ON pv.created_by = s.id
LEFT JOIN approvals a ON a.version_id = pv.id
LEFT JOIN rejections r ON r.version_id = pv.id
WHERE p.id = :process_id
GROUP BY pv.id, pv.version_number, pv.created_at, s.name, pv.status
ORDER BY pv.version_number DESC;
```

## Migrations

Migrations SQL aplicadas via Supabase:

1. `001_initial_migration.sql` - Tabelas principais
2. `002_add_entities_table.sql` - Tabela de entidades
3. `003_add_validation_results_table.sql` - Validações
4. `004_add_auth_to_stakeholders.sql` - Integração Auth e aprovação
5. `005_seed_processes.sql` - Função de seed
6. `006_fix_seed_function.sql` - Correção da função
7. `009_seed_batch_*.sql` - Seed dos 35 processos

## Considerações de Performance

1. **Índices**: Todos os FKs e campos frequentemente consultados indexados
2. **JSONB**: Usar JSONB para campos flexíveis (content, variables_applied, entities_involved)
3. **Paginação**: Sempre paginar listas grandes (LIMIT/OFFSET ou cursor-based)
4. **RLS**: Políticas otimizadas para evitar scans completos
5. **Full-text search**: GIN index em content_text para busca (futuro)

## Integração com Supabase Auth

- `auth.users`: Usuários autenticados via Supabase Auth
- `stakeholders.auth_user_id`: Vincula stakeholder ao usuário Auth
- RLS policies verificam autenticação via `auth.uid()`
- Sistema de aprovação customizado via campo `is_approved`
