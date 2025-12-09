# 🚀 Próximos Passos - Configuração Neon

## ✅ O que já está configurado:

1. **Banco Neon criado** ✅
2. **DATABASE_URL configurada** na Vercel (Production, Preview, Development) ✅
3. **Variáveis de ambiente** configuradas:
   - `DATABASE_URL` - Connection string do Neon
   - `OPENAI_API_KEY` - Chave da API OpenAI
   - `SECRET_KEY` - Chave secreta para JWT
   - `OPENAI_MODEL` - Modelo OpenAI (gpt-4o)

## 📋 Próximos Passos:

### 1. Fazer Deploy

```bash
vercel --prod
```

Ou faça commit e push para trigger automático (se configurado).

### 2. Executar Migrations

Após o deploy, execute as migrations para criar as tabelas:

```bash
# Substitua SEU_DOMINIO pelo domínio da Vercel
curl -X POST https://SEU_DOMINIO.vercel.app/v1/admin/run-migrations
```

**Ou via navegador:**
```
https://SEU_DOMINIO.vercel.app/v1/admin/run-migrations
```

**Resposta esperada:**
```json
{
  "message": "Migrations executadas com sucesso",
  "status": "ok"
}
```

### 3. Criar Usuário Admin

Após as migrations, crie o usuário administrador:

```bash
curl -X POST https://SEU_DOMINIO.vercel.app/v1/admin/create-admin
```

**Resposta esperada:**
```json
{
  "message": "Usuário admin criado com sucesso",
  "email": "resper@gmail.com",
  "id": "...",
  "password": "cvdf2025"
}
```

### 4. Testar Login

1. Acesse: `https://SEU_DOMINIO.vercel.app/login`
2. Use:
   - **Email:** `resper@gmail.com`
   - **Senha:** `cvdf2025`

### 5. Remover Endpoints Temporários (Segurança)

⚠️ **IMPORTANTE:** Após executar migrations e criar o admin, **remova** os endpoints temporários:

- `POST /v1/admin/run-migrations`
- `POST /v1/admin/create-admin`

Ou proteja-os com autenticação admin.

## 🔍 Verificar se está funcionando:

### Testar Health Check:
```bash
curl https://SEU_DOMINIO.vercel.app/v1/health
```

### Testar API Docs:
```
https://SEU_DOMINIO.vercel.app/v1/docs
```

## 📝 Notas:

- **Connection String:** Usando `DATABASE_URL_NON_POOLING` (sem pooling) para migrations
- **Aplicação:** Pode usar connection string com pooling para melhor performance
- **Endpoints temporários:** Remover após setup inicial por segurança

## 🎯 Checklist Final:

- [ ] Deploy realizado
- [ ] Migrations executadas
- [ ] Usuário admin criado
- [ ] Login testado
- [ ] Endpoints temporários removidos/protegidos
- [ ] Sistema funcionando

