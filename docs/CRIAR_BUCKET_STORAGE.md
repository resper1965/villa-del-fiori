# Como Criar Bucket de Storage para Documentos

**Data**: 2025-01-15  
**Motivo**: Armazenar arquivos originais de documentos (PDF, DOCX, etc.)

---

## 🔧 Passo a Passo

### Via Supabase Dashboard

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Storage** (menu lateral)
4. Clique em **"New bucket"**
5. Preencha:
   - **Name**: `documents`
   - **Public bucket**: ❌ **Desmarcado** (privado)
   - **File size limit**: `10485760` (10MB em bytes)
   - **Allowed MIME types**: 
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `text/plain`
     - `text/markdown`
6. Clique em **"Create bucket"**

### Configurar Políticas RLS

Após criar o bucket, configure as políticas RLS:

1. Vá em **Storage** → **Policies** → **documents**
2. Clique em **"New policy"**

#### Política 1: Upload (INSERT)

- **Policy name**: `Users can upload documents`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(select auth.uid()) = (storage.foldername(name))[1]::uuid
OR EXISTS (
  SELECT 1 FROM auth.users
  WHERE auth.users.id = (select auth.uid())
  AND (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
)
```

#### Política 2: Visualização (SELECT)

- **Policy name**: `Authenticated users can view documents`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
true
```

#### Política 3: Remoção (DELETE)

- **Policy name**: `Admins can delete documents`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
EXISTS (
  SELECT 1 FROM auth.users
  WHERE auth.users.id = (select auth.uid())
  AND (auth.users.raw_app_meta_data->>'user_role')::text = 'admin'
)
```

---

## ⚠️ Nota Importante

**O sistema funciona SEM o bucket de storage!**

- Se o bucket não existir, o sistema apenas extrai o conteúdo do arquivo
- O arquivo original não será armazenado, mas o conteúdo extraído será salvo no campo `content` da tabela `documents`
- O upload para storage é **opcional** e serve apenas para manter o arquivo original para download futuro

---

## 🧪 Testar

1. Acesse `/documents`
2. Clique em "Novo Documento"
3. Faça upload de um arquivo PDF ou DOCX
4. Verifique se o conteúdo foi extraído e preenchido no campo de conteúdo
5. Salve o documento

---

**Última Atualização**: 2025-01-15

