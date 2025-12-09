# Gabi - Síndica Virtual

Sistema de gestão de processos condominiais com workflow de aprovação e assistente virtual inteligente.

## 🚀 Visão Geral

**Gabi - Síndica Virtual** é uma aplicação web completa para gestão de processos condominiais. O sistema permite que stakeholders (síndico, conselho, administradora) revisem, aprovem ou rejeitem processos, com capacidade de refazer processos baseado em feedback estruturado.

### Funcionalidades Principais

- ✅ **35 Processos Pré-cadastrados** organizados por categoria
- ✅ **Workflow de Aprovação** completo (aprovar/rejeitar com comentários)
- ✅ **Sistema de Aprovação de Usuários** com RBAC
- ✅ **CRUD Completo de Usuários** (criar, editar, aprovar, deletar)
- ✅ **Gestão de Entidades** (pessoas, empresas, serviços, infraestrutura)
- ✅ **Chat com Gabi** (Síndica Virtual) - assistente inteligente
- ✅ **Autenticação Segura** com Supabase Auth
- ✅ **Interface Moderna** e responsiva

## 🏗️ Arquitetura

### Stack Tecnológica

- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **Tables**: TanStack Table (@tanstack/react-table)
- **Deploy**: Vercel (frontend), Supabase (backend)

### Estrutura do Projeto

```
villadelfiori/
├── frontend/         # Next.js App (deploy na Vercel)
├── supabase/         # SQL migrations
├── scripts/          # Scripts de seed e migração
├── specs/            # Especificações e documentação
└── README.md
```

## 📦 Setup Local

### Pré-requisitos

- Node.js 20+
- Conta no Supabase (gratuita)
- Git
- Python 3.11+ (apenas para scripts de seed)

### 1. Clone o Repositório

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

- `001_create_schema_completo.sql`
- `002_rls_policies.sql`
- `003_sync_auth_users.sql`
- `005_seed_processes.sql`
- `009_seed_entities.sql`
- ... (outras migrations)

### 4. Seed de Processos (Opcional)

```bash
cd scripts
pip install supabase
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_SERVICE_KEY="sua-service-key"
python seed_processes_to_supabase.py
```

### 5. Frontend Setup

```bash
cd frontend
npm install

# Configurar .env.local
cp .env.example .env.local
# Editar .env.local com:
# NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
# NEXT_PUBLIC_SUPERADMIN_UID=seu-uid (opcional)

# Rodar servidor
npm run dev
```

Frontend estará disponível em: http://localhost:3000

## 🔐 Autenticação

O sistema usa **Supabase Auth** com sistema de aprovação de usuários:

1. **Cadastro Público**: Qualquer pessoa pode se cadastrar em `/register`
2. **Aprovação**: Administradores, síndicos e subsíndicos aprovam novos usuários
3. **RBAC**: Controle de acesso baseado em roles:
   - `admin`: Administrador da aplicação
   - `syndic`: Síndico
   - `subsindico`: Subsíndico
   - `council`: Conselheiro
   - `staff`: Staff/Administradora
   - `resident`: Morador (apenas acesso ao chat)
4. **Superadministrador**: UID configurado via `NEXT_PUBLIC_SUPERADMIN_UID` tem acesso total

## 🚀 Deploy

### Frontend (Vercel)

O frontend está configurado para deploy automático na Vercel:

1. **Root Directory**: `frontend`
2. **Framework**: Next.js (detectado automaticamente)
3. **Build Command**: `npm run build` (automático)
4. **Output Directory**: `.next` (automático)

### Variáveis de Ambiente na Vercel

Configure no painel da Vercel (Settings → Environment Variables):

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anon do Supabase
- `NEXT_PUBLIC_SUPERADMIN_UID`: UID do superadministrador (opcional)

### Backend (Supabase)

- Database: PostgreSQL via Supabase
- Auth: Supabase Auth
- Storage: Supabase Storage (se necessário)
- Edge Functions: Deno functions (update-user-metadata, create-user)

## 📖 Primeiro Acesso

### 1. Cadastrar Primeiro Usuário Administrador

1. Acesse `/register`
2. Preencha o formulário:
   - Nome: "Administrador"
   - Email: seu@email.com
   - Senha: (escolha uma senha segura)
   - Tipo: Selecione "Administrador da Aplicação"
3. Clique em "Criar Conta"
4. Você será redirecionado para `/auth/waiting-approval`

### 2. Aprovar Primeiro Usuário (via Supabase)

Como não há administrador ainda, você precisa aprovar manualmente:

```sql
-- Via Supabase SQL Editor
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{user_role,is_approved}',
  '["admin", true]'::jsonb
)
WHERE email = 'seu@email.com';
```

Ou use o script `scripts/approve_user.js`:

```bash
cd scripts
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sua-service-key"
node approve_user.js
```

### 3. Login

1. Acesse `/login`
2. Use o email e senha cadastrados
3. Você será redirecionado para o dashboard

### 4. Gerenciar Usuários

1. Acesse "Usuários" no menu (apenas admin/síndico/subsíndico)
2. Veja lista de usuários pendentes de aprovação
3. Aprove ou rejeite usuários conforme necessário
4. Crie novos usuários se necessário

### 5. Explorar Processos Pré-cadastrados

1. Acesse "Processos" no menu
2. Explore os 35 processos pré-cadastrados organizados por categoria
3. Visualize detalhes de um processo
4. Teste workflow de aprovação

### 6. Usar o Chat (Gabi - Síndica Virtual)

1. Acesse "Chat" no menu
2. Converse com a Gabi, Síndica Virtual
3. Faça perguntas sobre processos e procedimentos

## 📚 Documentação

Documentação completa disponível em `/specs/003-app-gestao-processos-aprovacao/`:

- `spec.md`: Especificação completa da feature
- `plan.md`: Plano de implementação
- `data-model.md`: Modelo de dados do banco
- `quickstart.md`: Guia de início rápido
- `research.md`: Decisões técnicas e pesquisa

## 🛠️ Comandos Úteis

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

### Supabase

```bash
# Aplicar migrations via Supabase Dashboard SQL Editor
# Ou via MCP tools (se configurado)

# Seed processos
cd scripts
python seed_processes_to_supabase.py
```

## 🐛 Troubleshooting

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

## 📝 Licença

Este projeto é privado e proprietário.

## 👥 Contribuindo

Este é um projeto privado. Para contribuições, entre em contato com os administradores.
