# Planejamento Completo de Cadastros - Sistema de Gestão Condominial

## 1. Visão Geral da Estrutura

### 1.1 Hierarquia Principal

```
CONDOMÍNIO (Raiz)
├── UNIDADES (N)
│   ├── PROPRIETÁRIO (1 ou mais)
│   │   └── MORADORES (N)
│   │       └── CARGOS (se aplicável: síndico, subsíndico, conselheiro)
│   ├── VEÍCULOS (N)
│   ├── FUNCIONÁRIOS (N) - Porteiros, zeladores, etc.
│   └── PETS (N)
├── FORNECEDORES (N)
│   ├── Administradora
│   ├── Portaria Virtual
│   ├── Elevadores
│   ├── Geradores
│   └── Outros serviços
└── ENTIDADES (N)
    ├── Bombeiros
    ├── Polícia
    ├── SAMU
    └── Outros serviços públicos/emergência
```

## 2. Modelo de Dados

### 2.1 Tabela: `condominiums`

```sql
CREATE TABLE condominiums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    address_street VARCHAR(255),
    address_number VARCHAR(50),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zipcode VARCHAR(10),
    total_units INTEGER,
    total_floors INTEGER,
    total_blocks INTEGER,
    has_elevator BOOLEAN DEFAULT false,
    has_pool BOOLEAN DEFAULT false,
    has_gym BOOLEAN DEFAULT false,
    has_party_room BOOLEAN DEFAULT false,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos de Qualificação:**
- Nome do condomínio
- CNPJ (se houver)
- Endereço completo
- Características físicas (andares, blocos, unidades)
- Comodidades (elevador, piscina, academia, salão de festas)

### 2.2 Tabela: `units` (Atualizada)

```sql
-- Já existe, mas precisa de relacionamento com condominium
ALTER TABLE units 
ADD COLUMN IF NOT EXISTS condominium_id UUID REFERENCES condominiums(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_units_condominium_id ON units(condominium_id);
```

### 2.3 Tabela: `stakeholders` (Atualizada)

**Já existe com:**
- `relationship_type` (proprietario, morador, proprietario_morador)
- `is_owner`, `is_resident`
- `owner_id`
- `unit_id`

**Adicionar:**
```sql
-- Cargo no condomínio (se aplicável)
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS condominium_role VARCHAR(50); -- 'syndic', 'subsindico', 'council', NULL

-- Funcionário (se for funcionário do condomínio)
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS is_employee BOOLEAN DEFAULT false;
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS employee_role VARCHAR(100); -- 'porteiro', 'zelador', 'faxineiro', etc.
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS employee_unit_id UUID REFERENCES units(id) ON DELETE SET NULL; -- Unidade onde trabalha

-- Campos de Contato (IMPORTANTE)
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS phone VARCHAR(20); -- Telefone celular principal
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS phone_secondary VARCHAR(20); -- Telefone secundário/fixo
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20); -- WhatsApp (pode ser igual ao phone)
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS has_whatsapp BOOLEAN DEFAULT false; -- Indica se o telefone tem WhatsApp
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS address_street VARCHAR(255); -- Endereço (se diferente da unidade)
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS address_number VARCHAR(50);
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS address_complement VARCHAR(100);
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS address_neighborhood VARCHAR(100);
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS address_city VARCHAR(100);
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS address_state VARCHAR(2);
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS address_zipcode VARCHAR(10);
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255); -- Nome do contato de emergência
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20); -- Telefone do contato de emergência
ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100); -- Relação (pai, mãe, cônjuge, etc.)

-- Índices para busca
CREATE INDEX IF NOT EXISTS idx_stakeholders_phone ON stakeholders(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stakeholders_whatsapp ON stakeholders(whatsapp) WHERE whatsapp IS NOT NULL;
```

### 2.4 Tabela: `pets`

```sql
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    species VARCHAR(50) NOT NULL, -- 'cachorro', 'gato', 'ave', 'outro'
    breed VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(20), -- 'pequeno', 'medio', 'grande'
    weight DECIMAL(5, 2),
    birth_date DATE,
    microchip_number VARCHAR(50),
    vaccination_status VARCHAR(50), -- 'em_dia', 'atrasado', 'nao_aplicavel'
    last_vaccination_date DATE,
    notes TEXT,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES stakeholders(id) ON DELETE SET NULL, -- Proprietário do pet
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pets_unit_id ON pets(unit_id);
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
```

### 2.5 Tabela: `suppliers` (Fornecedores)

```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    cpf VARCHAR(14), -- Se for pessoa física
    email VARCHAR(255),
    phone VARCHAR(20),
    address_street VARCHAR(255),
    address_number VARCHAR(50),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zipcode VARCHAR(10),
    supplier_type VARCHAR(50) NOT NULL, -- 'administradora', 'portaria_virtual', 'elevador', 'gerador', 'limpeza', 'seguranca', 'outro'
    category VARCHAR(50), -- 'servico', 'manutencao', 'administracao'
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contract_start_date DATE,
    contract_end_date DATE,
    monthly_value DECIMAL(10, 2),
    payment_day INTEGER, -- Dia do mês para pagamento
    notes TEXT,
    condominium_id UUID REFERENCES condominiums(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_condominium_id ON suppliers(condominium_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
```

### 2.6 Tabela: `entities` (Atualizada)

**Já existe, mas precisa de ajustes:**

```sql
-- Remover relacionamento com unidades (entidades são externas)
-- Manter apenas relacionamento com condomínio se necessário
ALTER TABLE entities
ADD COLUMN IF NOT EXISTS condominium_id UUID REFERENCES condominiums(id) ON DELETE SET NULL;

-- Garantir que entities não tenha unit_id
ALTER TABLE entities
DROP COLUMN IF EXISTS unit_id;

-- Tipos de entidades:
-- 'emergency' (bombeiros, polícia, SAMU)
-- 'public_service' (prefeitura, correios, etc.)
-- 'utility' (água, luz, gás, telefone)
-- 'other'
```

## 3. Estrutura de Telas

### 3.1 Tela: Cadastro de Condomínio

**Rota:** `/admin/condominiums/new` ou `/admin/condominiums/[id]/edit`

**Campos:**
- **Informações Básicas:**
  - Nome do Condomínio *
  - CNPJ
  - Email
  - Telefone

- **Endereço:**
  - Rua *
  - Número *
  - Complemento
  - Bairro *
  - Cidade *
  - Estado *
  - CEP *

- **Características:**
  - Total de Unidades
  - Total de Andares
  - Total de Blocos
  - Possui Elevador (checkbox)
  - Possui Piscina (checkbox)
  - Possui Academia (checkbox)
  - Possui Salão de Festas (checkbox)

- **Descrição:**
  - Campo de texto livre

### 3.2 Tela: Cadastro de Unidade com Subentidades

**Rota:** `/units/new` ou `/units/[id]/edit`

**Estrutura da Tela:**

```
┌─────────────────────────────────────────────────────────┐
│  Cadastro de Unidade                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Informações da Unidade]                              │
│  - Número *                                            │
│  - Bloco                                               │
│  - Andar                                               │
│  - Área (m²)                                           │
│  - Vagas de Garagem                                    │
│  - Descrição                                           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Proprietário]                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │ + Adicionar Proprietário                        │  │
│  │                                                 │  │
│  │ [Lista de Proprietários]                       │  │
│  │ - João Silva (joao@email.com) [Editar] [X]    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Moradores]                                           │
│  ┌─────────────────────────────────────────────────┐  │
│  │ + Adicionar Morador                             │  │
│  │                                                 │  │
│  │ [Lista de Moradores]                            │  │
│  │ - Maria Silva (maria@email.com)                │  │
│  │   Cargo: Síndico [Editar] [X]                  │  │
│  │ - Pedro Silva (pedro@email.com)                │  │
│  │   [Editar] [X]                                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Veículos]                                            │
│  ┌─────────────────────────────────────────────────┐  │
│  │ + Adicionar Veículo                             │  │
│  │                                                 │  │
│  │ [Lista de Veículos]                             │  │
│  │ - Honda Civic - ABC-1234 [Editar] [X]          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Funcionários]                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │ + Adicionar Funcionário                         │  │
│  │                                                 │  │
│  │ [Lista de Funcionários]                         │  │
│  │ - José Porteiro (porteiro@email.com)           │  │
│  │   Função: Porteiro [Editar] [X]                │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Pets]                                                │
│  ┌─────────────────────────────────────────────────┐  │
│  │ + Adicionar Pet                                 │  │
│  │                                                 │  │
│  │ [Lista de Pets]                                 │  │
│  │ - Rex (Cachorro - Labrador) [Editar] [X]       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [Salvar] [Cancelar]                                   │
└─────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Criar/editar unidade
- Adicionar múltiplos proprietários
- Adicionar múltiplos moradores (com cargo opcional)
- Adicionar múltiplos veículos
- Adicionar múltiplos funcionários
- Adicionar múltiplos pets
- Tudo em uma única tela com abas ou seções expansíveis

### 3.3 Tela: Cadastro de Fornecedores

**Rota:** `/admin/suppliers/new` ou `/admin/suppliers/[id]/edit`

**Campos:**
- **Informações Básicas:**
  - Nome/Razão Social *
  - Tipo de Fornecedor * (select: Administradora, Portaria Virtual, Elevador, Gerador, Limpeza, Segurança, Outro)
  - Categoria (select: Serviço, Manutenção, Administração)
  - CNPJ ou CPF

- **Contato:**
  - Email
  - Telefone
  - Pessoa de Contato
  - Telefone de Contato

- **Endereço:**
  - Rua
  - Número
  - Complemento
  - Bairro
  - Cidade
  - Estado
  - CEP

- **Contrato:**
  - Data Início
  - Data Término
  - Valor Mensal
  - Dia de Pagamento

- **Condomínio:**
  - Selecionar condomínio *

- **Observações:**
  - Campo de texto livre

### 3.4 Tela: Cadastro de Entidades

**Rota:** `/admin/entities/new` ou `/admin/entities/[id]/edit`

**Campos:**
- **Informações Básicas:**
  - Nome *
  - Tipo * (select: Emergência, Serviço Público, Utilidade, Outro)
  - Categoria (select baseado no tipo)
  - Email
  - Telefone
  - Endereço

- **Condomínio:**
  - Selecionar condomínio (opcional - pode ser geral)

- **Observações:**
  - Campo de texto livre

## 4. Componentes Reutilizáveis

### 4.1 `UnitFormWithSubentities`

Componente principal que gerencia:
- Formulário da unidade
- Lista de proprietários (com modal de adicionar/editar)
- Lista de moradores (com modal de adicionar/editar e campo de cargo)
- Lista de veículos (com modal de adicionar/editar)
- Lista de funcionários (com modal de adicionar/editar)
- Lista de pets (com modal de adicionar/editar)

### 4.2 `StakeholderForm` (Atualizado)

Adicionar campos:
- `is_employee` (checkbox)
- `employee_role` (select: porteiro, zelador, faxineiro, etc.)
- `employee_unit_id` (select de unidades - onde trabalha)
- `condominium_role` (select: síndico, subsíndico, conselheiro, nenhum)

### 4.3 `PetForm`

Novo componente com campos:
- Nome *
- Espécie * (select: Cachorro, Gato, Ave, Outro)
- Raça
- Cor
- Porte (select: Pequeno, Médio, Grande)
- Peso
- Data de Nascimento
- Número do Microchip
- Status de Vacinação
- Data da Última Vacinação
- Unidade * (pré-selecionada)
- Proprietário (select de stakeholders da unidade)
- Observações

### 4.4 `SupplierForm`

Novo componente com todos os campos de fornecedor.

### 4.5 `CondominiumForm`

Novo componente com todos os campos de condomínio.

## 5. Fluxo de Cadastro

### 5.1 Fluxo Principal

1. **Cadastrar Condomínio** (primeiro passo)
   - Criar condomínio com todas as informações
   - Definir características físicas

2. **Cadastrar Unidades**
   - Selecionar condomínio
   - Criar unidade
   - Adicionar subentidades na mesma tela:
     - Proprietário(s)
     - Morador(es) com cargo (se aplicável)
     - Veículo(s)
     - Funcionário(s) (se trabalhar na unidade)
     - Pet(s)

3. **Cadastrar Fornecedores**
   - Associar ao condomínio
   - Preencher informações de contrato

4. **Cadastrar Entidades**
   - Entidades externas (bombeiros, polícia, etc.)
   - Podem ser gerais ou associadas a condomínio específico

### 5.2 Validações

**Unidade:**
- Número deve ser único no condomínio
- Deve ter pelo menos 1 proprietário
- Moradores devem ter unidade associada
- Veículos devem ter unidade associada
- Pets devem ter unidade e proprietário associados

**Stakeholder:**
- Se `is_employee = true`, deve ter `employee_role`
- Se `condominium_role` preenchido, deve ser morador ou proprietário
- Locatário deve ter `owner_id`

**Pet:**
- Deve ter unidade e proprietário
- Microchip deve ser único (se preenchido)

**Fornecedor:**
- CNPJ ou CPF deve ser único
- Deve ter condomínio associado

## 6. Queries e Relacionamentos

### 6.1 Buscar Unidade Completa

```sql
SELECT 
    u.*,
    c.name as condominium_name,
    -- Proprietários
    (SELECT json_agg(
        json_build_object(
            'id', s.id,
            'name', s.name,
            'email', s.email,
            'relationship_type', s.relationship_type
        )
    ) FROM stakeholders s 
    WHERE s.unit_id = u.id AND s.is_owner = true) as owners,
    -- Moradores
    (SELECT json_agg(
        json_build_object(
            'id', s.id,
            'name', s.name,
            'email', s.email,
            'relationship_type', s.relationship_type,
            'condominium_role', s.condominium_role,
            'owner', (SELECT json_build_object('id', o.id, 'name', o.name) 
                     FROM stakeholders o WHERE o.id = s.owner_id)
        )
    ) FROM stakeholders s 
    WHERE s.unit_id = u.id AND s.is_resident = true) as residents,
    -- Veículos
    (SELECT json_agg(
        json_build_object(
            'id', v.id,
            'brand', v.brand,
            'model', v.model,
            'license_plate', v.license_plate
        )
    ) FROM vehicles v 
    WHERE v.unit_id = u.id AND v.is_active = true) as vehicles,
    -- Funcionários
    (SELECT json_agg(
        json_build_object(
            'id', s.id,
            'name', s.name,
            'email', s.email,
            'employee_role', s.employee_role
        )
    ) FROM stakeholders s 
    WHERE s.employee_unit_id = u.id AND s.is_employee = true) as employees,
    -- Pets
    (SELECT json_agg(
        json_build_object(
            'id', p.id,
            'name', p.name,
            'species', p.species,
            'breed', p.breed
        )
    ) FROM pets p 
    WHERE p.unit_id = u.id AND p.is_active = true) as pets
FROM units u
LEFT JOIN condominiums c ON c.id = u.condominium_id
WHERE u.id = $1;
```

## 7. RLS Policies

### 7.1 Condominiums

```sql
-- Todos podem ver condomínios ativos
CREATE POLICY "Usuários podem ver condomínios ativos"
ON condominiums FOR SELECT
TO authenticated
USING (is_active = true);

-- Apenas admin pode criar/editar/deletar
CREATE POLICY "Apenas admin pode gerenciar condomínios"
ON condominiums FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (
            (auth.users.raw_app_meta_data->>'user_role')::text = 'admin'
            OR auth.users.id::text = current_setting('app.superadmin_uid', true)
        )
    )
);
```

### 7.2 Pets

```sql
-- Usuários podem ver pets de suas unidades
CREATE POLICY "Usuários podem ver pets de suas unidades"
ON pets FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM stakeholders s
        WHERE s.auth_user_id = auth.uid()
        AND s.unit_id = pets.unit_id
    )
    OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (
            (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
            OR auth.users.id::text = current_setting('app.superadmin_uid', true)
        )
    )
);

-- Admin, síndico, subsíndico podem criar/editar pets
CREATE POLICY "Admin/síndico/subsíndico podem gerenciar pets"
ON pets FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (
            (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
            OR auth.users.id::text = current_setting('app.superadmin_uid', true)
        )
    )
);
```

### 7.3 Suppliers

```sql
-- Usuários podem ver fornecedores do condomínio
CREATE POLICY "Usuários podem ver fornecedores"
ON suppliers FOR SELECT
TO authenticated
USING (is_active = true);

-- Apenas admin, síndico, subsíndico podem gerenciar
CREATE POLICY "Admin/síndico/subsíndico podem gerenciar fornecedores"
ON suppliers FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (
            (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
            OR auth.users.id::text = current_setting('app.superadmin_uid', true)
        )
    )
);
```

## 8. Implementação - Ordem de Prioridade

### Fase 1: Estrutura Base
1. ✅ Criar tabela `condominiums`
2. ✅ Adicionar `condominium_id` em `units`
3. ✅ Criar tabela `pets`
4. ✅ Criar tabela `suppliers`
5. ✅ Atualizar tabela `entities`
6. ✅ Atualizar `stakeholders` com campos de funcionário e cargo

### Fase 2: Formulários Base
1. ✅ Criar `CondominiumForm`
2. ✅ Criar `PetForm`
3. ✅ Criar `SupplierForm`
4. ✅ Atualizar `StakeholderForm` com novos campos

### Fase 3: Tela Unificada de Unidade
1. ✅ Criar `UnitFormWithSubentities`
2. ✅ Implementar seções expansíveis/abas
3. ✅ Implementar modais de adicionar/editar subentidades
4. ✅ Implementar validações cruzadas

### Fase 4: Telas de Listagem
1. ✅ Lista de Condomínios
2. ✅ Lista de Fornecedores
3. ✅ Lista de Pets (na tela de unidade)
4. ✅ Atualizar lista de Entidades

### Fase 5: RLS e Segurança
1. ✅ Implementar RLS policies
2. ✅ Testar permissões
3. ✅ Validar acesso por condomínio

## 9. Considerações de UX

### 9.1 Tela de Unidade com Subentidades

**Abordagem 1: Seções Expansíveis (Recomendada)**
- Cada seção (Proprietário, Moradores, Veículos, etc.) é um card expansível
- Botão "+ Adicionar" dentro de cada seção
- Lista de itens dentro da seção
- Permite ver tudo de uma vez ou focar em uma seção

**Abordagem 2: Abas**
- Aba "Unidade" (dados básicos)
- Aba "Proprietários"
- Aba "Moradores"
- Aba "Veículos"
- Aba "Funcionários"
- Aba "Pets"
- Mais organizado, mas requer navegação entre abas

**Recomendação:** Seções expansíveis com estado de "expandido" salvo localmente.

### 9.2 Modais de Adicionar/Editar

- Modal reutilizável para cada tipo de subentidade
- Validação em tempo real
- Feedback visual de sucesso/erro
- Fechar modal e atualizar lista automaticamente

### 9.3 Validações Visuais

- Indicar campos obrigatórios com *
- Mostrar erros inline
- Desabilitar botão "Salvar" se houver erros
- Mostrar contadores (ex: "3 moradores", "2 veículos")

## 10. Migrations Necessárias

### Migration 023: Criar tabela condominiums
### Migration 024: Adicionar condominium_id em units
### Migration 025: Criar tabela pets
### Migration 026: Criar tabela suppliers
### Migration 027: Atualizar stakeholders (funcionário e cargo)
### Migration 028: Atualizar entities (remover unit_id, adicionar condominium_id)
### Migration 029: RLS policies para novas tabelas

## 11. Próximos Passos

1. Revisar e aprovar este planejamento
2. Criar migrations na ordem da Fase 1
3. Implementar formulários base (Fase 2)
4. Desenvolver tela unificada (Fase 3)
5. Implementar listagens (Fase 4)
6. Configurar segurança (Fase 5)
7. Testes e ajustes finais

