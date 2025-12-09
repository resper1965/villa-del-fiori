# Quickstart: Gabi - Síndica Virtual

**Feature**: `003-app-gestao-processos-aprovacao`  
**Date**: 2024-12-08  
**Updated**: 2025-01-09  
**Application Name**: Gabi - Síndica Virtual

## Pré-requisitos

- Node.js 20+
- Conta no Supabase (gratuita)
- Git
- Python 3.11+ (apenas para scripts de seed)

## Setup Rápido

### 1. Clone e Configure o Repositório

```bash
git clone <repository-url>
cd villadelfiori
```

### 2. Configurar Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote as credenciais:
   - Project URL
   - Anon Key (publishable)
   - Service Role Key (para migrations)

### 3. Aplicar Migrations no Supabase

Aplique as migrations SQL em ordem via Supabase Dashboard SQL Editor ou MCP tools:

```sql
-- Ordem de aplicação:
-- 001_create_schema_completo.sql
-- 002_rls_policies.sql
-- 003_sync_auth_users.sql
-- 005_seed_processes.sql
-- 006_fix_seed_function.sql
-- 007_seed_all_processes.sql
-- 008_seed_remaining_processes.sql
-- 009_seed_batch_*.sql (batches 1-6)
-- allow_public_read_processes.sql
-- add_user_approval_system.sql
-- add_subsindico_role.sql
-- create_sync_app_metadata_trigger.sql
-- create_auth_users_view.sql
-- 009_seed_entities.sql
-- 010_add_condominio_entity.sql
-- 011_add_cnpj_to_entities.sql
-- 012_add_condominio_entity_complete.sql
```

### 4. Seed de Processos (Opcional)

Os processos já foram seedados via migrations. Se precisar re-seed:

```bash
# Instalar dependências Python
pip install supabase

# Configurar variáveis de ambiente
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_SERVICE_KEY="sua-service-key"

# Executar seed
cd scripts
python seed_processes_to_supabase.py
```

### 5. Frontend Setup

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com:
# NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
# NEXT_PUBLIC_SUPERADMIN_UID=seu-uid (opcional, para superadmin)

# Iniciar servidor de desenvolvimento
npm run dev
```

Frontend estará disponível em: http://localhost:3000

## Primeiro Acesso

### 1. Cadastrar Primeiro Usuário Administrador

1. Acesse http://localhost:3000/register
2. Preencha o formulário:
   - Nome: "Administrador"
   - Email: seu@email.com
   - Senha: (escolha uma senha segura)
   - Tipo: Selecione "Administrador da Aplicação"
3. Clique em "Criar Conta"
4. Você será redirecionado para `/auth/waiting-approval`

### 2. Aprovar Primeiro Usuário (via Supabase)

Como não há administrador ainda, você precisa aprovar manualmente via SQL:

```sql
-- Via Supabase SQL Editor
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{user_role}',
    '"admin"'
  ),
  '{is_approved}',
  'true'
)
WHERE email = 'seu@email.com';
```

Ou use o script `scripts/approve_user.js`:

```bash
cd scripts
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_SERVICE_KEY="sua-service-key"
node approve_user.js
```

### 3. Login

1. Acesse http://localhost:3000/login
2. Use o email e senha cadastrados
3. Você será redirecionado para o dashboard

### 4. Gerenciar Usuários

1. Acesse "Usuários" no menu (apenas admin/síndico/subsíndico)
2. Veja lista de usuários pendentes de aprovação
3. Aprove ou rejeite usuários conforme necessário
4. Crie novos usuários se necessário (botão "Novo Usuário")

### 5. Explorar Processos Pré-cadastrados

1. Acesse "Processos" no menu
2. Explore os 35 processos pré-cadastrados organizados por categoria
3. Visualize detalhes de um processo
4. Teste workflow de aprovação/rejeição

### 6. Usar o Chat (Gabi - Síndica Virtual)

1. Acesse "Chat" no menu
2. Converse com a Gabi, Síndica Virtual
3. Faça perguntas sobre processos e procedimentos

### 7. Gerenciar Entidades

1. Acesse "Entidades" no menu
2. Veja lista de entidades (pessoas, empresas, serviços, infraestrutura)
3. Edite a entidade do condomínio com informações completas (CNPJ, endereço, etc.)
4. Crie novas entidades conforme necessário

## Estrutura de Desenvolvimento

### Backend (Supabase)

- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth com sistema de aprovação customizado
- **Storage**: Supabase Storage (se necessário)
- **Edge Functions**: Deno functions para lógica serverless
  - `update-user-metadata`: Atualiza app_metadata de usuários
  - `create-user`: Cria novos usuários via Admin API
- **Migrations**: SQL migrations aplicadas via Supabase Dashboard ou MCP

### Frontend

```
frontend/
├── src/app/                 # Next.js App Router
│   ├── (auth)/              # Rotas de autenticação
│   ├── (dashboard)/         # Rotas protegidas do dashboard
│   └── layout.tsx           # Root layout
├── components/              # Componentes React
│   ├── ui/                  # shadcn/ui components
│   ├── auth/                # Componentes de autenticação
│   ├── processes/           # Componentes de processos
│   ├── approvals/           # Componentes de aprovação
│   ├── entities/            # Componentes de entidades
│   └── users/               # Componentes de usuários
├── lib/                     # Utilitários, hooks, API client
│   ├── supabase/            # Cliente Supabase
│   ├── api/                 # APIs (Supabase)
│   ├── hooks/               # React hooks
│   └── utils.ts             # Utilitários
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Context de autenticação
└── types/                   # TypeScript types
```

## Comandos Úteis

### Supabase

```bash
# Aplicar migration via Supabase Dashboard SQL Editor
# Ou via MCP tools (se configurado)

# Seed processos (se necessário)
cd scripts
python seed_processes_to_supabase.py
```

### Frontend

```bash
cd frontend

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Lint
npm run lint

# Type check
npm run type-check
```

## Fluxo de Desenvolvimento

### 1. Criar Nova Feature

1. Criar branch: `git checkout -b feature/nome-da-feature`
2. Implementar backend (migrations SQL, Edge Functions se necessário)
3. Implementar frontend (components, pages, hooks)
4. Testar localmente
5. Criar PR

### 2. Workflow de Aprovação (Exemplo)

1. Criar processo em status "Rascunho"
2. Editar e salvar processo
3. Enviar para aprovação (status → "Em Revisão")
4. Stakeholders recebem notificação (futuro)
5. Stakeholder aprova ou rejeita
6. Se aprovado por todos → status "Aprovado"
7. Se rejeitado → status "Rejeitado", criador pode refazer

### 3. Testar Workflow Completo

1. **Criar Processo**: Acesse "Processos" → "Novo Processo"
2. **Preencher Dados**: Nome, categoria, tipo de documento, conteúdo
3. **Salvar**: Processo fica em status "Rascunho"
4. **Enviar para Aprovação**: Clique em "Enviar para Aprovação"
5. **Aprovar/Rejeitar**: Stakeholders podem aprovar ou rejeitar via interface
6. **Refazer (se rejeitado)**: Criador pode refazer baseado nos motivos

## Troubleshooting

### Erro de Conexão com Supabase

1. Verificar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env.local`
2. Verificar se o projeto Supabase está ativo
3. Verificar RLS policies no Supabase Dashboard

### Erro de Autenticação

1. Verificar se usuário está aprovado (`is_approved = true` no app_metadata)
2. Verificar se `auth_user_id` está vinculado corretamente
3. Verificar logs do Supabase Auth

### Erro de Permissões (RLS)

1. Verificar Row Level Security policies no Supabase
2. Verificar se usuário tem role correto
3. Verificar se `is_approved = true` no app_metadata

### Erro ao Criar Usuário

1. Verificar se Edge Function `create-user` está deployada
2. Verificar se `SUPABASE_SERVICE_ROLE_KEY` está configurada na Edge Function
3. Verificar logs da Edge Function no Supabase Dashboard

## Próximos Passos

1. Explorar os 35 processos pré-cadastrados
2. Criar primeiro processo de teste
3. Aprovar usuários cadastrados
4. Testar workflow completo de aprovação
5. Usar o chat com Gabi (Síndica Virtual)
6. Gerenciar usuários via interface administrativa
7. Editar entidade do condomínio com informações completas

## Recursos Adicionais

- **Supabase Dashboard**: https://app.supabase.com
- **Database Admin**: Supabase SQL Editor ou ferramentas externas
- **Logs**: Supabase Dashboard → Logs
- **Edge Functions**: Supabase Dashboard → Edge Functions
- **Documentação**: Ver arquivos em `/specs/003-app-gestao-processos-aprovacao/`
