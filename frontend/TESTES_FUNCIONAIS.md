# Testes Funcionais - Gabi - Síndica Virtual

**Data**: 2025-01-15

## 📋 Estrutura de Testes

### Testes E2E (End-to-End) com Playwright

Testes que simulam interações reais do usuário com a aplicação completa.

**Localização**: `frontend/e2e/`

**Arquivos**:
- `auth.spec.ts` - Testes de autenticação (login, registro)
- `processes.spec.ts` - Testes de CRUD de processos
- `approval-workflow.spec.ts` - Testes do workflow de aprovação
- `notifications.spec.ts` - Testes do sistema de notificações
- `rag-chat.spec.ts` - Testes do chat com RAG
- `entity-validation.spec.ts` - Testes de validação de entidades

**Comandos**:
```bash
# Rodar todos os testes E2E
npm run test:e2e

# Rodar com interface gráfica
npm run test:e2e:ui

# Rodar em modo headed (ver o navegador)
npm run test:e2e:headed

# Rodar testes específicos
npx playwright test e2e/auth.spec.ts
```

### Testes Unitários com Jest + React Testing Library

Testes de componentes e funções isoladas.

**Localização**: `frontend/__tests__/`

**Arquivos**:
- `components/Button.test.tsx` - Testes do componente Button
- `lib/api/processes.test.ts` - Testes da API de processos

**Comandos**:
```bash
# Rodar todos os testes unitários
npm run test

# Rodar em modo watch
npm run test:watch

# Rodar com coverage
npm run test:coverage
```

---

## 🚀 Setup Inicial

### 1. Instalar Dependências

```bash
cd frontend
npm install
```

### 2. Instalar Browsers do Playwright

```bash
npx playwright install
```

### 3. Configurar Variáveis de Ambiente

Criar arquivo `.env.test.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

### 4. Rodar Testes

```bash
# Testes unitários
npm run test

# Testes E2E (inicia servidor automaticamente)
npm run test:e2e

# Todos os testes
npm run test:all
```

---

## 📝 Testes Implementados

### ✅ Autenticação
- [x] Exibição do formulário de login
- [x] Validação de campos obrigatórios
- [x] Erro com credenciais inválidas
- [x] Navegação para registro

### ✅ Processos
- [x] Listagem de processos
- [x] Abertura de formulário de novo processo
- [x] Validação de campos obrigatórios

### ✅ Workflow de Aprovação
- [x] Exibição de processos pendentes
- [x] Abertura de modal de aprovação
- [x] Abertura de modal de rejeição

### ✅ Notificações
- [x] Exibição do ícone de notificações
- [x] Abertura do dropdown
- [x] Navegação para página de notificações

### ✅ Chat com RAG
- [x] Carregamento da página
- [x] Exibição do campo de input
- [x] Envio de mensagem e recebimento de resposta

### ✅ Validação de Entidades
- [x] Validação ao criar processo
- [x] Modal de criação de entidade faltante

---

## 🔧 Próximos Passos

### Testes a Adicionar

1. **Testes de Integração para Edge Functions**
   - Testar `validate-entities`
   - Testar `notifications`
   - Testar `chat-with-rag`
   - Testar `ingest-process`

2. **Testes de Componentes**
   - `ProcessForm`
   - `EntityValidation`
   - `NotificationBell`
   - `MermaidDiagram`

3. **Testes de Fluxos Completos**
   - Criar processo → Enviar para revisão → Aprovar
   - Criar processo → Enviar para revisão → Rejeitar → Refatorar
   - Criar processo com entidades inválidas → Criar entidades → Salvar

4. **Testes de Performance**
   - Tempo de carregamento do dashboard
   - Tempo de resposta do chat
   - Performance de listagens grandes

---

## 📊 Coverage

**Meta de Coverage**:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

**Comando para ver coverage**:
```bash
npm run test:coverage
```

---

## 🐛 Troubleshooting

### Playwright não encontra o servidor

Certifique-se de que o servidor está rodando ou configure `webServer` no `playwright.config.ts`.

### Testes falhando por timeout

Aumente o `timeout` nos testes ou verifique se o servidor está respondendo corretamente.

### Erros de autenticação nos testes

Configure usuários de teste no banco de dados ou use fixtures para autenticação automática.

---

## 📚 Recursos

- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)

---

**Última Atualização**: 2025-01-15

