# Research: Gabi - Síndica Virtual

**Feature**: `003-app-gestao-processos-aprovacao`  
**Date**: 2024-12-08  
**Updated**: 2025-01-09  
**Application Name**: Gabi - Síndica Virtual

## Decisões Técnicas

### 1. Stack Tecnológica

**Decisão**: Supabase como Backend-as-a-Service, Next.js 14/React para frontend

**Rationale**: 
- **Supabase**: Backend completo (PostgreSQL, Auth, Storage, Edge Functions) reduz complexidade de infraestrutura, permite foco no frontend, escalável, gratuito para começar
- **Next.js 14+**: App Router moderno, SSR/SSG, TypeScript nativo, excelente DX, deploy fácil na Vercel
- **React Query**: Gerenciamento de estado server-side, cache automático, sincronização
- **TanStack Table**: Tabelas avançadas com sorting, filtering, pagination
- **shadcn/ui**: Componentes acessíveis e customizáveis

**Alternativas Consideradas**:
- ❌ FastAPI + PostgreSQL: Mais controle mas requer mais infraestrutura e manutenção (não escolhido)
- ❌ Firebase: Similar ao Supabase mas menos focado em PostgreSQL e relacionamentos
- ❌ Django: Mais "baterias incluídas" mas mais pesado, menos flexível para API pura

### 2. Banco de Dados

**Decisão**: PostgreSQL 15+ via Supabase

**Rationale**:
- Suporte robusto a relacionamentos complexos (processos, versões, aprovações)
- JSONB para armazenar conteúdo flexível de processos
- Transações ACID garantem consistência em workflows de aprovação
- Full-text search nativo para busca de processos
- Histórico completo requer integridade referencial forte
- **Row Level Security (RLS)**: Segurança no nível do banco de dados
- **PostgREST**: API REST automática gerada do schema

**Alternativas Consideradas**:
- ❌ MongoDB: Mais flexível para documentos, mas relacionamentos complexos são mais difíceis
- ❌ SQLite: Simples mas não adequado para produção com múltiplos usuários simultâneos

### 3. Autenticação e Autorização

**Decisão**: Supabase Auth com sistema de aprovação customizado e RBAC via `app_metadata`

**Rationale**:
- **Supabase Auth**: Gerenciamento completo de usuários, email/password, OAuth opcional, sessões seguras
- **Sistema de Aprovação**: Campo `is_approved` em `app_metadata` para controle de acesso
- **RBAC**: Roles (admin, syndic, subsindico, council, staff, resident) armazenados em `app_metadata`
- **app_metadata**: Seguro, não pode ser modificado pelo usuário, ideal para roles e aprovação
- **Edge Functions**: Para atualizar `app_metadata` de forma segura via Admin API

**Implementação**:
- Roles e aprovação gerenciados via `app_metadata` no Supabase Auth
- Edge Function `update-user-metadata` para atualizações seguras
- Edge Function `create-user` para criação de usuários via Admin API
- Tabela `stakeholders` mantida para sincronização e dados adicionais

### 4. Versionamento de Processos

**Decisão**: Versões imutáveis com histórico completo

**Rationale**:
- Rastreabilidade completa requer histórico imutável
- Cada versão é uma snapshot completa do processo
- Permite comparação entre versões
- Facilita auditoria e compliance

**Implementação**:
- Tabela `process_versions` com relacionamento self-referential (`previous_version_id`)
- Campo `current_version_number` em `processes` aponta para versão atual
- Versões nunca são deletadas, apenas novas versões são criadas

### 5. Workflow de Aprovação

**Decisão**: Aprovação/rejeição com comentários obrigatórios para rejeição

**Rationale**:
- Feedback estruturado é essencial para melhoria contínua
- Motivos de rejeição permitem que criador corrija problemas
- Histórico completo de aprovações/rejeições para auditoria

**Implementação**:
- Tabelas `approvals` e `rejections` separadas
- Campo `reason` obrigatório em `rejections`
- Campo `addressed_in_version_id` em `rejections` para rastrear correções

### 6. Gestão de Usuários

**Decisão**: CRUD completo via interface administrativa com Edge Functions

**Rationale**:
- Administradores precisam criar usuários sem cadastro público
- Atualização de `app_metadata` requer Admin API (não disponível no cliente)
- Edge Functions garantem segurança e controle

**Implementação**:
- Edge Function `create-user` para criação via Admin API
- Edge Function `update-user-metadata` para atualização de roles e aprovação
- Interface administrativa com formulário completo (UserForm)
- Tabela de usuários com TanStack Table

### 7. Gestão de Entidades

**Decisão**: Tabela `entities` para pessoas, empresas, serviços e infraestrutura

**Rationale**:
- Entidades são referenciadas em processos
- Permite gestão centralizada de contatos e informações
- Facilita validação de processos

**Implementação**:
- Tabela `entities` com tipos e categorias
- Campo `cnpj` adicionado para empresas
- Entidade do condomínio incluída com informações completas
- Seed de 22 entidades comuns

### 8. Interface de Usuário

**Decisão**: shadcn/ui + Tailwind CSS

**Rationale**:
- Componentes acessíveis e customizáveis
- Design system consistente
- Fácil manutenção e extensão
- Suporte a dark mode

**Implementação**:
- Componentes shadcn/ui (Button, Card, Table, Dialog, Form, etc.)
- Tailwind CSS para estilização
- Design responsivo para mobile, tablet e desktop

## Migração de FastAPI para Supabase

**Decisão**: Migração completa de FastAPI para Supabase

**Rationale**:
- Redução de complexidade de infraestrutura
- Menos código para manter
- Deploy mais simples
- Melhor integração entre frontend e backend

**O que foi migrado**:
- ✅ Database: PostgreSQL (mantido, agora via Supabase)
- ✅ Auth: JWT customizado → Supabase Auth
- ✅ API: FastAPI endpoints → Supabase PostgREST + Edge Functions
- ✅ Storage: Local/Cloud → Supabase Storage (se necessário)

**O que foi removido**:
- ❌ Backend FastAPI (não mais necessário)
- ❌ API client customizado (substituído por Supabase client)
- ❌ Sistema de autenticação JWT customizado

## Performance e Escalabilidade

**Decisões**:
- React Query para cache e sincronização
- Otimização de queries com joins quando possível
- Paginação em listas grandes
- Lazy loading de componentes pesados

**Métricas Alvo**:
- API response time < 200ms (p95)
- Time to Interactive (TTI) < 3s
- Dashboard carrega em < 1s

## Segurança

**Decisões**:
- Row Level Security (RLS) no banco de dados
- Roles e aprovação em `app_metadata` (não modificável pelo usuário)
- Edge Functions para operações sensíveis
- Validação de permissões no frontend e backend

## Próximas Melhorias

- Notificações por email
- Testes automatizados
- Melhorias de performance
- Busca avançada de processos
- Exportação de relatórios
