# Data Model: Gabi - Síndica Virtual

**Feature**: `003-app-gestao-processos-aprovacao`  
**Date**: 2024-12-08  
**Updated**: 2025-01-15  
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
    is_approved BOOLEAN DEFAULT false,  -- Sistema de aprovação (legado, usar app_metadata)
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES stakeholders(id),
    approval_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Nota**: Roles e aprovação são gerenciados via `app_metadata` no Supabase Auth. A tabela `stakeholders` é mantida para sincronização e dados adicionais.

**Campos de Aprovação** (em `app_metadata` do Supabase Auth):
- `user_role`: Role do usuário (admin, syndic, subsindico, council, resident, staff)
- `is_approved`: Se o usuário foi aprovado para acessar o sistema
- `approved_at`: Data/hora da aprovação
- `approved_by`: ID do stakeholder que aprovou

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
- `unit_id` (foreign key)

**Relacionamentos**:
- `auth_user_id` → `auth.users.id`
- `unit_id` → `units.id` (opcional, obrigatório para moradores, síndicos, subsíndicos e conselheiros)
- `approved_by` → `stakeholders.id` (self-referential)

### 2. Unit

Representa unidades (apartamentos/casas) do condomínio. Cada morador, síndico, subsíndico e conselheiro deve estar associado a uma unidade.

**Tabela**: `units`

```sql
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(50) NOT NULL UNIQUE,  -- Número da unidade (ex: "101", "Apto 201", "Casa 1")
    block VARCHAR(50),  -- Bloco (se aplicável)
    floor INTEGER,  -- Andar (se aplicável)
    area DECIMAL(10, 2),  -- Área em m²
    parking_spots INTEGER DEFAULT 0,  -- Número de vagas de garagem
    description TEXT,  -- Descrição adicional
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices**: 
- `number` (unique)
- `block`
- `is_active`

**Relacionamentos**:
- `stakeholders` (1:N) - múltiplos stakeholders podem estar associados a uma unidade
- `vehicles` (1:N) - múltiplos veículos podem estar associados a uma unidade

### 3. Vehicle

Representa veículos cadastrados no condomínio, associados a unidades ou stakeholders.

**Tabela**: `vehicles`

```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,  -- Unidade associada
    stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE SET NULL,  -- Stakeholder proprietário (opcional)
    brand VARCHAR(100) NOT NULL,  -- Marca (ex: "Toyota", "Honda", "Fiat")
    model VARCHAR(100) NOT NULL,  -- Modelo (ex: "Corolla", "Civic", "Uno")
    license_plate VARCHAR(10) NOT NULL UNIQUE,  -- Placa (formato: ABC1234 ou ABC1D23)
    color VARCHAR(50),  -- Cor do veículo
    year INTEGER,  -- Ano de fabricação
    vehicle_type VARCHAR(50) DEFAULT 'carro',  -- Tipo: carro, moto, caminhao, van, outro
    notes TEXT,  -- Observações adicionais
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Garantir que tenha pelo menos unit_id ou stakeholder_id
    CONSTRAINT vehicles_owner_check CHECK (
        (unit_id IS NOT NULL) OR (stakeholder_id IS NOT NULL)
    )
);
```

**Índices**: 
- `unit_id`
- `stakeholder_id`
- `license_plate` (unique)
- `is_active`

**Relacionamentos**:
- `unit_id` → `units.id` (obrigatório)
- `stakeholder_id` → `stakeholders.id` (opcional, pode ser inferido da unidade)

**Notas**:
- Placa é normalizada automaticamente (maiúsculas, sem espaços/hífens)
- Suporta formatos antigo (ABC1234) e Mercosul (ABC1D23)
- Validação de placa única no sistema

### 4. Process

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

### 5. ProcessVersion

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

### 6. Approval

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

### 7. Rejection

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

### 8. Entity

Representa entidades envolvidas nos processos (pessoas, empresas, serviços, infraestrutura).

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
    cnpj VARCHAR(18),  -- CNPJ da entidade (formato: XX.XXX.XXX/XXXX-XX)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Nota**: Inclui entidade do condomínio com informações completas (CNPJ, endereço, descrição).

### 9. Chat Conversations

Representa conversas do chat com Gabi (Síndica Virtual).

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

### 10. Chat Messages

Representa mensagens do chat.

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

### 11. Documents (Base de Conhecimento)

Representa documentos para base de conhecimento (usado pelo chat).

**Tabela**: `documents`

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT DEFAULT 'text/markdown',
    embedding vector(1536),  -- Para busca semântica
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 12. Validation Results

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

## Views e Funções

### auth_users_with_metadata

View que combina dados de `auth.users` e `public.stakeholders` para facilitar consultas.

```sql
CREATE VIEW auth_users_with_metadata AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'name' as name,
    u.raw_user_meta_data->>'type' as type,
    u.raw_app_meta_data->>'user_role' as user_role,
    (u.raw_app_meta_data->>'is_approved')::boolean as is_approved,
    (u.raw_app_meta_data->>'approved_at')::timestamptz as approved_at,
    u.raw_app_meta_data->>'approved_by' as approved_by
FROM auth.users u;
```

## Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. Policies garantem que:

- Usuários só veem seus próprios dados quando apropriado
- Aprovações/rejeições só podem ser feitas por stakeholders autorizados
- Processos podem ser visualizados por usuários aprovados
- Entidades podem ser gerenciadas por administradores
- Unidades podem ser visualizadas por usuários aprovados
- Veículos podem ser visualizados por usuários aprovados, editados apenas por administradores

## Migrations

Migrations SQL estão em `supabase/migrations/` e são aplicadas via Supabase Dashboard ou MCP tools.

Principais migrations:
- `001_create_schema_completo.sql`: Schema inicial
- `002_rls_policies.sql`: Policies de segurança
- `003_sync_auth_users.sql`: Sincronização com Auth
- `005_seed_processes.sql`: Seed de processos
- `009_seed_entities.sql`: Seed de entidades
- `010_add_condominio_entity.sql`: Entidade do condomínio
- `011_add_cnpj_to_entities.sql`: Campo CNPJ
- `017_create_units_table.sql`: Tabela de unidades (apartamentos)
- `018_create_vehicles_table.sql`: Tabela de veículos
