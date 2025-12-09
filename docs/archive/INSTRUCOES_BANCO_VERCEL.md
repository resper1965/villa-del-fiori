# 🗄️ Configurar Banco de Dados na Vercel

## Opções Disponíveis

### ✅ Opção 1: Vercel Postgres (Recomendado - Integrado)

A Vercel oferece **Vercel Postgres** que é totalmente integrado e funciona perfeitamente.

**Passos:**

1. **Acesse o Dashboard da Vercel:**
   ```
   https://vercel.com/dashboard/stores
   ```

2. **Crie um Postgres Store:**
   - Clique em "Create Database"
   - Escolha "Postgres"
   - Selecione o plano (Hobby é gratuito para começar)
   - Nome: `villadelfiori-db`
   - Região: escolha a mais próxima (ex: `us-east-1`)

3. **Conecte ao Projeto:**
   - Após criar, conecte ao projeto `villadelfiori`
   - A Vercel criará automaticamente as variáveis de ambiente:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

4. **Configure DATABASE_URL:**
   ```bash
   # Use POSTGRES_URL_NON_POOLING para Alembic/SQLAlchemy
   vercel env pull .env.local
   # Pegue o valor de POSTGRES_URL_NON_POOLING
   vercel env add DATABASE_URL production
   # Cole o valor quando solicitado
   ```

### ✅ Opção 2: Supabase (Gratuito e Poderoso)

1. **Crie conta:** https://supabase.com
2. **Crie projeto:** Nome: `villadelfiori`
3. **Copie connection string:**
   - Settings → Database → Connection string
   - Use a string "URI" (não "Session mode")
4. **Configure na Vercel:**
   ```bash
   vercel env add DATABASE_URL production
   # Cole a connection string do Supabase
   ```

### ✅ Opção 3: Neon (Gratuito e Serverless)

1. **Crie conta:** https://neon.tech
2. **Crie projeto:** Nome: `villadelfiori`
3. **Copie connection string:**
   - Dashboard → Connection string
4. **Configure na Vercel:**
   ```bash
   vercel env add DATABASE_URL production
   # Cole a connection string do Neon
   ```

## 🚀 Após Configurar o Banco

### 1. Executar Migrations

Após configurar `DATABASE_URL`, você pode executar as migrations de duas formas:

**Opção A: Via Script de Deploy (Recomendado)**
- Criar um script que executa migrations no build
- Ou executar manualmente após o primeiro deploy

**Opção B: Via Endpoint Temporário**
- Criar endpoint `/admin/run-migrations` (temporário)
- Executar uma vez após configurar o banco

### 2. Criar Usuário Admin

Após as migrations, criar o usuário admin:

```bash
# Via endpoint temporário
curl -X POST https://seu-dominio.vercel.app/v1/admin/create-admin

# Ou via script Python (quando tiver acesso ao banco)
python backend/scripts/create_admin_user.py
```

Isso criará:
- **Email:** `resper@gmail.com`
- **Senha:** `cvdf2025`
- **Role:** `admin`

## 📋 Checklist

- [ ] Criar banco de dados (Vercel Postgres / Supabase / Neon)
- [ ] Configurar `DATABASE_URL` na Vercel
- [ ] Executar migrations
- [ ] Criar usuário admin
- [ ] Testar login
- [ ] Remover endpoint `/admin/create-admin` (segurança)

## ⚠️ Importante

- O endpoint `/admin/create-admin` é **temporário** e deve ser removido após criar o primeiro admin
- Use `POSTGRES_URL_NON_POOLING` para migrations (Alembic)
- Use `POSTGRES_URL` para aplicação (com connection pooling)

