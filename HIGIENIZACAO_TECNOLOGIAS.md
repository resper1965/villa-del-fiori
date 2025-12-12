# Higienização de Tecnologias - Gabi - Síndica Virtual

**Data**: 2025-01-15  
**Status**: ✅ **CONCLUÍDA**

## Objetivo

Remover menções a tecnologias não utilizadas no projeto, mantendo apenas referências às tecnologias realmente implementadas.

## Tecnologias Removidas/Atualizadas

### ❌ Removidas (não utilizadas)

1. **FastAPI** - Backend Python não é mais usado (migrado para Supabase)
   - Removido de: specs, plan.md, tasks.md
   - Substituído por: Supabase Edge Functions (Deno/TypeScript)

2. **Django** - Nunca foi usado, apenas mencionado como alternativa
   - Removido de: research.md (mantido apenas como alternativa considerada)

3. **Firebase** - Nunca foi usado, apenas mencionado como alternativa
   - Removido de: research.md (mantido apenas como alternativa considerada)

4. **MongoDB** - Nunca foi usado, apenas mencionado como alternativa
   - Removido de: research.md (mantido apenas como alternativa considerada)

5. **SQLite** - Nunca foi usado, apenas mencionado como alternativa
   - Removido de: research.md (mantido apenas como alternativa considerada)

6. **Jest/Playwright** - Mencionados mas não implementados
   - Atualizado para: "framework de testes" (a definir)
   - Removido de: PLANO_CORRECAO_GAPS.md

7. **Python (como backend)** - Não é mais usado como backend
   - Mantido apenas: Scripts de seed (opcional)
   - Removido de: plan.md, tasks.md (quando se referia a backend)

8. **SQLAlchemy** - Não é usado (Supabase usa SQL direto)
   - Removido de: specs/007

9. **Celery** - Não é usado (Edge Functions são assíncronas)
   - Removido de: specs/004, specs/005, specs/006

10. **pytest** - Não é usado (testes não implementados)
    - Removido de: specs/007

11. **S3/MinIO** - Não é usado (Supabase Storage)
    - Substituído por: Supabase Storage

12. **Redis** - Não é usado
    - Removido de: specs/004, specs/007

### ✅ Mantidas (utilizadas)

1. **Supabase** - Backend completo
2. **Next.js** - Frontend framework
3. **React** - Biblioteca UI
4. **TypeScript** - Linguagem principal
5. **PostgreSQL** - Banco de dados (via Supabase)
6. **Deno** - Runtime para Edge Functions
7. **Tailwind CSS** - Estilização
8. **shadcn/ui** - Componentes UI
9. **React Query** - Gerenciamento de estado
10. **TanStack Table** - Tabelas
11. **Python** - Apenas para scripts de seed (opcional)

## Arquivos Atualizados

### Documentação Principal
- ✅ `README.md` - Python marcado como opcional
- ✅ `specs/003-app-gestao-processos-aprovacao/research.md` - Alternativas marcadas como "não implementadas"
- ✅ `specs/003-app-gestao-processos-aprovacao/plan.md` - Stack atualizado
- ✅ `specs/003-app-gestao-processos-aprovacao/tasks.md` - FastAPI removido

### Especificações
- ✅ `specs/004-validacao-entidades-processos/plan.md` - FastAPI → Edge Functions
- ✅ `specs/004-validacao-entidades-processos/tasks.md` - Celery removido
- ✅ `specs/005-base-conhecimento-processos/plan.md` - FastAPI → Edge Functions
- ✅ `specs/006-chatbot-moradores/plan.md` - FastAPI → Edge Functions
- ✅ `specs/007-ingestao-contratos-fornecedores/plan.md` - Stack completo atualizado
- ✅ `specs/007-ingestao-contratos-fornecedores/tasks.md` - Todas as tarefas atualizadas
- ✅ `specs/007-ingestao-contratos-fornecedores/spec.md` - Python-docx → Deno

### Outros
- ✅ `PLANO_CORRECAO_GAPS.md` - Jest/Playwright → framework genérico
- ✅ `docker-compose.yml` - Comentário atualizado

## Mudanças Principais

### Backend
- **Antes**: FastAPI (Python) + SQLAlchemy + Celery
- **Agora**: Supabase Edge Functions (Deno/TypeScript) + SQL direto

### Storage
- **Antes**: S3/MinIO ou local
- **Agora**: Supabase Storage

### Testes
- **Antes**: Jest + Playwright (específicos)
- **Agora**: Framework de testes (a definir)

### Scripts
- **Antes**: Python como backend obrigatório
- **Agora**: Python apenas para scripts de seed (opcional)

## Resultado

✅ Todas as menções a tecnologias não utilizadas foram removidas ou atualizadas  
✅ Documentação agora reflete apenas tecnologias realmente usadas  
✅ Especificações futuras (Spec 007) atualizadas para usar Supabase Edge Functions  
✅ Alternativas consideradas mantidas apenas como referência histórica

---

**Última Atualização**: 2025-01-15

