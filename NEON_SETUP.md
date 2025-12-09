# 🗄️ Setup Neon - Guia Completo

## ✅ O que já está configurado:

1. **Banco Neon criado** ✅
2. **DATABASE_URL configurada** na Vercel ✅
3. **Variáveis de ambiente** baixadas localmente (`.env.local`) ✅

## 📋 Diferenças: Next.js vs FastAPI

O passo a passo do Neon que você viu é para **Next.js Server Actions**. Nosso projeto usa **FastAPI (Python)**, então:

### Next.js (do tutorial):
- Usa `@neondatabase/serverless` (driver Node.js)
- Usa Server Actions do Next.js
- Executa SQL direto

### FastAPI (nosso projeto):
- Usa `psycopg2-binary` (driver PostgreSQL para Python)
- Usa SQLAlchemy ORM
- Usa Alembic para migrations

**Ambos funcionam perfeitamente com Neon!** ✅

## 🔧 Configuração Atual

### Connection Strings do Neon:

1. **Com Pooling** (para aplicação):
   ```
   postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/db?sslmode=require
   ```

2. **Sem Pooling** (para migrations):
   ```
   postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/db?sslmode=require
   ```

### Variáveis Configuradas:

- `DATABASE_URL` - Connection string sem pooling (usada para migrations)
- `POSTGRES_URL` - Connection string com pooling (se disponível, usada para aplicação)

## 🚀 Próximos Passos

### 1. Verificar .env.local

O comando `vercel env pull .env.local` já foi executado. Verifique se o arquivo foi criado:

```bash
cat .env.local
```

### 2. Para Desenvolvimento Local

Se quiser rodar localmente, copie as variáveis do `.env.local` para o `.env` do backend:

```bash
# No backend/.env
DATABASE_URL=postgresql://neondb_owner:...@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3. Executar Migrations

**Opção A: Via Endpoint (após deploy)**
```bash
curl -X POST https://SEU_DOMINIO.vercel.app/v1/admin/run-migrations
```

**Opção B: Localmente (se tiver acesso)**
```bash
cd backend
alembic upgrade head
```

### 4. Criar Tabelas Manualmente (Alternativa)

Se preferir criar as tabelas manualmente no SQL Editor do Neon:

1. Acesse: https://console.neon.tech
2. Vá em "SQL Editor"
3. Execute as migrations manualmente

Ou use o endpoint `/admin/run-migrations` após o deploy.

## 📝 Notas Importantes

### Connection Pooling

- **Migrations (Alembic)**: Use connection string **SEM pooling** (`DATABASE_URL`)
- **Aplicação (FastAPI)**: Use connection string **COM pooling** (se disponível via `POSTGRES_URL`)

### SSL

Neon **requer SSL** (`sslmode=require`). Isso já está configurado nas connection strings.

### Serverless

O SQLAlchemy está configurado com:
- `pool_pre_ping=True` - Verifica conexões antes de usar (importante para serverless)
- `pool_size=5` - Tamanho reduzido para serverless
- `max_overflow=10` - Overflow reduzido

## 🔍 Verificar Conexão

### Testar Localmente:

```python
# test_connection.py
from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT NOW()"))
    print(result.fetchone())
```

### Testar na Vercel:

```bash
curl https://SEU_DOMINIO.vercel.app/v1/health
```

## ✅ Checklist

- [x] Banco Neon criado
- [x] DATABASE_URL configurada na Vercel
- [x] Variáveis baixadas localmente (`.env.local`)
- [ ] Deploy realizado
- [ ] Migrations executadas
- [ ] Usuário admin criado
- [ ] Sistema testado

## 🔗 Links Úteis

- Neon Console: https://console.neon.tech
- SQL Editor: https://console.neon.tech → SQL Editor
- Vercel Dashboard: https://vercel.com/dashboard
- Documentação Neon: https://neon.tech/docs

