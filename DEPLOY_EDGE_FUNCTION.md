# Deploy da Edge Function de Notificações

## Opção 1: Via Supabase CLI (Recomendado)

### Pré-requisitos
1. Ter o Supabase CLI instalado:
   ```bash
   npm install -g supabase
   ```

2. Autenticar no Supabase:
   ```bash
   supabase login
   ```
   Isso abrirá o navegador para autenticação.

3. Linkar o projeto:
   ```bash
   supabase link --project-ref obyrjbhomqtepebykavb
   ```

4. Fazer deploy:
   ```bash
   supabase functions deploy notifications --project-ref obyrjbhomqtepebykavb --no-verify-jwt
   ```

### Ou usar o script automatizado:
```bash
./scripts/deploy-edge-function.sh
```

## Opção 2: Via Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard/project/obyrjbhomqtepebykavb
2. Vá em **Edge Functions** no menu lateral
3. Clique em **Create a new function** ou selecione **notifications**
4. Cole o conteúdo de `supabase/functions/notifications/index.ts`
5. Clique em **Deploy**

## Opção 3: Via API (com token de acesso)

1. Obter token de acesso:
   - Acesse: https://supabase.com/dashboard/account/tokens
   - Crie um novo token de acesso

2. Configurar variável de ambiente:
   ```bash
   export SUPABASE_ACCESS_TOKEN=sbp_xxxxx
   ```

3. Fazer deploy:
   ```bash
   supabase functions deploy notifications --project-ref obyrjbhomqtepebykavb --no-verify-jwt
   ```

## Verificar Deploy

Após o deploy, teste a função:
```bash
curl -X GET "https://obyrjbhomqtepebykavb.supabase.co/functions/v1/notifications/unread-count" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Troubleshooting

### Erro: "Your account does not have the necessary privileges"
- Verifique se está autenticado: `supabase login`
- Verifique se tem acesso ao projeto no dashboard do Supabase
- Tente usar o token de acesso diretamente

### Erro: "project is paused"
- Acesse o dashboard do Supabase e despause o projeto

### Erro: "Cannot find project ref"
- Verifique se o project ref está correto: `obyrjbhomqtepebykavb`
- Tente linkar o projeto novamente: `supabase link --project-ref obyrjbhomqtepebykavb`
