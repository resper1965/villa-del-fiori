# Arquitetura Mono-Tenant - Condomínio Único

**Última Atualização**: 2025-01-15

---

## 🎯 Visão Geral

A aplicação foi configurada como **mono-tenant**, garantindo que apenas **um condomínio** possa ser cadastrado e ativo por vez. O cadastro do condomínio é **obrigatório** no primeiro acesso e o condomínio atual é exibido claramente no dashboard e no header.

---

## 🔒 Constraint de Banco de Dados

### Função e Trigger

O banco de dados garante que apenas um condomínio possa estar ativo através de:

1. **Função**: `check_single_active_condominium()`
   - Verifica se já existe um condomínio ativo antes de permitir criação/ativação
   - Lança exceção se tentar criar ou ativar um segundo condomínio

2. **Trigger**: `enforce_single_active_condominium`
   - Aplicado na tabela `condominiums` para INSERT e UPDATE
   - Executa a função antes de cada inserção ou atualização

### Mensagem de Erro

Se tentar criar ou ativar um segundo condomínio, a seguinte mensagem é exibida:

> "Apenas um condomínio pode estar ativo por vez. A aplicação é mono-tenant."

---

## 🚀 Setup Inicial

### Página de Setup

**Rota**: `/setup`

**Funcionalidades**:
- Exibe formulário de cadastro de condomínio
- Não pode ser fechado sem completar o cadastro
- Redireciona automaticamente para o dashboard após cadastro
- Se já houver condomínio cadastrado, redireciona para o dashboard

### Guard de Condomínio

**Componente**: `CondominiumGuard`

**Funcionalidades**:
- Verifica se existe um condomínio cadastrado
- Se não existir, redireciona automaticamente para `/setup`
- Protege todas as rotas do dashboard
- Exibe loading enquanto verifica

---

## 📊 Exibição do Condomínio

### Dashboard

- Card dedicado com nome e endereço do condomínio
- Informações sempre visíveis no topo da página

### Header

- Badge com nome do condomínio ao lado do título da página
- Sempre visível em todas as páginas

### Menu

- Item "Condomínio" no menu de Administração
- Link para página de gerenciamento

---

## 🛠️ Gerenciamento

### Página de Gerenciamento

**Rota**: `/condominiums`

**Funcionalidades**:
- Exibe informações do condomínio ativo
- Permite editar o condomínio existente
- Não permite criar novo condomínio (botão desabilitado)
- Exibe mensagem explicando que a aplicação é mono-tenant

### Formulário

- Validação adicional antes de criar novo condomínio
- Verifica se já existe condomínio ativo
- Mensagem de erro clara se tentar criar segundo condomínio
- Permite editar condomínio existente normalmente

---

## 🔐 Segurança

### Políticas RLS

- **Visualização**: Usuários autenticados podem ver condomínios ativos
- **Criação**: Apenas admin, síndico e subsíndico podem criar
- **Atualização**: Apenas admin, síndico e subsíndico podem atualizar
- **Remoção**: Apenas admin pode deletar

### Constraints

- Constraint de banco garante apenas um condomínio ativo
- Validação no frontend antes de criar
- Validação no backend (trigger) como camada adicional

---

## 📝 Fluxo de Uso

### Primeiro Acesso

1. Usuário faz login
2. Sistema verifica se existe condomínio cadastrado
3. Se não existir, redireciona para `/setup`
4. Usuário preenche formulário de cadastro
5. Condomínio é criado e marcado como ativo
6. Usuário é redirecionado para o dashboard

### Acessos Subsequentes

1. Usuário faz login
2. Sistema verifica se existe condomínio cadastrado
3. Se existir, redireciona para o dashboard
4. Nome do condomínio é exibido no header e dashboard

### Edição do Condomínio

1. Usuário acessa `/condominiums`
2. Clica em "Editar Condomínio"
3. Edita informações
4. Salva alterações
5. Informações são atualizadas em todo o sistema

---

## 🎯 Benefícios

### Para Usuários

- ✅ **Simplicidade**: Interface focada em um único condomínio
- ✅ **Clareza**: Sempre sabe qual condomínio está gerenciando
- ✅ **Rapidez**: Não precisa selecionar condomínio a cada acesso

### Para o Sistema

- ✅ **Performance**: Queries mais simples e rápidas
- ✅ **Segurança**: Dados sempre contextualizados
- ✅ **Manutenção**: Estrutura mais simples de manter

---

## 📚 Referências

- **Migration**: `047_enforce_single_condominium.sql`
- **Componente**: `CondominiumGuard`
- **Página**: `/setup`
- **Página**: `/condominiums`
- **Tabela**: `condominiums`

---

**Última Atualização**: 2025-01-15
