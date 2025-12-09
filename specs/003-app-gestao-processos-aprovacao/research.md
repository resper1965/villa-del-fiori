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
- FastAPI + PostgreSQL: Mais controle mas requer mais infraestrutura e manutenção
- Firebase: Similar ao Supabase mas menos focado em PostgreSQL e relacionamentos
- Django: Mais "baterias incluídas" mas mais pesado, menos flexível para API pura

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
- MongoDB: Mais flexível para documentos, mas relacionamentos complexos são mais difíceis
- SQLite: Simples mas não adequado para produção com múltiplos usuários simultâneos

### 3. Autenticação e Autorização

**Decisão**: Supabase Auth com sistema de aprovação customizado e RBAC

**Rationale**:
- **Supabase Auth**: Gerenciamento completo de usuários, email/password, OAuth opcional, sessões seguras
- **Sistema de Aprovação**: Campo `is_approved` em stakeholders para controle de acesso
- **RBAC**: Roles (admin, syndic, subsindico, council, staff, resident) para controle granular
- **RLS Policies**: Segurança no nível do banco de dados baseada em roles
- Integração nativa com Supabase, sem necessidade de gerenciar tokens manualmente

**Alternativas Consideradas**:
- JWT manual: Mais controle mas mais complexidade, Supabase já oferece isso
- Session-based: Requer estado no servidor, menos escalável
- OAuth2 puro: Overhead desnecessário, Supabase Auth já suporta OAuth quando necessário

### 4. Versionamento de Processos

**Decisão**: Versionamento completo com histórico imutável

**Rationale**:
- Cada versão é uma entidade separada no banco
- Versões anteriores nunca são deletadas (auditoria)
- Comparação entre versões é facilitada
- Rastreabilidade completa é requisito de negócio

**Alternativas Consideradas**:
- Soft delete: Mais simples mas não garante imutabilidade
- Git-like versionamento: Complexidade desnecessária para este caso

### 5. Notificações

**Decisão**: Email como canal principal, notificações in-app como secundário

**Rationale**:
- Email é universal e confiável
- Stakeholders podem não estar sempre logados
- Notificações in-app complementam mas não substituem email
- Biblioteca: aiosmtplib (async) ou SendGrid/Mailgun para produção

**Alternativas Consideradas**:
- Apenas in-app: Stakeholders podem perder notificações se não estiverem logados
- SMS: Custo adicional, email é suficiente

### 6. Interface de Usuário

**Decisão**: shadcn/ui + Tailwind CSS

**Rationale**:
- Componentes acessíveis e customizáveis
- Tailwind CSS oferece desenvolvimento rápido
- Design system consistente
- Componentes podem ser copiados e modificados (não é biblioteca)

**Alternativas Consideradas**:
- Material-UI: Mais pesado, menos flexível
- Chakra UI: Boa alternativa, mas shadcn/ui tem melhor integração com Next.js

### 7. Gerenciamento de Estado

**Decisão**: React Query (TanStack Query) para server state, Zustand para client state

**Rationale**:
- React Query gerencia cache, sincronização, loading states automaticamente
- Zustand é leve e simples para estado local (filtros, UI state)
- Redux seria overkill para este projeto

**Alternativas Consideradas**:
- Redux: Complexidade desnecessária
- Context API: Performance issues com muitos re-renders

### 8. Testes

**Decisão**: pytest (backend), Jest + React Testing Library (frontend), Playwright (E2E)

**Rationale**:
- pytest é padrão da indústria para Python, excelente para async
- React Testing Library foca em testes de comportamento, não implementação
- Playwright oferece testes E2E robustos cross-browser

**Alternativas Consideradas**:
- unittest: Menos features que pytest
- Cypress: Boa alternativa, mas Playwright tem melhor suporte a múltiplos browsers

## Padrões e Boas Práticas

### Backend

1. **API Design**: RESTful com versionamento (v1)
2. **Validação**: Pydantic schemas para request/response validation
3. **Error Handling**: HTTP status codes apropriados, mensagens de erro estruturadas
4. **Database**: SQLAlchemy ORM com Alembic para migrations
5. **Async**: FastAPI async/await para operações I/O bound

### Frontend

1. **Componentes**: Functional components com hooks
2. **Type Safety**: TypeScript estrito, tipos compartilhados com backend quando possível
3. **Formulários**: React Hook Form + Zod para validação
4. **Roteamento**: Next.js App Router (file-based routing)
5. **Estilização**: Tailwind CSS utility-first

### Segurança

1. **Autenticação**: JWT com expiração curta (15min) + refresh tokens
2. **Autorização**: Role-based (RBAC) - Aprovador, Visualizador, Editor
3. **Validação**: Input validation em backend e frontend
4. **HTTPS**: Obrigatório em produção
5. **CORS**: Configurado adequadamente para domínio do frontend

## Dependências Principais

### Backend
- fastapi==0.104.1
- sqlalchemy==2.0.23
- alembic==1.12.1
- pydantic==2.5.0
- python-jose[cryptography]==3.3.0
- passlib[bcrypt]==1.7.4
- python-multipart==0.0.6
- aiosmtplib==3.0.1
- pytest==7.4.3
- pytest-asyncio==0.21.1
- httpx==0.25.2

### Frontend
- next==14.0.4
- react==18.2.0
- typescript==5.3.2
- tailwindcss==3.3.6
- @tanstack/react-query==5.12.2
- zod==3.22.4
- react-hook-form==7.48.2
- zustand==4.4.7
- @radix-ui/react-* (via shadcn/ui)
- jest==29.7.0
- @testing-library/react==14.1.2
- playwright==1.40.1

## Considerações de Performance

1. **Database Indexing**: Índices em campos frequentemente consultados (status, categoria, stakeholder_id)
2. **Caching**: React Query cache automático, considerar Redis para cache de sessão se necessário
3. **Pagination**: Listas de processos paginadas (20-50 itens por página)
4. **Lazy Loading**: Componentes pesados carregados sob demanda
5. **Image Optimization**: Next.js Image component para otimização automática

## Considerações de Escalabilidade

1. **Horizontal Scaling**: Backend stateless permite múltiplas instâncias
2. **Database**: PostgreSQL pode escalar verticalmente inicialmente, horizontal se necessário
3. **File Storage**: Considerar S3/Cloud Storage para anexos de processos no futuro
4. **Background Jobs**: Considerar Celery para tarefas assíncronas (envio de emails em lote)

## Riscos e Mitigações

1. **Risco**: Complexidade do workflow de aprovação
   - **Mitigação**: Implementar testes extensivos, documentar fluxos claramente

2. **Risco**: Performance com muitos processos/versões
   - **Mitigação**: Paginação, índices adequados, queries otimizadas

3. **Risco**: Notificações não entregues
   - **Mitigação**: Retry logic, logging, fallback para notificações in-app

4. **Risco**: Conflitos de versão ao refazer processo
   - **Mitigação**: Lock otimista, validação de versão antes de salvar

## Próximos Passos

1. Definir modelo de dados detalhado (data-model.md)
2. Criar contratos de API (OpenAPI)
3. Configurar ambiente de desenvolvimento
4. Implementar autenticação básica
5. Criar seed de processos pré-cadastrados


