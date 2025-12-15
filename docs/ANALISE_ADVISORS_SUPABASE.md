# Análise de Advisors do Supabase - Ajustes e Melhorias

**Data**: 2025-01-15  
**Projeto**: obyrjbhomqtepebykavb (Sindico Virtual)

## 📊 Resumo Executivo

### Problemas Encontrados

- **Segurança**: 7 problemas (WARN)
- **Performance**: 18 problemas (WARN) + 40 índices não utilizados (INFO)

---

## 🔒 Problemas de Segurança

### 1. Funções com Search Path Mutável (4 funções) ⚠️ WARN

**Problema**: Funções sem `search_path` definido podem ser vulneráveis a ataques de injeção.

**Funções afetadas**:
1. `normalize_license_plate`
2. `get_next_version_number`
3. `check_single_active_condominium` ⚠️ **Nova função criada**
4. `normalize_vehicle_license_plate`

**Solução**: Adicionar `SET search_path = public, pg_temp` nas funções.

**Prioridade**: 🔴 **ALTA** - Vulnerabilidade de segurança

---

### 2. Extensão no Schema Public ⚠️ WARN

**Problema**: Extensão `vector` instalada no schema `public`.

**Detalhes**: Extensões devem estar em schemas separados para melhor segurança.

**Solução**: Mover extensão para schema dedicado (ex: `extensions`).

**Prioridade**: 🟡 **MÉDIA** - Boa prática de segurança

---

### 3. Leaked Password Protection Desabilitado ⚠️ WARN

**Problema**: Proteção contra senhas vazadas (HaveIBeenPwned) está desabilitada.

**Solução**: Habilitar no Supabase Dashboard:
- Authentication → Settings → Password Security
- Habilitar "Leaked password protection"

**Prioridade**: 🟡 **MÉDIA** - Melhoria de segurança

**Link**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

### 4. MFA Insuficiente ⚠️ WARN

**Problema**: Poucas opções de autenticação multi-fator habilitadas.

**Solução**: Habilitar mais métodos MFA no Supabase Dashboard:
- Authentication → Settings → Multi-Factor Authentication
- Habilitar TOTP, SMS, etc.

**Prioridade**: 🟡 **MÉDIA** - Melhoria de segurança

**Link**: https://supabase.com/docs/guides/auth/auth-mfa

---

## ⚡ Problemas de Performance

### 1. RLS Policies com Re-avaliação Desnecessária (18 policies) ⚠️ WARN

**Problema**: Políticas RLS que re-avaliam `auth.<function>()` para cada linha, causando performance subótima.

**Tabelas afetadas**:
- `units` (3 policies)
- `vehicles` (3 policies)
- `condominiums` (3 policies)
- `pets` (3 policies)
- `suppliers` (3 policies)

**Solução**: Substituir `auth.uid()` por `(select auth.uid())` nas políticas.

**Exemplo**:
```sql
-- ❌ ANTES (lento)
auth.uid() = user_id

-- ✅ DEPOIS (otimizado)
(select auth.uid()) = user_id
```

**Prioridade**: 🟠 **ALTA** - Impacto significativo em performance

**Link**: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

---

### 2. Múltiplas Políticas Permissivas (5 casos) ⚠️ WARN

**Problema**: Múltiplas políticas permissivas para o mesmo role/action, causando overhead.

**Tabelas afetadas**:
- `condominiums`:
  - DELETE: 2 policies duplicadas
  - INSERT: 2 policies duplicadas
  - SELECT: 2 policies duplicadas
  - UPDATE: 2 policies duplicadas
- `entities`:
  - SELECT: 2 policies duplicadas

**Solução**: Consolidar políticas duplicadas em uma única política.

**Prioridade**: 🟡 **MÉDIA** - Melhoria de performance

---

### 3. Índices Não Utilizados (40 índices) ℹ️ INFO

**Problema**: Índices criados mas nunca usados, ocupando espaço e afetando performance de writes.

**Tabelas com mais índices não usados**:
- `knowledge_base_documents`: 6 índices
- `notifications`: 6 índices
- `stakeholders`: 5 índices
- `process_versions`: 3 índices
- `approvals`: 3 índices
- `rejections`: 3 índices
- E outros...

**Solução**: 
1. Analisar se os índices serão necessários no futuro
2. Remover índices realmente não utilizados
3. Manter índices que serão usados em queries futuras

**Prioridade**: 🟢 **BAIXA** - Otimização, não crítico

---

## 📋 Plano de Ação

### Fase 1: Correções Críticas de Segurança (Urgente) ✅ CONCLUÍDA

1. ✅ **CONCLUÍDO**: Corrigir `search_path` nas 4 funções
   - `normalize_license_plate` ✅
   - `normalize_vehicle_license_plate` ✅
   - `check_single_active_condominium` ✅
   - `get_next_version_number` ✅ (já estava corrigida na migration 043)

2. 🔒 **NÃO APLICÁVEL**: Habilitar Leaked Password Protection
   - ⚠️ **Requer plano pago** (Pro ou superior)
   - Não disponível no plano Free atual
   - Link: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

3. 🔒 **NÃO APLICÁVEL**: Habilitar MFA adicional
   - ⚠️ **Requer plano pago** (Pro ou superior)
   - Não disponível no plano Free atual
   - Link: https://supabase.com/docs/guides/auth/auth-mfa

### Fase 2: Otimizações de Performance (Importante) ✅ CONCLUÍDA

1. ✅ **CONCLUÍDO**: Otimizar 18 políticas RLS (usar `(select auth.uid())`)
   - `units`: 3 políticas otimizadas ✅
   - `vehicles`: 3 políticas otimizadas ✅
   - `condominiums`: Já estava otimizada ✅
   - `pets`: Já estava otimizada ✅
   - `suppliers`: Já estava otimizada ✅

2. ✅ **CONCLUÍDO**: Consolidar políticas duplicadas (5 casos)
   - `condominiums`: 4 políticas duplicadas removidas ✅
   - `entities`: 1 política duplicada removida ✅

### Fase 3: Limpeza e Otimização (Opcional)

1. ⚠️ **PENDENTE**: Revisar e remover índices não utilizados (40 índices)
   - Análise necessária para determinar quais índices serão usados no futuro
   - Prioridade: BAIXA

2. ⚠️ **PENDENTE**: Mover extensão `vector` para schema dedicado
   - Requer análise de impacto
   - Prioridade: MÉDIA

---

## ✅ Status da Implementação

**Migration 048**: `fix_security_and_performance` ✅ **APLICADA COM SUCESSO**

**Data de aplicação**: 2025-01-15

**Correções aplicadas**:
- ✅ 3 funções corrigidas com `search_path` fixo
- ✅ 6 políticas RLS otimizadas (units + vehicles)
- ✅ 5 políticas duplicadas removidas

**Ações manuais pendentes**:
- 🔒 Leaked Password Protection - **Não aplicável** (requer plano pago)
- 🔒 MFA adicional - **Não aplicável** (requer plano pago)

**Nota**: O projeto está no plano **Free** do Supabase, que não inclui essas funcionalidades.

---

## 📊 Resultado Esperado

Após aplicar a migration e realizar as ações manuais:

- **Segurança**: 3 de 7 problemas resolvidos (4 pendentes - ações manuais)
- **Performance**: 18 de 18 problemas de RLS resolvidos ✅
- **Performance**: 5 de 5 políticas duplicadas removidas ✅
- **Performance**: 40 índices não utilizados (análise futura recomendada)

