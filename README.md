# Gabi - Síndica Virtual

Sistema de gestão documental e conhecimento sobre processos condominiais com workflow de aprovação e assistente virtual inteligente.

## 🚀 Visão Geral

**Gabi - Síndica Virtual** é uma plataforma web de **gestão documental e conhecimento** sobre processos condominiais. O sistema permite que stakeholders (síndico, conselho, administradora) documentem, revisem, aprovem e consultem processos operacionais, administrativos e de convivência do condomínio.

### Propósito

O sistema é uma plataforma de **documentação e conhecimento**, não uma plataforma de **operação condominial**. Ele documenta processos, gerencia aprovações, mantém base de conhecimento e responde perguntas via chat assistente inteligente.

**O sistema NUNCA**:
- ❌ Integrará com sistemas de segurança física (biometria, câmeras)
- ❌ Integrará com portaria online operacionalmente
- ❌ Operará sistemas físicos do condomínio

## ✨ Funcionalidades Principais

- ✅ **35 Processos Pré-cadastrados** organizados por categoria
- ✅ **Workflow de Aprovação** completo (aprovar/rejeitar com comentários)
- ✅ **Sistema de Aprovação de Usuários** com RBAC
- ✅ **Gestão de Unidades** (apartamentos/casas do condomínio)
- ✅ **Gestão de Veículos** (cadastro de veículos com marca, modelo e placa)
- ✅ **Gestão de Entidades** (pessoas, empresas, serviços, infraestrutura)
- ✅ **Documentos Gerais** (regulamentos, convenções, atas, assembleias)
- ✅ **Base de Conhecimento** com busca semântica
- ✅ **Chat com Gabi** (Síndica Virtual) - assistente inteligente com RAG
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
├── docs/             # Documentação do sistema
└── README.md
```

## 📦 Setup Local

### Pré-requisitos

- Node.js 20+
- Conta no Supabase (gratuita)
- Git

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

Aplique as migrations SQL em ordem via Supabase Dashboard SQL Editor:

- `001_create_schema_completo.sql`
- `002_rls_policies.sql`
- `003_sync_auth_users.sql`
- `005_seed_processes.sql`
- `009_seed_entities.sql`
- `017_create_units_table.sql`
- `018_create_vehicles_table.sql`
- `019_rls_policies_units_vehicles.sql`
- ... (outras migrations)

### 4. Frontend Setup

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

1. **Cadastro Público**: Qualquer pessoa pode se cadastrar
2. **Aprovação**: Administradores, síndicos e subsíndicos aprovam novos usuários
3. **RBAC**: Controle de acesso baseado em roles:
   - `admin`: Administrador da aplicação
   - `syndic`: Síndico
   - `subsindico`: Subsíndico
   - `council`: Conselheiro
   - `staff`: Staff/Administradora
   - `resident`: Morador (apenas acesso ao chat)

## 🚀 Deploy

### Frontend (Vercel)

O frontend está configurado para deploy automático na Vercel. Configure as variáveis de ambiente:

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anon do Supabase
- `NEXT_PUBLIC_SUPERADMIN_UID`: UID do superadministrador (opcional)

### Backend (Supabase)

- Database: PostgreSQL via Supabase
- Auth: Supabase Auth
- Storage: Supabase Storage
- Edge Functions: Deno functions

## 📖 Primeiro Acesso

### 1. Cadastrar Primeiro Usuário Administrador

1. Acesse `/register`
2. Preencha o formulário com tipo "Administrador da Aplicação"
3. Você será redirecionado para `/auth/waiting-approval`

### 2. Aprovar Primeiro Usuário (via Supabase)

Como não há administrador ainda, você precisa aprovar manualmente via Supabase SQL Editor:

```sql
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{user_role,is_approved}',
  '["admin", true]'::jsonb
)
WHERE email = 'seu@email.com';
```

### 3. Login e Configuração Inicial

1. Acesse `/login` e faça login
2. Você será redirecionado para `/setup` para cadastrar o condomínio (obrigatório)
3. Após cadastrar o condomínio, acesse o dashboard

## 📚 Documentação

Consulte a [documentação completa](docs/README.md) para informações detalhadas sobre:

- Funcionalidades do sistema
- Base de conhecimento
- Documentos gerais
- Workflow de aprovação
- Configurações e operação

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

## 📝 Licença

Este projeto é privado e proprietário.
