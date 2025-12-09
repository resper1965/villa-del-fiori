# 🗄️ Opções de Banco de Dados na Vercel

## Análise das Opções

### ✅ 1. Neon (Recomendado - Postgres Serverless)

**Por que é a melhor opção:**
- ✅ PostgreSQL serverless completo
- ✅ Gratuito para começar (512 MB storage, 0.5 compute hours/dia)
- ✅ Integração nativa com Vercel
- ✅ Suporta SQLAlchemy e Alembic perfeitamente
- ✅ Latência < 10ms com Edge Functions
- ✅ Auto-scaling automático
- ✅ Connection pooling incluído

**Como criar:**
1. Acesse: https://neon.tech
2. Crie conta (gratuita)
3. Crie projeto: `villadelfiori`
4. Copie connection string
5. Configure na Vercel:
   ```bash
   vercel env add DATABASE_URL production
   # Cole a connection string do Neon
   ```

### ✅ 2. Vercel Postgres

**Características:**
- ✅ Totalmente integrado com Vercel
- ✅ Variáveis criadas automaticamente
- ⚠️ Requer criação via dashboard (não há API direta)
- ⚠️ Plano Hobby tem limites menores

**Como criar:**
1. Acesse: https://vercel.com/dashboard/stores
2. "Create Database" → "Postgres"
3. Conecte ao projeto `villadelfiori`
4. Use `POSTGRES_URL_NON_POOLING` para `DATABASE_URL`

### ❌ 3. Edge Config

**Por que não serve:**
- ❌ Key-value store (não é banco relacional)
- ❌ Não suporta SQLAlchemy
- ❌ Não suporta relacionamentos complexos
- ❌ Não suporta migrations (Alembic)

**Uso adequado:**
- Feature flags
- Configurações globais
- Redirecionamentos dinâmicos

### ❌ 4. Vercel Blob

**Por que não serve:**
- ❌ Armazenamento de arquivos (não é banco de dados)
- ❌ Não suporta SQLAlchemy
- ❌ Não suporta queries relacionais

**Uso adequado:**
- Armazenar PDFs de contratos
- Imagens e arquivos estáticos
- Uploads de documentos

## 🎯 Recomendação Final: Neon

**Motivos:**
1. **Melhor para SQLAlchemy**: Suporta todas as features do PostgreSQL
2. **Gratuito e generoso**: 512 MB storage + 0.5 compute hours/dia
3. **Performance**: Latência < 10ms com Edge Functions
4. **Fácil setup**: Criação rápida e connection string simples
5. **Escalável**: Auto-scaling conforme necessidade

## 📋 Passo a Passo - Neon

### 1. Criar Conta e Projeto

1. Acesse: https://neon.tech
2. Clique em "Sign Up" (pode usar GitHub)
3. Clique em "Create Project"
4. Nome: `villadelfiori`
5. Região: Escolha a mais próxima (ex: `us-east-2`)
6. PostgreSQL: Versão 15 ou 16 (padrão)

### 2. Obter Connection String

1. No dashboard do Neon, vá em "Connection Details"
2. Copie a connection string (formato: `postgresql://user:pass@host/dbname`)
3. Ou use a connection string com pooling (recomendado para produção)

### 3. Configurar na Vercel

```bash
# Production
vercel env add DATABASE_URL production
# Cole a connection string do Neon

# Preview
vercel env add DATABASE_URL preview
# Cole a mesma connection string

# Development
vercel env add DATABASE_URL development
# Cole a connection string de desenvolvimento (se diferente)
```

### 4. Executar Migrations

Após configurar `DATABASE_URL`, execute as migrations:

```bash
# Opção 1: Via endpoint temporário (após deploy)
curl -X POST https://seu-dominio.vercel.app/v1/admin/run-migrations

# Opção 2: Localmente (se tiver acesso)
cd backend
alembic upgrade head
```

### 5. Criar Usuário Admin

```bash
curl -X POST https://seu-dominio.vercel.app/v1/admin/create-admin
```

Isso criará:
- **Email:** `resper@gmail.com`
- **Senha:** `cvdf2025`
- **Role:** `admin`

## 🔗 Links Úteis

- Neon Dashboard: https://console.neon.tech
- Documentação Neon: https://neon.tech/docs
- Vercel + Neon: https://neon.tech/docs/guides/vercel

