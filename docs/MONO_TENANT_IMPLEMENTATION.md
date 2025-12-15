# Implementação Mono-Tenant - Condomínio Único

## Visão Geral

A aplicação foi configurada como **mono-tenant**, garantindo que apenas **um condomínio** possa ser cadastrado e ativo por vez. O cadastro do condomínio é **obrigatório** no primeiro acesso e o condomínio atual é exibido claramente no dashboard e no header.

## Mudanças Implementadas

### 1. Banco de Dados - Constraint de Unicidade

**Arquivo**: `supabase/migrations/047_enforce_single_condominium.sql`

- Criada função `check_single_active_condominium()` que garante que apenas um condomínio possa estar ativo por vez
- Trigger `enforce_single_active_condominium` aplicado na tabela `condominiums` para INSERT e UPDATE
- Se tentar criar ou ativar um segundo condomínio, uma exceção é lançada com mensagem clara

### 2. Guard de Condomínio

**Arquivo**: `frontend/src/components/condominium/CondominiumGuard.tsx`

- Componente que verifica se existe um condomínio cadastrado
- Se não existir, redireciona automaticamente para a página de setup (`/setup`)
- Integrado no layout do dashboard para proteger todas as rotas

### 3. Página de Setup Inicial

**Arquivo**: `frontend/src/app/(dashboard)/setup/page.tsx`

- Página dedicada para cadastro obrigatório do condomínio
- Exibe formulário de cadastro que não pode ser fechado sem completar
- Após cadastro, redireciona automaticamente para o dashboard
- Se já houver condomínio cadastrado, redireciona para o dashboard

### 4. Formulário de Condomínio

**Arquivo**: `frontend/src/components/condominiums/CondominiumForm.tsx`

- Validação adicional antes de criar novo condomínio
- Verifica se já existe condomínio ativo antes de permitir criação
- Mensagem de erro clara informando que a aplicação é mono-tenant
- Tratamento de erros do banco de dados relacionados à constraint

### 5. Página de Gerenciamento de Condomínios

**Arquivo**: `frontend/src/app/(dashboard)/condominiums/page.tsx`

- Botão "Novo Condomínio" desabilitado quando já existe um condomínio ativo
- Mensagem informativa explicando que a aplicação é mono-tenant
- Tooltip explicativo no botão desabilitado

### 6. Dashboard

**Arquivo**: `frontend/src/app/(dashboard)/dashboard/page.tsx`

- Card destacado no topo exibindo informações do condomínio atual
- Mostra nome e endereço completo do condomínio
- Link para editar o condomínio
- Visual destacado com cor primária para dar destaque

### 7. Header/PageTitle

**Arquivo**: `frontend/src/components/PageTitle.tsx`

- Badge no header exibindo o nome do condomínio atual
- Ícone de prédio para identificação visual
- Sempre visível em todas as páginas do dashboard
- Design consistente com o sistema de design

### 8. Layout do Dashboard

**Arquivo**: `frontend/src/app/(dashboard)/layout.tsx`

- Integração do `CondominiumGuard` para proteger todas as rotas
- Tratamento especial para página de setup (sem sidebar)
- Verificação automática de condomínio em todas as páginas

## Fluxo de Uso

### Primeiro Acesso (Sem Condomínio)

1. Usuário faz login
2. Sistema verifica se existe condomínio cadastrado
3. Se não existir, redireciona para `/setup`
4. Usuário preenche formulário de cadastro do condomínio
5. Após salvar, sistema redireciona para `/dashboard`
6. Condomínio fica visível no dashboard e no header

### Acessos Subsequentes

1. Usuário faz login
2. Sistema verifica condomínio (já existe)
3. Acesso normal ao dashboard
4. Condomínio sempre visível no header e dashboard

### Tentativa de Criar Segundo Condomínio

1. Usuário tenta acessar página de condomínios
2. Botão "Novo Condomínio" está desabilitado
3. Se tentar criar via API/formulário, erro é exibido
4. Mensagem clara informando que apenas um condomínio é permitido

## Validações e Proteções

### Nível de Banco de Dados
- ✅ Constraint única via trigger
- ✅ Validação em INSERT e UPDATE
- ✅ Mensagem de erro clara

### Nível de Aplicação
- ✅ Verificação antes de criar novo condomínio
- ✅ Guard que bloqueia acesso sem condomínio
- ✅ UI que desabilita criação de múltiplos condomínios

### Nível de Interface
- ✅ Botão desabilitado quando já existe condomínio
- ✅ Mensagens informativas
- ✅ Exibição clara do condomínio atual

## Arquivos Modificados/Criados

### Novos Arquivos
- `supabase/migrations/047_enforce_single_condominium.sql`
- `frontend/src/components/condominium/CondominiumGuard.tsx`
- `frontend/src/app/(dashboard)/setup/page.tsx`
- `docs/MONO_TENANT_IMPLEMENTATION.md`

### Arquivos Modificados
- `frontend/src/app/(dashboard)/layout.tsx`
- `frontend/src/components/condominiums/CondominiumForm.tsx`
- `frontend/src/app/(dashboard)/condominiums/page.tsx`
- `frontend/src/app/(dashboard)/dashboard/page.tsx`
- `frontend/src/components/PageTitle.tsx`

## Próximos Passos (Opcional)

1. **Migração de Dados**: Se houver múltiplos condomínios no banco, criar script para desativar todos exceto um
2. **Testes**: Adicionar testes unitários e de integração para validar o comportamento mono-tenant
3. **Documentação**: Atualizar README com informações sobre a arquitetura mono-tenant

## Notas Importantes

- A aplicação **não suporta** múltiplos condomínios simultaneamente
- O cadastro do condomínio é **obrigatório** para usar a aplicação
- A constraint no banco de dados garante a integridade mesmo se houver acesso direto ao banco
- O condomínio atual é sempre visível no header e dashboard para clareza

