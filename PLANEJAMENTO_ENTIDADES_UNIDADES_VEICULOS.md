# Planejamento: Relacionamento entre Entidades, Unidades, Veículos e Usuários/Moradores

**Data**: 2025-01-15  
**Aplicação**: Villa Delfiori - Gestão Condominial  
**Versão**: 2.1

---

## 1. Visão Geral

**PRINCÍPIO FUNDAMENTAL**: **A UNIDADE É A ENTIDADE PRINCIPAL DO SISTEMA**

Tudo no sistema é vinculado à unidade (apartamento/casa):
- **Moradores** (stakeholders) pertencem a unidades
- **Veículos** pertencem a unidades
- **Cargos** (síndico, subsíndico, conselheiro) são qualificações de moradores vinculados a unidades

Este documento descreve a arquitetura de relacionamento:
- **Units** (Unidades/Apartamentos) - **ENTIDADE PRINCIPAL**
- **Stakeholders** (Moradores) - vinculados a unidades
- **Vehicles** (Veículos) - vinculados a unidades
- **Entities** (Entidades externas - empresas, serviços, infraestrutura) - NÃO inclui moradores/cargos

---

## 2. Estrutura Atual das Tabelas

### 2.1. Stakeholders (Proprietários e Moradores)

**Tabela**: `stakeholders`

**Conceito**: Stakeholders podem ser **PROPRIETÁRIOS** ou **MORADORES** vinculados a unidades. 
- **Proprietário**: Dono da unidade (pode ou não morar na unidade)
- **Morador**: Pessoa que reside na unidade (pode ser proprietário ou locatário)
- Cargos como síndico, subsíndico e conselheiro são **qualificações/cargos** do morador/proprietário

**Campos Principais**:
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE, NOT NULL) - **Chave de ligação com auth.users**
- `name` (VARCHAR, NOT NULL)
- `user_role` (ENUM) - **QUALIFICAÇÃO/CARGO**: `admin`, `syndic`, `subsindico`, `council`, `resident`, `staff`
- `unit_id` (UUID, FK → units.id, NOT NULL) - **OBRIGATÓRIO - Todo stakeholder pertence a uma unidade**
- `relationship_type` (ENUM) - **TIPO DE VÍNCULO**: `proprietario`, `morador`, `proprietario_morador`
- `is_owner` (BOOLEAN) - **É proprietário da unidade?** (default: false)
- `is_resident` (BOOLEAN) - **É morador da unidade?** (default: true)
- `owner_id` (UUID, FK → stakeholders.id, NULLABLE) - **Proprietário (se for locatário)**
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

**Relacionamentos**:
- `unit_id` → `units.id` (N:1 - obrigatório) - **Todo stakeholder pertence a uma unidade**
- `owner_id` → `stakeholders.id` (N:1 - opcional) - **Proprietário (se for locatário)**
- `email` → `auth.users.email` (1:1 - sincronização com Supabase Auth)

**Regras de Negócio**:
1. **`unit_id` é OBRIGATÓRIO** - Todo stakeholder deve estar vinculado a uma unidade
2. **Distinção Proprietário vs Morador**:
   - **Proprietário que mora**: `is_owner = true`, `is_resident = true`, `relationship_type = 'proprietario_morador'`
   - **Proprietário que não mora**: `is_owner = true`, `is_resident = false`, `relationship_type = 'proprietario'`, `owner_id = NULL`
   - **Locatário (morador)**: `is_owner = false`, `is_resident = true`, `relationship_type = 'morador'`, `owner_id = [ID do proprietário]`
3. **`user_role` é uma qualificação/cargo**:
   - `resident` - Morador comum
   - `syndic` - Síndico (pode ser proprietário ou morador)
   - `subsindico` - Subsíndico (pode ser proprietário ou morador)
   - `council` - Conselheiro (pode ser proprietário ou morador)
   - `admin` - Administrador do sistema (pode não ter unidade específica)
   - `staff` - Staff/Administradora (pode não ter unidade específica)
4. Múltiplos moradores podem estar associados à mesma unidade (ex: casal, família)
5. Uma unidade pode ter apenas um proprietário principal (mas pode ter múltiplos co-proprietários no futuro)
6. Um locatário sempre referencia o proprietário via `owner_id`
7. Um morador pode ter múltiplos cargos/qualificações ao longo do tempo (histórico futuro)

**Cenários de Uso**:
- **Cenário 1**: Proprietário que mora na unidade
  - `unit_id` = "Apto 101"
  - `is_owner` = true
  - `is_resident` = true
  - `relationship_type` = 'proprietario_morador'
  - `owner_id` = NULL

- **Cenário 2**: Proprietário que aluga (não mora)
  - `unit_id` = "Apto 101"
  - `is_owner` = true
  - `is_resident` = false
  - `relationship_type` = 'proprietario'
  - `owner_id` = NULL

- **Cenário 3**: Locatário (morador que não é proprietário)
  - `unit_id` = "Apto 101"
  - `is_owner` = false
  - `is_resident` = true
  - `relationship_type` = 'morador'
  - `owner_id` = [ID do proprietário do Apto 101]

---

### 2.2. Units (Unidades/Apartamentos) - **ENTIDADE PRINCIPAL**

**Tabela**: `units`

**Conceito**: A unidade é a **ENTIDADE PRINCIPAL** do sistema. Tudo é vinculado a ela:
- Moradores pertencem a unidades
- Veículos pertencem a unidades
- Cargos (síndico, subsíndico, conselheiro) são qualificações de moradores de unidades

**Campos Principais**:
- `id` (UUID, PK)
- `number` (VARCHAR, UNIQUE, NOT NULL) - Ex: "101", "Apto 201", "Casa 1"
- `block` (VARCHAR) - Bloco do condomínio
- `floor` (INTEGER) - Andar
- `area` (DECIMAL) - Área em m²
- `parking_spots` (INTEGER) - Número de vagas de garagem
- `description` (TEXT)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

**Relacionamentos**:
- `stakeholders` (1:N) - múltiplos moradores podem estar associados a uma unidade
- `vehicles` (1:N) - múltiplos veículos podem estar associados a uma unidade

**Regras de Negócio**:
1. **A unidade é a entidade central** - Tudo no sistema é vinculado a uma unidade
2. Cada unidade deve ter um número único
3. Uma unidade pode ter:
   - **Um ou mais proprietários** (pode ter co-proprietários)
   - **Múltiplos moradores** (ex: casal, família, locatários)
   - **Múltiplos veículos** (podem ser do proprietário ou dos moradores)
4. **Proprietário vs Morador**:
   - O proprietário pode ou não morar na unidade
   - Locatários são moradores que não são proprietários
   - Uma unidade pode ter múltiplos moradores (proprietário + locatários, ou apenas locatários)
5. Unidades podem ser desativadas (`is_active = false`) sem perder histórico
6. Moradores/proprietários com cargos (síndico, subsíndico, conselheiro) são stakeholders de unidades com qualificações especiais

---

### 2.3. Vehicles (Veículos)

**Tabela**: `vehicles`

**Campos Principais**:
- `id` (UUID, PK)
- `unit_id` (UUID, FK → units.id, NOT NULL) - **Obrigatório**
- `stakeholder_id` (UUID, FK → stakeholders.id, NULLABLE) - **Opcional**
- `brand` (VARCHAR, NOT NULL) - Marca (ex: Toyota, Honda)
- `model` (VARCHAR, NOT NULL) - Modelo (ex: Corolla, Civic)
- `license_plate` (VARCHAR, UNIQUE, NOT NULL) - Placa (normalizada: maiúsculas, sem espaços/hífens)
- `color` (VARCHAR)
- `year` (INTEGER)
- `vehicle_type` (VARCHAR) - carro, moto, caminhao, etc.
- `notes` (TEXT)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

**Relacionamentos**:
- `unit_id` → `units.id` (N:1 - obrigatório)
- `stakeholder_id` → `stakeholders.id` (N:1 - opcional)

**Regras de Negócio**:
1. **`unit_id` é obrigatório** - Todo veículo deve estar associado a uma unidade
2. **`stakeholder_id` é opcional** - Pode ser inferido da unidade ou especificado explicitamente
3. Placa deve ser única no sistema
4. Placa é normalizada automaticamente (maiúsculas, sem espaços/hífens)
5. Um veículo pode ter um proprietário específico (`stakeholder_id`) ou ser da unidade em geral
6. Múltiplos veículos podem estar associados à mesma unidade

**Cenários de Uso**:
- **Cenário 1**: Veículo de um morador específico (proprietário ou locatário)
  - `unit_id` = "Apto 101"
  - `stakeholder_id` = "João Silva" (proprietário ou morador do Apto 101)
  
- **Cenário 2**: Veículo de um proprietário que não mora
  - `unit_id` = "Apto 101"
  - `stakeholder_id` = "Maria Santos" (proprietária que não mora, aluga a unidade)
  
- **Cenário 3**: Veículo da unidade (sem proprietário específico)
  - `unit_id` = "Apto 101"
  - `stakeholder_id` = NULL (veículo da unidade, não de um morador específico)

---

### 2.4. Entities (Entidades Externas - Empresas, Serviços, Infraestrutura)

**Tabela**: `entities` (documentada, mas não implementada ainda)

**Conceito**: Entities representam **ENTIDADES EXTERNAS** ao condomínio:
- Empresas prestadoras de serviço
- Serviços de emergência
- Infraestrutura do condomínio
- **NÃO inclui moradores, síndicos, subsíndicos ou conselheiros** (esses são stakeholders/moradores)

**Campos Principais** (propostos):
- `id` (UUID, PK)
- `name` (VARCHAR, NOT NULL)
- `type` (ENUM) - `empresa`, `servico_emergencia`, `infraestrutura`
- `category` (ENUM) - **REMOVIDO**: sindico, conselheiro, morador (esses são stakeholders)
  - **MANTIDO**: administradora, faxineiro, portaria_online, seguranca, manutencao_elevador, jardinagem, dedetizacao, manutencao, gas, energia, outro_fornecedor, bombeiros, policia, samu, portao, elevador, sistema_biometria, sistema_cameras
- `phone` (VARCHAR)
- `email` (VARCHAR)
- `contact_person` (VARCHAR)
- `description` (TEXT)
- `address` (TEXT)
- `emergency_phone` (VARCHAR)
- `meeting_point` (VARCHAR)
- `cnpj` (VARCHAR) - CNPJ da entidade
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

**Relacionamentos** (propostos):
- Não há relacionamento direto com `stakeholders`, `units` ou `vehicles`
- Entities são referenciadas nos processos (`processes.entities_involved`)

**Regras de Negócio**:
1. **Entities NÃO incluem moradores/cargos**:
   - ❌ NÃO: sindico, conselheiro, morador, subsindico (esses são stakeholders/moradores)
   - ✅ SIM: empresas, serviços, infraestrutura
2. Entities representam empresas, serviços e infraestrutura envolvidos nos processos
3. Não são usuários do sistema (diferente de `stakeholders`)
4. Podem ser referenciadas em processos para documentação
5. Entities são externas ao condomínio (não pertencem a unidades)

---

## 3. Fluxo de Relacionamento

### 3.1. Hierarquia de Relacionamento (Árvore)

**ESTRUTURA HIERÁRQUICA**:

```
                    ┌─────────────────────┐
                    │   UNIDADE           │ (Entidade Principal)
                    │   (Apto 101)        │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
        ┌───────▼──────┐  ┌───▼──────┐  ┌───▼──────┐
        │ PROPRIETÁRIO │  │ MORADORES│  │ VEÍCULOS │
        │ (1)          │  │ (N)      │  │ (N)      │
        └──────────────┘  └──────────┘  └──────────┘
                │              │              │
                │              │              │
                │         ┌────┴────┐         │
                │         │         │         │
                │    ┌────▼───┐ ┌──▼────┐    │
                │    │Locatário│ │Família│    │
                │    │(N)      │ │(N)    │    │
                │    └─────────┘ └───────┘    │
                │                              │
                └──────────────────────────────┘
                           │
                    (pode ter stakeholder_id)
```

**REGRAS DA HIERARQUIA**:

1. **UNIDADE** (raiz)
   - Entidade principal do sistema
   - Tudo é vinculado a ela

2. **PROPRIETÁRIO** (filho direto da unidade)
   - Stakeholder com `is_owner = true`
   - Pode ou não morar na unidade (`is_resident`)
   - Uma unidade pode ter um ou mais proprietários (co-proprietários)

3. **MORADORES** (filhos diretos da unidade)
   - Stakeholders com `is_resident = true`
   - Podem ser:
     - **Proprietário que mora**: `is_owner = true`, `is_resident = true`
     - **Locatário**: `is_owner = false`, `is_resident = true`, `owner_id` preenchido
     - **Família/Dependentes**: `is_owner = false`, `is_resident = true`, `owner_id` pode ser NULL ou referenciar o responsável

4. **VEÍCULOS** (filhos diretos da unidade)
   - Sempre vinculados a uma unidade (`unit_id` obrigatório)
   - Podem ter `stakeholder_id` opcional (proprietário ou morador específico)
   - Podem ser do proprietário ou dos moradores

### 3.2. Fluxo de Cadastro

#### 3.2.1. Cadastro de Morador/Usuário

1. **Criar Unidade** (se não existir)
   - Número, bloco, andar, área, vagas de garagem
   
2. **Criar Stakeholder**
   - Nome, email, tipo, user_role
   - **Associar à unidade** (`unit_id` obrigatório para moradores)
   - Criar usuário no Supabase Auth (via Edge Function)
   - Sincronizar `app_metadata` com `user_role` e `is_approved`

3. **Cadastrar Veículos** (opcional)
   - Marca, modelo, placa
   - **Associar à unidade** (`unit_id` obrigatório)
   - **Associar ao stakeholder** (`stakeholder_id` opcional, mas recomendado)

#### 3.2.2. Cadastro de Veículo

1. **Selecionar Unidade** (obrigatório)
   - Buscar unidades ativas
   - Selecionar unidade do veículo

2. **Selecionar Stakeholder** (opcional)
   - Buscar stakeholders da unidade selecionada
   - Selecionar proprietário do veículo (ou deixar NULL)

3. **Preencher Dados do Veículo**
   - Marca, modelo, placa (normalizada automaticamente)
   - Cor, ano, tipo, observações

---

## 4. Regras de Validação e Integridade

### 4.1. Validações no Frontend

#### 4.1.1. Cadastro de Stakeholder

```typescript
// Validação de unit_id obrigatório
const requiresUnit = ['morador', 'sindico', 'subsindico', 'conselheiro', 'resident', 'syndic', 'subsindico', 'council'];

if (requiresUnit.includes(userType) && !unit_id) {
  throw new Error('Unidade é obrigatória para este tipo de usuário');
}
```

#### 4.1.2. Cadastro de Veículo

```typescript
// Validação de unit_id obrigatório
if (!unit_id) {
  throw new Error('Unidade é obrigatória para cadastro de veículo');
}

// Validação de placa (formato antigo ou Mercosul)
const plateRegex = /^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
if (!plateRegex.test(normalizeLicensePlate(license_plate))) {
  throw new Error('Placa inválida. Use formato antigo (ABC1234) ou Mercosul (ABC1D23)');
}
```

### 4.2. Validações no Banco de Dados

#### 4.2.1. Constraints SQL

```sql
-- Constraint: unit_id obrigatório para veículos
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_unit_id_not_null 
CHECK (unit_id IS NOT NULL);

-- Constraint: placa única
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_license_plate_unique 
UNIQUE (license_plate);

-- Constraint: número de unidade único
ALTER TABLE units 
ADD CONSTRAINT units_number_unique 
UNIQUE (number);

-- Constraint: email único em stakeholders
ALTER TABLE stakeholders 
ADD CONSTRAINT stakeholders_email_unique 
UNIQUE (email);
```

#### 4.2.2. Triggers

```sql
-- Trigger: Normalizar placa automaticamente
CREATE OR REPLACE FUNCTION normalize_vehicle_license_plate()
RETURNS TRIGGER AS $$
BEGIN
    NEW.license_plate = UPPER(REPLACE(REPLACE(NEW.license_plate, ' ', ''), '-', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_vehicle_plate_trigger
BEFORE INSERT OR UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION normalize_vehicle_license_plate();
```

---

## 5. Consultas e Relatórios

### 5.1. Consultas Comuns

#### 5.1.1. Listar Moradores de uma Unidade

```sql
SELECT 
    s.id,
    s.name,
    s.email,
    s.type,
    s.user_role,
    u.number as unit_number,
    u.block,
    u.floor
FROM stakeholders s
INNER JOIN units u ON s.unit_id = u.id
WHERE u.id = :unit_id
AND s.is_active = true
ORDER BY s.name;
```

#### 5.1.2. Listar Veículos de uma Unidade

```sql
SELECT 
    v.id,
    v.brand,
    v.model,
    v.license_plate,
    v.color,
    v.year,
    s.name as owner_name,
    u.number as unit_number
FROM vehicles v
INNER JOIN units u ON v.unit_id = u.id
LEFT JOIN stakeholders s ON v.stakeholder_id = s.id
WHERE u.id = :unit_id
AND v.is_active = true
ORDER BY v.license_plate;
```

#### 5.1.3. Listar Veículos de um Morador

```sql
SELECT 
    v.id,
    v.brand,
    v.model,
    v.license_plate,
    v.color,
    v.year,
    u.number as unit_number,
    u.block,
    u.floor
FROM vehicles v
INNER JOIN units u ON v.unit_id = u.id
WHERE v.stakeholder_id = :stakeholder_id
AND v.is_active = true
ORDER BY v.license_plate;
```

#### 5.1.4. Estatísticas por Unidade

```sql
SELECT 
    u.id,
    u.number,
    u.block,
    u.floor,
    COUNT(DISTINCT s.id) as total_residents,
    COUNT(DISTINCT v.id) as total_vehicles,
    u.parking_spots
FROM units u
LEFT JOIN stakeholders s ON s.unit_id = u.id AND s.is_active = true
LEFT JOIN vehicles v ON v.unit_id = u.id AND v.is_active = true
WHERE u.is_active = true
GROUP BY u.id, u.number, u.block, u.floor, u.parking_spots
ORDER BY u.number;
```

---

## 6. Interface do Usuário

### 6.1. Tela de Cadastro de Proprietário/Morador

**Campos**:
1. **Dados Pessoais**
   - Nome (obrigatório)
   - Email (obrigatório, único)
   - User Role (obrigatório) - qualificação/cargo

2. **Unidade** (obrigatório)
   - Select de unidades ativas
   - Opção de criar nova unidade (se admin/síndico)

3. **Tipo de Vínculo** (obrigatório)
   - **Opção 1**: Proprietário que mora
     - `is_owner` = true
     - `is_resident` = true
     - `relationship_type` = 'proprietario_morador'
   - **Opção 2**: Proprietário que não mora (aluga)
     - `is_owner` = true
     - `is_resident` = false
     - `relationship_type` = 'proprietario'
   - **Opção 3**: Locatário (morador que não é proprietário)
     - `is_owner` = false
     - `is_resident` = true
     - `relationship_type` = 'morador'
     - **Select de Proprietário** (obrigatório se for locatário)
       - Lista de proprietários da unidade selecionada
       - `owner_id` = ID do proprietário selecionado

4. **Aprovação** (apenas para admin/síndico)
   - Checkbox "Aprovado"
   - Data de aprovação (automática)

### 6.2. Tela de Cadastro de Veículo

**Campos**:
1. **Unidade** (obrigatório)
   - Select de unidades ativas
   - Filtro por bloco/andar (opcional)

2. **Proprietário** (opcional)
   - Select de stakeholders da unidade selecionada
   - Opção "Não especificado" (NULL)

3. **Dados do Veículo**
   - Marca (obrigatório)
   - Modelo (obrigatório)
   - Placa (obrigatório, único, validação de formato)
   - Cor (opcional)
   - Ano (opcional)
   - Tipo (opcional, default: "carro")
   - Observações (opcional)

### 6.3. Tela de Listagem de Unidades

**Colunas**:
- Número
- Bloco
- Andar
- Área (m²)
- Vagas de Garagem
- Moradores (contador)
- Veículos (contador)
- Status (Ativo/Inativo)
- Ações (Editar, Desativar, Ver Detalhes)

**Filtros**:
- Por bloco
- Por andar
- Por status (ativo/inativo)
- Busca por número

### 6.4. Tela de Detalhes da Unidade

**Seções**:
1. **Informações da Unidade**
   - Número, bloco, andar, área, vagas de garagem
   - Descrição
   - Status

2. **Moradores**
   - Lista de stakeholders associados
   - Botão "Adicionar Morador"

3. **Veículos**
   - Lista de veículos associados
   - Botão "Adicionar Veículo"

---

## 7. Permissões e Segurança (RLS)

### 7.1. Políticas RLS para Units

```sql
-- Visualização: Todos os usuários autenticados podem ver unidades ativas
CREATE POLICY "Usuários podem ver unidades ativas"
ON units FOR SELECT
TO authenticated
USING (is_active = true);

-- Criação/Edição: Apenas admin, síndico, subsíndico
CREATE POLICY "Apenas admin/síndico/subsíndico podem criar/editar unidades"
ON units FOR INSERT, UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
    )
  )
);
```

### 7.2. Políticas RLS para Vehicles

```sql
-- Visualização: Todos os usuários autenticados podem ver veículos ativos
CREATE POLICY "Usuários podem ver veículos ativos"
ON vehicles FOR SELECT
TO authenticated
USING (is_active = true);

-- Criação/Edição: Apenas admin, síndico, subsíndico
CREATE POLICY "Apenas admin/síndico/subsíndico podem criar/editar veículos"
ON vehicles FOR INSERT, UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
    )
  )
);
```

### 7.3. Políticas RLS para Stakeholders

```sql
-- Visualização: Usuários podem ver stakeholders ativos
-- Moradores podem ver apenas stakeholders de sua unidade
-- Admin/síndico podem ver todos

CREATE POLICY "Usuários podem ver stakeholders"
ON stakeholders FOR SELECT
TO authenticated
USING (
  is_active = true
  AND (
    -- Admin/síndico/subsíndico podem ver todos
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
    )
    OR
    -- Moradores podem ver stakeholders de sua unidade
    unit_id IN (
      SELECT unit_id FROM stakeholders
      WHERE email = (SELECT email FROM auth.users WHERE id = (select auth.uid()))
    )
  )
);
```

---

## 8. Melhorias Futuras

### 8.1. Relacionamento com Entities

**Proposta**: Criar tabela de relacionamento entre `entities` e `units`/`stakeholders`:

```sql
CREATE TABLE entity_unit_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id),
    unit_id UUID REFERENCES units(id),
    relationship_type VARCHAR(50), -- 'fornecedor', 'servico', 'manutencao'
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.2. Histórico de Moradores

**Proposta**: Criar tabela de histórico para rastrear mudanças de moradores em unidades:

```sql
CREATE TABLE unit_resident_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES units(id),
    stakeholder_id UUID REFERENCES stakeholders(id),
    moved_in_date DATE,
    moved_out_date DATE,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.3. Histórico de Veículos

**Proposta**: Criar tabela de histórico para rastrear mudanças de veículos:

```sql
CREATE TABLE vehicle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id),
    unit_id UUID REFERENCES units(id),
    stakeholder_id UUID REFERENCES stakeholders(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    change_type VARCHAR(50), -- 'created', 'updated', 'transferred', 'deactivated'
    notes TEXT
);
```

### 8.4. Relacionamento Múltiplos Moradores por Unidade

**Status**: Já suportado (múltiplos stakeholders podem ter o mesmo `unit_id`)

**Melhorias Implementadas**:
- ✅ Campo `relationship_type` (ENUM: 'proprietario', 'morador', 'proprietario_morador')
- ✅ Campo `is_owner` (BOOLEAN) - indica se é proprietário
- ✅ Campo `is_resident` (BOOLEAN) - indica se é morador
- ✅ Campo `owner_id` (UUID, FK) - referencia o proprietário (se for locatário)

**Melhorias Futuras**:
- Adicionar campo `is_primary_resident` (BOOLEAN) - morador principal da unidade
- Adicionar campo `relationship_to_owner` (ENUM: 'proprietario', 'conjuge', 'filho', 'dependente', 'locatario', 'outro')
- Suporte para co-proprietários (múltiplos proprietários da mesma unidade)

---

## 9. Checklist de Implementação

### 9.1. Banco de Dados

- [x] Tabela `units` criada
- [x] Tabela `vehicles` criada
- [x] Campo `unit_id` adicionado em `stakeholders`
- [x] Índices criados para performance
- [x] Triggers de normalização de placa
- [x] RLS policies implementadas
- [ ] Tabela `entities` criada (documentada, mas não implementada)
- [ ] Tabela de histórico de moradores (futuro)
- [ ] Tabela de histórico de veículos (futuro)

### 9.2. Backend/API

- [x] Edge Function `create-user` (cria stakeholder com unit_id)
- [x] Edge Function `update-user-metadata` (atualiza app_metadata)
- [x] Queries otimizadas para listar unidades
- [x] Queries otimizadas para listar veículos
- [x] Validações de `unit_id` obrigatório
- [x] Validações de placa única
- [ ] API para relacionar entities com units (futuro)

### 9.3. Frontend

- [x] Formulário de cadastro de unidades
- [x] Formulário de cadastro de veículos
- [x] Formulário de cadastro de stakeholders com seleção de unidade
- [x] Listagem de unidades com filtros
- [x] Listagem de veículos com filtros
- [x] Validação de `unit_id` obrigatório no frontend
- [x] Validação de formato de placa no frontend
- [ ] Formulário de cadastro com distinção proprietário/morador:
  - [ ] Campo `relationship_type` (radio buttons)
  - [ ] Campo `is_owner` (checkbox)
  - [ ] Campo `is_resident` (checkbox)
  - [ ] Select de proprietário (se for locatário)
  - [ ] Validações de consistência
- [ ] Listagem de stakeholders mostrando tipo de vínculo
- [ ] Tela de detalhes da unidade com seções separadas:
  - [ ] Proprietários
  - [ ] Moradores (incluindo locatários)
  - [ ] Veículos
- [ ] Tela de histórico de proprietários/moradores (futuro)
- [ ] Tela de histórico de veículos (futuro)

---

## 10. Conclusão

O sistema atual suporta:
- ✅ Relacionamento entre stakeholders e unidades (1:N)
- ✅ Relacionamento entre veículos e unidades (N:1, obrigatório)
- ✅ Relacionamento opcional entre veículos e stakeholders (N:1)
- ✅ Validações de integridade e regras de negócio
- ✅ RLS policies para segurança
- ✅ Interface de usuário para gerenciamento

**Próximos Passos**:
1. Implementar tabela `entities` e relacionamentos
2. Criar telas de detalhes e histórico
3. Adicionar relatórios e estatísticas avançadas
4. Implementar notificações para mudanças de moradores/veículos

---

**Documento criado em**: 2025-01-15  
**Última atualização**: 2025-01-15  
**Versão**: 2.1

---

## 11. Estrutura Hierárquica em Árvore

### 11.1. Visão Geral da Árvore

A estrutura do sistema segue uma hierarquia clara em árvore:

```
UNIDADE (Raiz)
├── PROPRIETÁRIO (1 ou mais)
├── MORADORES (N)
│   ├── Proprietário que mora
│   ├── Locatários
│   └── Família/Dependentes
└── VEÍCULOS (N)
    ├── Veículos do proprietário
    ├── Veículos dos moradores
    └── Veículos da unidade (sem proprietário específico)
```

### 11.2. Navegação na Árvore

**Nível 1 - Unidade**:
- Selecionar/Visualizar unidade
- Ver informações gerais (número, bloco, andar, área, vagas)

**Nível 2 - Filhos da Unidade**:
- **Proprietário**: Ver/Editar proprietário(s) da unidade
- **Moradores**: Listar todos os moradores (proprietários que moram + locatários + família)
- **Veículos**: Listar todos os veículos da unidade

**Nível 3 - Detalhes**:
- **Proprietário**: Ver histórico, documentos, contatos
- **Morador**: Ver tipo de vínculo, relação com proprietário, documentos
- **Veículo**: Ver detalhes, proprietário/morador responsável, histórico

### 11.3. Regras de Navegação

1. **Acesso à Unidade**:
   - Todos os usuários autenticados podem ver unidades ativas
   - Admin/síndico podem ver todas as unidades
   - Moradores podem ver apenas sua própria unidade

2. **Acesso aos Filhos**:
   - Proprietário pode ver/editar seus próprios dados e da unidade
   - Moradores podem ver dados da unidade e outros moradores da mesma unidade
   - Admin/síndico podem ver/editar tudo

3. **Criação de Filhos**:
   - Proprietário: Apenas admin/síndico podem criar/editar
   - Moradores: Apenas admin/síndico podem criar/editar
   - Veículos: Apenas admin/síndico podem criar/editar

### 11.4. Interface de Árvore (Proposta)

**Componente de Navegação em Árvore**:

```
📁 Unidade 101 - Bloco A - 1º Andar
  ├── 👤 Proprietário: João Silva
  │   └── 📧 joao@email.com
  ├── 👥 Moradores (3)
  │   ├── 👤 João Silva (Proprietário que mora)
  │   ├── 👤 Maria Santos (Locatária)
  │   └── 👤 Pedro Silva (Filho)
  └── 🚗 Veículos (2)
      ├── 🚗 ABC-1234 - Toyota Corolla (João Silva)
      └── 🚗 XYZ-5678 - Honda Civic (Maria Santos)
```

**Ações por Nível**:
- **Unidade**: Editar, Desativar, Ver Detalhes, Adicionar Proprietário, Adicionar Morador, Adicionar Veículo
- **Proprietário**: Editar, Ver Histórico, Ver Documentos
- **Morador**: Editar, Ver Vínculo, Ver Documentos
- **Veículo**: Editar, Transferir, Desativar

