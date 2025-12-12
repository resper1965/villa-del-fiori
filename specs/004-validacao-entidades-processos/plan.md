# Technical Plan: Validação de Entidades em Processos

**Feature**: 004-validacao-entidades-processos  
**Status**: Planning  
**Created**: 2024-12-08

## Overview

Sistema de validação que garante que todas as entidades mencionadas em processos existam no cadastro e tenham dados completos antes de permitir salvar processos.

## Architecture

### Backend

**Edge Functions:**
- `validate-entities` - Valida entidades de um processo ou em lote
- `integrity-metrics` - Retorna métricas de integridade

**Funções SQL:**
- `validate_process_entities()` - Valida lista de entidades
- `validate_process_entities_by_id()` - Valida entidades de um processo
- `validate_all_processes_entities()` - Validação em lote
- `get_entity_integrity_metrics()` - Métricas de integridade

### Frontend

**Novos Componentes:**
- `EntityValidation` - Validação em tempo real no formulário
- `ValidationReport` - Exibição de relatório de validação
- `IntegrityDashboard` - Dashboard de integridade
- `QuickEntityCreate` - Modal de criação rápida de entidade

**Novas Páginas:**
- `/validation` - Página de validação em lote
- `/validation/dashboard` - Dashboard de integridade

## Technology Stack

- **Backend**: Supabase Edge Functions (Deno/TypeScript)
- **Frontend**: Next.js 14, React, TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Cache**: Cache em memória (opcional)

## Implementation Phases

### Phase 1: Validação Básica (MVP)
- Validação ao criar/editar processo
- Verificação de existência de entidades
- Mensagens de erro claras
- Bloqueio de salvamento se inválido

### Phase 2: Validação em Lote
- Endpoint de validação em lote
- Relatório de inconsistências
- Interface para executar validação
- Exportação de relatório

### Phase 3: Criação Rápida e Dashboard
- Modal de criação rápida de entidade
- Dashboard de integridade
- Métricas e estatísticas
- Sugestões de correção

## Database Changes

**Nova Tabela (opcional):**
```sql
CREATE TABLE validation_cache (
    id UUID PRIMARY KEY,
    process_id UUID REFERENCES processes(id),
    validation_result JSONB,
    created_at TIMESTAMP,
    expires_at TIMESTAMP
);
```

**Índices:**
- Índice em `entities.name` para busca rápida
- Índice em `processes.entities` (array) para validação

## API Contracts

### POST /functions/v1/validate-entities

**Request:**
```json
{
  "entity_names": ["Síndico", "Moradores"]
}
```

ou

```json
{
  "process_id": "uuid"
}
```

ou

```json
{
  "batch": true
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "results": [...],
  "stats": {
    "total": 2,
    "valid": 2,
    "missing": 0,
    "incomplete": 0
  }
}
```

### GET /functions/v1/integrity-metrics

**Response:**
```json
{
  "success": true,
  "metrics": {
    "total_entities": 50,
    "complete_entities": 45,
    "incomplete_entities": 5,
    "total_processes": 35,
    "processes_with_valid_entities": 30,
    "processes_with_invalid_entities": 5,
    "orphaned_entities": 2
  }
}
```

## Testing Strategy

- Unit tests para lógica de validação
- Integration tests para endpoints
- E2E tests para fluxo completo
- Performance tests para validação em lote

## Performance Considerations

- Cache de validações por 1 hora
- Validação em lote processada em background
- Índices otimizados para busca de entidades
- Limite de 100 processos por validação em lote

