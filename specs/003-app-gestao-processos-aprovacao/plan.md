# Implementation Plan: Gabi - Síndica Virtual

**Branch**: `003-app-gestao-processos-aprovacao` | **Date**: 2024-12-08 | **Updated**: 2025-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-app-gestao-processos-aprovacao/spec.md`

## Summary

**Gabi - Síndica Virtual** é uma aplicação web completa para gestão de processos condominiais com workflow de aprovação por stakeholders. Sistema permite que síndico, conselho e administradora revisem, aprovem ou rejeitem processos, com capacidade de refazer processos baseado em feedback estruturado. Inclui todos os processos pré-cadastrados organizados por categorias (Governança, Acesso e Segurança, Operação, Áreas Comuns, Convivência, Eventos, Emergências).

**Abordagem Técnica**: Aplicação web full-stack com Supabase como backend (PostgreSQL, Auth, Storage), frontend Next.js 14 com React, TypeScript, Tailwind CSS, shadcn/ui, React Query, TanStack Table, e interface responsiva moderna.

## Technical Context

**Language/Version**: TypeScript 5.3+ (frontend), Node.js 20+, Python 3.11+ (scripts)  
**Primary Dependencies**: 
- Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Frontend: Next.js 14.0.4, React 18.2, TypeScript 5.3, Tailwind CSS 3.3, shadcn/ui, @tanstack/react-query 5.12, @tanstack/react-table 8.21, @supabase/supabase-js 2.87
- Database: PostgreSQL 15+ (via Supabase)
- Infrastructure: Vercel (frontend), Supabase (backend)

**Storage**: Supabase PostgreSQL 15+ para dados relacionais (processos, versões, aprovações, stakeholders, histórico)  
**Authentication**: Supabase Auth com sistema de aprovação de usuários e RBAC  
**Testing**: 
- Frontend: Jest, React Testing Library, Playwright (E2E) - planejado
- Integration: Testes via Supabase MCP tools

**Target Platform**: Web (navegadores modernos: Chrome, Firefox, Safari, Edge - últimas 2 versões)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 
- API response time < 200ms (p95) para operações CRUD
- Time to Interactive (TTI) < 3s no frontend
- Suporte a 50+ stakeholders simultâneos
- Dashboard carrega em < 1s

**Constraints**: 
- Aplicação deve ser responsiva (mobile, tablet, desktop)
- Dados sensíveis requerem autenticação e autorização robusta
- Histórico completo deve ser mantido (sem soft delete de versões)
- Notificações devem ser entregues em < 5 minutos
- Suporte a português brasileiro (i18n)

**Scale/Scope**: 
- ~14 moradores + síndico + conselho + administradora = ~20 stakeholders
- ~100-200 processos pré-cadastrados
- Múltiplas versões por processo (média estimada: 2-3 versões)
- Histórico completo de todas as ações

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Como não há constituição definida ainda para este projeto, assumimos princípios básicos:
- Test-First: TDD será aplicado para funcionalidades críticas (workflow de aprovação)
- Simplicidade: Começar com arquitetura simples, adicionar complexidade apenas quando necessário
- Segurança: Autenticação e autorização são obrigatórias desde o início
- Rastreabilidade: Histórico completo é não-negociável (requisito de negócio)

## Project Structure

### Documentation (this feature)

```text
specs/003-app-gestao-processos-aprovacao/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── openapi.yaml     # API specification
│   └── schemas/         # JSON schemas
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/                       # Rotas de autenticação
│   │   │   ├── login/page.tsx            # Login com Supabase Auth
│   │   │   ├── register/page.tsx         # Cadastro público
│   │   │   └── waiting-approval/         # Aguardo de aprovação
│   │   ├── (dashboard)/                  # Rotas protegidas do dashboard
│   │   │   ├── layout.tsx                # Layout com sidebar e RBAC
│   │   │   ├── dashboard/page.tsx        # Dashboard principal
│   │   │   ├── processes/                # Gestão de processos
│   │   │   │   ├── page.tsx              # Lista de processos
│   │   │   │   └── [id]/page.tsx         # Detalhes e aprovação
│   │   │   ├── approvals/page.tsx        # Processos pendentes
│   │   │   ├── entities/page.tsx         # Gestão de entidades
│   │   │   ├── chat/page.tsx             # Chat com Gabi (Síndica Virtual)
│   │   │   └── admin/
│   │   │       └── users/
│   │   │           ├── page.tsx          # Gerenciamento de usuários
│   │   │           └── data-table.tsx    # Tabela com TanStack Table
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Home page
│   │   └── providers.tsx                 # React Query provider
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   │   ├── button.tsx, card.tsx, input.tsx
│   │   │   ├── table.tsx, checkbox.tsx   # Componentes de tabela
│   │   │   ├── popover.tsx, command.tsx  # Filtros avançados
│   │   │   ├── dropdown-menu.tsx         # Menus de ação
│   │   │   ├── avatar.tsx, badge.tsx     # Componentes visuais
│   │   │   └── ...
│   │   ├── auth/
│   │   │   └── Login.tsx                 # Componente de login
│   │   ├── processes/
│   │   │   ├── ProcessList.tsx
│   │   │   ├── ProcessCard.tsx
│   │   │   └── ProcessForm.tsx
│   │   └── approvals/
│   │       └── ApprovalActions.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   └── client.ts                 # Cliente Supabase
│   │   ├── api/
│   │   │   ├── processes-supabase.ts     # API de processos (Supabase)
│   │   │   ├── approvals-supabase.ts     # API de aprovações
│   │   │   └── client.ts                 # Cliente HTTP (legado)
│   │   ├── hooks/
│   │   │   ├── useProcesses.ts           # Hook para processos
│   │   │   ├── useApprovals.ts           # Hook para aprovações
│   │   │   └── useRBAC.ts                # Hook de RBAC
│   │   └── utils.ts                      # Utilitários
│   ├── contexts/
│   │   └── AuthContext.tsx               # Context de autenticação Supabase
│   └── styles/
│       └── globals.css
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
│
scripts/                                  # Scripts de migração e seed
├── migrations/                           # Migrations SQL para Supabase
│   ├── 001_initial_migration.sql
│   ├── 002_add_entities_table.sql
│   ├── 003_add_validation_results_table.sql
│   ├── 004_add_auth_to_stakeholders.sql
│   ├── 005_seed_processes.sql
│   └── ...
├── seed_processes_to_supabase.py        # Script de seed
└── parse_processes_simple.py            # Parser de processos
│
README.md
.gitignore
```

**Structure Decision**: Arquitetura baseada em Supabase escolhida porque:
- Backend-as-a-Service reduz complexidade de infraestrutura
- Supabase Auth integrado com sistema de aprovação customizado
- PostgreSQL nativo com RLS para segurança
- Frontend Next.js 14 com App Router para performance
- TanStack Table para tabelas avançadas de dados
- Estrutura modular facilita manutenção e escalabilidade

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Nenhuma violação identificada. Arquitetura segue princípios de simplicidade e separação de responsabilidades.
