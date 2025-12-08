# Technical Plan: Validação de Entidades em Processos

**Feature**: 004-validacao-entidades-processos  
**Status**: Planning  
**Created**: 2024-12-08

## Overview

Sistema de validação que garante que todas as entidades mencionadas em processos existam no cadastro e tenham dados completos antes de permitir salvar processos.

## Architecture

### Backend

**Novos Endpoints:**
- `POST /api/v1/processes/validate` - Valida entidades de um processo
- `POST /api/v1/processes/validate-batch` - Validação em lote
- `GET /api/v1/validation/dashboard` - Dashboard de integridade
- `GET /api/v1/validation/missing-entities` - Lista entidades faltantes

**Services:**
- `EntityValidationService` - Lógica de validação de entidades
- `ProcessValidationService` - Validação de processos
- `ValidationCacheService` - Cache de validações

**Models:**
- `ValidationResult` - Resultado de validação
- `ValidationReport` - Relatório de validação em lote
- `IntegrityMetrics` - Métricas de integridade

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

- **Backend**: FastAPI (Python)
- **Frontend**: Next.js 14, React, TypeScript
- **Database**: PostgreSQL (já existe)
- **Cache**: Redis (opcional) ou cache em memória

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

### POST /api/v1/processes/validate

**Request:**
```json
{
  "process_id": "uuid",
  "entities": ["Síndico", "Moradores"]
}
```

**Response:**
```json
{
  "valid": true,
  "missing_entities": [],
  "incomplete_entities": [],
  "errors": []
}
```

### GET /api/v1/validation/dashboard

**Response:**
```json
{
  "total_entities": 50,
  "complete_entities": 45,
  "incomplete_entities": 5,
  "total_processes": 35,
  "validated_processes": 30,
  "processes_with_issues": 5
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

