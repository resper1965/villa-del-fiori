# 🚀 Migração Frontend para Supabase - Status

## ✅ Concluído

### 1. Instalação e Configuração
- ✅ Instalado `@supabase/supabase-js` no frontend
- ✅ Criado cliente Supabase em `frontend/src/lib/supabase/client.ts`
- ✅ Configurado com variáveis de ambiente (fallback para valores padrão)

### 2. API de Processos
- ✅ Criada nova API `frontend/src/lib/api/processes-supabase.ts`
- ✅ Implementadas todas as operações CRUD:
  - `list()` - Listar processos com filtros e paginação
  - `getById()` - Buscar processo por ID com versão atual
  - `create()` - Criar novo processo com versão inicial
  - `update()` - Atualizar processo (cria nova versão se necessário)
  - `delete()` - Deletar processo
- ✅ Mapeamento de categorias (banco ↔ frontend)
- ✅ Tratamento de versões baseado em `current_version_number`

### 3. Hooks e Componentes
- ✅ Atualizado `useProcesses` para usar nova API Supabase
- ✅ Atualizada página `/processes` para remover fallback de dados mock
- ✅ Removida dependência de `processesData` na listagem principal

### 4. Dados
- ✅ 35 processos já inseridos no banco via migrations
- ✅ Todos os processos têm versão inicial criada
- ✅ Stakeholder "Sistema" criado para processos seed

## ⚠️ Pendente

### 1. Outras Páginas que Ainda Usam Mock
- ⏳ `/dashboard` - Ainda usa `processesData` para estatísticas
- ⏳ `/approvals` - Ainda usa `processesData` como fallback
- ⏳ Página de detalhes do processo (se existir)

### 2. Autenticação
- ⏳ Migrar `AuthContext` para usar Supabase Auth
- ⏳ Atualizar login/logout para Supabase
- ⏳ Sincronizar stakeholders com auth.users

### 3. Variáveis de Ambiente
- ⏳ Criar `.env.local` no frontend (bloqueado por .gitignore)
- ⚠️ Valores padrão estão hardcoded no cliente (funciona, mas não é ideal)

### 4. Testes
- ⏳ Testar listagem de processos
- ⏳ Testar criação de processo
- ⏳ Testar atualização de processo
- ⏳ Testar filtros e busca
- ⏳ Verificar RLS policies (Row Level Security)

## 📝 Como Usar

### Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do frontend:

```env
NEXT_PUBLIC_SUPABASE_URL=https://obyrjbhomqtepebykavb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Executar Frontend

```bash
cd frontend
npm install
npm run dev
```

### Verificar Integração

1. Acesse `http://localhost:3000/processes`
2. Deve listar os 35 processos do banco
3. Filtros e busca devem funcionar
4. Criação de novos processos deve funcionar

## 🔧 Estrutura de Arquivos

```
frontend/
├── src/
│   ├── lib/
│   │   ├── supabase/
│   │   │   └── client.ts          # Cliente Supabase
│   │   ├── api/
│   │   │   ├── processes.ts       # API antiga (FastAPI)
│   │   │   └── processes-supabase.ts  # Nova API (Supabase) ⭐
│   │   └── hooks/
│   │       └── useProcesses.ts    # Atualizado para usar Supabase
│   └── app/
│       └── (dashboard)/
│           └── processes/
│               └── page.tsx       # Atualizado (sem fallback mock)
└── .env.local                     # Criar manualmente
```

## 🐛 Problemas Conhecidos

1. **RLS Policies**: As políticas de Row Level Security podem estar bloqueando queries anônimas. Verificar se as políticas permitem leitura pública ou se é necessário autenticação.

2. **Autenticação**: A autenticação ainda usa o backend FastAPI. Para usar Supabase completamente, é necessário migrar o AuthContext.

3. **Fallback Mock**: Algumas páginas ainda usam `processesData` como fallback. Isso pode causar inconsistências.

## 📊 Próximos Passos

1. **Atualizar Dashboard**: Usar API Supabase para estatísticas
2. **Atualizar Approvals**: Remover fallback mock
3. **Migrar Autenticação**: Implementar Supabase Auth
4. **Testar RLS**: Verificar e ajustar políticas de segurança
5. **Documentar**: Criar guia de uso completo

## 🔐 Segurança

- ⚠️ A chave anon está exposta no código (valores padrão)
- ✅ RLS está habilitado nas tabelas
- ⚠️ Verificar se as políticas RLS estão corretas para o uso público/anônimo

## 📚 Referências

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

