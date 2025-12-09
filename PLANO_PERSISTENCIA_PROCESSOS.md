# 📋 Plano: Persistência de Processos no Banco de Dados

## 📊 Situação Atual

### ✅ O que já existe:
- **Estrutura do banco**: Tabelas `processes` e `process_versions` criadas no Supabase
- **API Backend**: Endpoints para criar, listar, atualizar e deletar processos
- **Dados mock**: ~35 processos pré-cadastrados em `frontend/src/data/processes.ts`
- **Frontend**: Interface para visualizar e gerenciar processos

### ❌ O que falta:
- **Persistência**: Processos estão apenas no frontend (dados mock)
- **Seed script**: Script para popular banco com processos pré-cadastrados
- **Sincronização**: Frontend ainda usa dados mock como fallback

---

## 🎯 Vale a Pena Persistir?

### ✅ **SIM, DEFINITIVAMENTE VALE A PENA!**

#### Vantagens:

1. **Rastreabilidade Completa**
   - ✅ Histórico de mudanças
   - ✅ Versionamento imutável
   - ✅ Auditoria completa

2. **Workflow de Aprovação**
   - ✅ Processos podem ser aprovados/rejeitados
   - ✅ Rastreamento de quem aprovou
   - ✅ Comentários e ressalvas

3. **Busca e Filtros**
   - ✅ Busca full-text no banco
   - ✅ Filtros por categoria, status, stakeholder
   - ✅ Performance melhor que dados mock

4. **Multi-usuário**
   - ✅ Cada usuário vê processos baseado em permissões (RLS)
   - ✅ Processos criados por diferentes stakeholders
   - ✅ Colaboração real

5. **Integração com Outras Features**
   - ✅ Validação de entidades
   - ✅ Chatbot pode consultar processos do banco
   - ✅ Ingestão de contratos pode gerar processos
   - ✅ Relatórios e dashboards

6. **Escalabilidade**
   - ✅ Suporta milhares de processos
   - ✅ Paginação eficiente
   - ✅ Índices otimizados

#### Desvantagens (mínimas):

- ⚠️ Precisa criar script de seed (1-2 horas)
- ⚠️ Migração inicial dos dados (30 min)
- ⚠️ Atualizar frontend para não usar mock (1 hora)

**Conclusão**: Benefícios superam muito os custos. **É essencial persistir!**

---

## 📋 Plano de Implementação

### Fase 1: Preparação (30 min)

#### 1.1 Criar Script de Seed para Supabase

**Arquivo**: `supabase/migrations/005_seed_processes.sql`

**Objetivo**: Criar função SQL para popular processos pré-cadastrados

**Estrutura**:
```sql
-- Função para criar processo com versão inicial
CREATE OR REPLACE FUNCTION seed_process(
    p_name TEXT,
    p_category processcategory,
    p_subcategory TEXT,
    p_document_type documenttype,
    p_description TEXT,
    p_workflow JSONB,
    p_entities JSONB,
    p_variables JSONB,
    p_mermaid_diagram TEXT,
    p_raci JSONB,
    p_creator_id UUID
) RETURNS UUID AS $$
DECLARE
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Criar processo
    INSERT INTO public.processes (
        name, category, subcategory, document_type,
        status, creator_id
    ) VALUES (
        p_name, p_category, p_subcategory, p_document_type,
        'aprovado'::processstatus, p_creator_id
    ) RETURNING id INTO v_process_id;
    
    -- Criar versão inicial
    INSERT INTO public.process_versions (
        process_id, version_number, content, content_text,
        entities_involved, variables_applied, created_by, status
    ) VALUES (
        v_process_id, 1,
        jsonb_build_object(
            'description', p_description,
            'workflow', p_workflow,
            'entities', p_entities,
            'variables', p_variables,
            'mermaid_diagram', p_mermaid_diagram,
            'raci', p_raci
        ),
        p_description,
        p_entities,
        jsonb_object(p_variables::text[]),
        p_creator_id,
        'aprovado'::processstatus
    ) RETURNING id INTO v_version_id;
    
    RETURN v_process_id;
END;
$$ LANGUAGE plpgsql;
```

#### 1.2 Criar Script Python para Migração

**Arquivo**: `scripts/seed_processes_to_supabase.py`

**Objetivo**: Ler `processes.ts`, converter para formato do banco e inserir via API Supabase

**Estrutura**:
```python
import json
import os
from supabase import create_client
from typing import List, Dict

# Ler processos do arquivo TypeScript
# Converter para formato do banco
# Inserir via Supabase client
```

---

### Fase 2: Migração dos Dados (1 hora)

#### 2.1 Converter Dados Mock para Formato do Banco

**Mapeamento**:
- `id` (number) → Remover (banco gera UUID)
- `name` → `processes.name`
- `category` (string) → `processes.category` (enum)
- `status` → `process_versions.status`
- `description` → `process_versions.content.description`
- `workflow` → `process_versions.content.workflow`
- `entities` → `process_versions.entities_involved`
- `variables` → `process_versions.variables_applied`
- `mermaid_diagram` → `process_versions.content.mermaid_diagram`
- `raci` → `process_versions.content.raci`
- `documentType` → `processes.document_type` (enum)

#### 2.2 Criar Stakeholder Admin para Seed

**Necessário**: Um stakeholder admin para ser o `creator_id` dos processos seed

```sql
-- Criar stakeholder admin (se não existir)
INSERT INTO public.stakeholders (
    name, email, type, role, user_role, is_active
) VALUES (
    'Sistema', 'sistema@villadelfiori.com',
    'staff'::stakeholdertype,
    'aprovador'::stakeholderrole,
    'admin'::userrole,
    true
) ON CONFLICT (email) DO NOTHING
RETURNING id;
```

#### 2.3 Executar Seed

**Opção 1: Via SQL direto** (mais rápido)
- Criar migration SQL com todos os processos
- Executar via Supabase dashboard ou CLI

**Opção 2: Via Python script** (mais flexível)
- Script lê `processes.ts`
- Converte automaticamente
- Insere via Supabase client

**Recomendação**: Opção 2 (mais manutenível)

---

### Fase 3: Atualizar Frontend (1 hora)

#### 3.1 Remover Dependência de Dados Mock

**Arquivo**: `frontend/src/app/(dashboard)/processes/page.tsx`

**Mudanças**:
```typescript
// ANTES
import { processesData } from "@/data/processes" // Fallback
const { data, isLoading, error } = useProcesses()
const processes = data?.items || processesData // Fallback para mock

// DEPOIS
const { data, isLoading, error } = useProcesses()
const processes = data?.items || [] // Sem fallback, sempre do banco
```

#### 3.2 Atualizar Hooks

**Arquivo**: `frontend/src/lib/hooks/useProcesses.ts`

**Garantir**:
- ✅ Tratamento de erro adequado
- ✅ Loading states
- ✅ Retry logic

#### 3.3 Manter `processes.ts` para Referência

**Não deletar** o arquivo, mas:
- ✅ Adicionar comentário indicando que é apenas referência
- ✅ Usar apenas para desenvolvimento/testes
- ✅ Documentar que dados reais vêm do banco

---

### Fase 4: Validação e Testes (30 min)

#### 4.1 Verificar Dados no Banco

```sql
-- Verificar total de processos
SELECT COUNT(*) FROM public.processes;

-- Verificar processos por categoria
SELECT category, COUNT(*) 
FROM public.processes 
GROUP BY category;

-- Verificar versões
SELECT COUNT(*) FROM public.process_versions;
```

#### 4.2 Testar Frontend

- ✅ Listar processos
- ✅ Filtrar por categoria
- ✅ Buscar processos
- ✅ Visualizar detalhes
- ✅ Criar novo processo

#### 4.3 Testar API

```bash
# Listar processos
curl https://obyrjbhomqtepebykavb.supabase.co/rest/v1/processes

# Buscar processo específico
curl https://obyrjbhomqtepebykavb.supabase.co/rest/v1/processes?id=eq.{uuid}
```

---

## 🔧 Implementação Técnica

### Estrutura de Arquivos

```
villadelfiori/
├── supabase/
│   └── migrations/
│       ├── 001_create_schema_completo.sql ✅
│       ├── 002_rls_policies.sql ✅
│       ├── 003_sync_auth_users.sql ✅
│       ├── 004_cleanup_old_data.sql ✅
│       └── 005_seed_processes.sql ⏳ (criar)
├── scripts/
│   └── seed_processes_to_supabase.py ⏳ (criar)
└── frontend/
    └── src/
        ├── data/
        │   └── processes.ts (manter como referência)
        └── app/
            └── (dashboard)/
                └── processes/
                    └── page.tsx (atualizar)
```

---

## 📝 Checklist de Implementação

### Preparação
- [ ] Criar migration `005_seed_processes.sql`
- [ ] Criar função SQL `seed_process()`
- [ ] Criar script Python `seed_processes_to_supabase.py`
- [ ] Criar stakeholder admin para seed

### Migração
- [ ] Converter dados de `processes.ts` para formato do banco
- [ ] Mapear categorias (string → enum)
- [ ] Mapear document types (string → enum)
- [ ] Executar seed script
- [ ] Verificar dados inseridos

### Frontend
- [ ] Remover fallback para `processesData`
- [ ] Atualizar tratamento de erros
- [ ] Testar listagem de processos
- [ ] Testar filtros e busca
- [ ] Testar criação de novo processo

### Validação
- [ ] Verificar total de processos no banco (deve ser ~35)
- [ ] Verificar processos por categoria
- [ ] Verificar versões criadas
- [ ] Testar RLS (permissões)
- [ ] Testar workflow de aprovação

---

## 🚀 Próximos Passos

1. **Imediato**: Criar script de seed e migrar dados
2. **Curto prazo**: Atualizar frontend para usar apenas banco
3. **Médio prazo**: Implementar busca full-text
4. **Longo prazo**: Adicionar histórico de mudanças visual

---

## 💡 Considerações Importantes

### Performance

- ✅ **Índices**: Já criados nas migrations anteriores
- ✅ **Paginação**: API já suporta (page, page_size)
- ✅ **RLS**: Políticas já configuradas

### Segurança

- ✅ **RLS**: Apenas usuários autenticados veem processos
- ✅ **Permissões**: Apenas admins/syndics podem deletar
- ✅ **Auditoria**: Histórico completo de mudanças

### Manutenibilidade

- ✅ **Versionamento**: Cada mudança cria nova versão
- ✅ **Imutabilidade**: Versões antigas não são alteradas
- ✅ **Rastreabilidade**: Sempre sabemos quem criou/modificou

---

## ❓ Perguntas Frequentes

### 1. E se eu quiser atualizar um processo seed?

**Resposta**: Crie uma nova versão do processo. Versões antigas são mantidas para histórico.

### 2. Posso deletar processos seed?

**Resposta**: Sim, mas apenas admins/syndics. Recomendado manter para referência.

### 3. Como adicionar novos processos pré-cadastrados?

**Resposta**: Execute o script de seed novamente (ele verifica duplicatas) ou crie via interface.

### 4. E se o banco estiver vazio?

**Resposta**: Frontend mostrará lista vazia. Usuários podem criar processos via interface.

---

## 📊 Estimativa de Tempo

| Fase | Tempo | Prioridade |
|------|-------|------------|
| Preparação | 30 min | Alta |
| Migração | 1 hora | Alta |
| Frontend | 1 hora | Alta |
| Validação | 30 min | Média |
| **Total** | **3 horas** | - |

---

## ✅ Conclusão

**Persistir processos no banco é ESSENCIAL** para:
- ✅ Workflow de aprovação funcionar
- ✅ Rastreabilidade e auditoria
- ✅ Multi-usuário e colaboração
- ✅ Integração com outras features
- ✅ Escalabilidade

**Recomendação**: Implementar imediatamente após migração para Supabase estar completa.

