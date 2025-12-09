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

```bash
# Via Supabase Dashboard SQL Editor ou MCP tools
# Aplicar migrations em ordem:
# - 001_initial_migration.sql
# - 002_add_entities_table.sql
# - 003_add_validation_results_table.sql
# - 004_add_auth_to_stakeholders.sql
# - 005_seed_processes.sql
# - ... (outras migrations)
```

### 4. Seed de Processos (Opcional)

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
# Editar .env.local:
# - NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
# - NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key

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

Como não há administrador ainda, você precisa aprovar manualmente:

```sql
-- Via Supabase SQL Editor
UPDATE stakeholders 
SET is_approved = true, 
    approved_at = NOW(),
    user_role = 'admin'
WHERE email = 'seu@email.com';
```

### 3. Login

1. Acesse http://localhost:3000/login
2. Use o email e senha cadastrados
3. Você será redirecionado para o dashboard

### 4. Gerenciar Usuários

1. Acesse "Usuários" no menu (apenas admin/síndico/subsíndico)
2. Veja lista de usuários pendentes de aprovação
3. Aprove ou rejeite usuários conforme necessário

### 5. Explorar Processos Pré-cadastrados

1. Acesse "Processos" no menu
2. Explore os 35 processos pré-cadastrados organizados por categoria
3. Visualize detalhes de um processo
4. Teste workflow de aprovação

### 6. Usar o Chat (Gabi - Síndica Virtual)

1. Acesse "Chat" no menu
2. Converse com a Gabi, Síndica Virtual
3. Faça perguntas sobre processos e procedimentos

## Estrutura de Desenvolvimento

### Backend (Supabase)

- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth com sistema de aprovação customizado
- **Storage**: Supabase Storage (se necessário)
- **Edge Functions**: Deno functions para lógica serverless
- **Migrations**: SQL migrations aplicadas via Supabase Dashboard ou MCP

### Frontend

```
frontend/
├── src/app/                 # Next.js App Router
├── components/              # Componentes React
├── lib/                     # Utilitários, hooks, API client
└── types/                   # TypeScript types
```

## Comandos Úteis

### Supabase

```bash
# Aplicar migration via MCP (se configurado)
# Ou via Supabase Dashboard SQL Editor

# Seed processos
cd scripts
python seed_processes_to_supabase.py
```

### Frontend

```bash
# Rodar testes
npm test

# Testes E2E
npm run test:e2e

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
2. Implementar backend (models, schemas, endpoints, services)
3. Implementar frontend (components, pages, hooks)
4. Escrever testes
5. Testar localmente
6. Criar PR

### 2. Workflow de Aprovação (Exemplo)

1. Criar processo em status "Rascunho"
2. Editar e salvar processo
3. Enviar para aprovação (status → "Em Revisão")
4. Stakeholders recebem notificação
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

1. Verificar se usuário está aprovado (`is_approved = true`)
2. Verificar se `auth_user_id` está vinculado corretamente
3. Verificar logs do Supabase Auth

### Erro de Permissões (RLS)

1. Verificar Row Level Security policies no Supabase
2. Verificar se usuário tem role correto
3. Verificar se `is_approved = true` no stakeholder

## Próximos Passos

1. Explorar os 35 processos pré-cadastrados
2. Criar primeiro processo de teste
3. Aprovar usuários cadastrados
4. Testar workflow completo de aprovação
5. Usar o chat com Gabi (Síndica Virtual)
6. Gerenciar usuários via interface administrativa

## Recursos Adicionais

- **Supabase Dashboard**: https://app.supabase.com
- **Database Admin**: Supabase SQL Editor ou ferramentas externas
- **Logs**: Supabase Dashboard → Logs
- **Documentação**: Ver arquivos em `/specs/003-app-gestao-processos-aprovacao/`


