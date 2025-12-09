# Gabi - Síndica Virtual

Sistema de gestão de processos condominiais com workflow de aprovação e assistente virtual inteligente.

## Estrutura do Projeto

```
villadelfiori/
├── backend/          # API FastAPI
├── frontend/         # Next.js App (deploy na Vercel)
├── specs/            # Especificações e documentação
└── docker-compose.yml
```

## Deploy

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

### Backend (Supabase)

- Database: PostgreSQL via Supabase
- Auth: Supabase Auth
- Storage: Supabase Storage (se necessário)
- Edge Functions: Deno functions (se necessário)

## Autenticação

O sistema usa **Supabase Auth** com sistema de aprovação de usuários:

1. **Cadastro Público**: Qualquer pessoa pode se cadastrar em `/register`
2. **Aprovação**: Administradores, síndicos e subsíndicos aprovam novos usuários
3. **RBAC**: Controle de acesso baseado em roles (admin, syndic, subsindico, council, staff, resident)
4. **Moradores**: Apenas acesso ao chat (Gabi - Síndica Virtual)

## Setup Local

### Supabase Setup

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Aplique as migrations SQL (em `scripts/migrations/`)
4. Configure variáveis de ambiente no frontend

### Seed de Processos (Opcional)

```bash
cd scripts
pip install supabase
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_SERVICE_KEY="sua-service-key"
python seed_processes_to_supabase.py
```

### Frontend

```bash
cd frontend
npm install

# Configurar .env.local
cp .env.example .env.local
# Editar .env.local com:
# NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key

# Rodar servidor
npm run dev
```

## Acesso

- **Frontend Local**: http://localhost:3000
- **Frontend Vercel**: https://villa-del-fiori.vercel.app (após deploy)
- **Supabase Dashboard**: https://app.supabase.com

## Primeiro Acesso

1. **Cadastre-se**: Acesse `/register` e crie sua conta
2. **Aprovação**: Um administrador precisa aprovar seu cadastro
3. **Login**: Após aprovação, faça login em `/login`
4. **Dashboard**: Acesse o dashboard ou chat (dependendo do seu role)

## Funcionalidades

- ✅ **35 Processos Pré-cadastrados** organizados por categoria
- ✅ **Workflow de Aprovação** completo
- ✅ **Sistema de Aprovação de Usuários** com RBAC
- ✅ **Chat com Gabi** (Síndica Virtual) - assistente inteligente
- ✅ **Tabela de Usuários** avançada com TanStack Table
- ✅ **Interface Moderna** com shadcn/ui
- ✅ **Autenticação Segura** com Supabase Auth
