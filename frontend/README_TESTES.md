# Guia Rápido de Testes

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
cd frontend
npm install
npx playwright install chromium
```

### 2. Configurar Variáveis de Ambiente

Criar `.env.test.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 3. Rodar Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Todos os testes
npm run test:all
```

## 📝 Estrutura

- `e2e/` - Testes end-to-end (Playwright)
- `__tests__/` - Testes unitários (Jest)

## 📚 Documentação Completa

Veja `TESTES_FUNCIONAIS.md` para documentação detalhada.

