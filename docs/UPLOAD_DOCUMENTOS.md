# Upload e Extração de Documentos

**Data**: 2025-01-15  
**Status**: ✅ **IMPLEMENTADO**

---

## ✅ Funcionalidades Implementadas

### 1. **Upload de Arquivos**

O sistema agora suporta upload de arquivos com extração automática de conteúdo:

- ✅ **PDF** (.pdf) - Extração de texto via `pdf-parse`
- ✅ **DOCX** (.docx) - Extração de texto via `mammoth`
- ✅ **TXT** (.txt) - Leitura direta
- ✅ **MD** (.md) - Leitura direta
- ⚠️ **DOC** (.doc) - Não suportado (formato antigo)

### 2. **Extração Automática**

Quando um arquivo é enviado:
1. O sistema valida o tipo e tamanho (máx. 10MB)
2. Extrai o conteúdo automaticamente
3. Preenche o campo de conteúdo com o texto extraído
4. Permite edição do conteúdo extraído antes de salvar

### 3. **Armazenamento**

- Arquivos são salvos no Supabase Storage (bucket `documents`)
- Caminho: `documents/{user_id}/{timestamp}-{random}.{ext}`
- Metadados salvos na tabela `documents`:
  - `file_path`: Caminho no storage
  - `file_size`: Tamanho em bytes
  - `mime_type`: Tipo MIME do arquivo

### 4. **Cópia e Cola Manual**

- Usuário pode copiar e colar conteúdo diretamente
- Funciona em conjunto com upload (pode editar conteúdo extraído)

---

## 🔧 Implementação Técnica

### API Route: `/api/extract-text`

**Arquivo**: `frontend/src/app/api/extract-text/route.ts`

**Funcionalidades**:
- Recebe arquivo via FormData
- Extrai texto de PDF, DOCX, TXT, MD
- Retorna JSON com texto extraído

**Bibliotecas**:
- `pdf-parse`: Extração de PDF
- `mammoth`: Extração de DOCX

### Componente: `DocumentForm`

**Arquivo**: `frontend/src/components/documents/DocumentForm.tsx`

**Funcionalidades**:
- Campo de upload de arquivo
- Validação de tipo e tamanho
- Extração automática via API
- Preview do conteúdo extraído
- Edição do conteúdo antes de salvar

### Storage: Supabase Bucket

**Bucket**: `documents`

**Políticas RLS**:
- ✅ Usuários autenticados podem fazer upload
- ✅ Usuários autenticados podem visualizar
- ✅ Usuários podem deletar seus próprios arquivos
- ✅ Admins podem deletar qualquer arquivo

---

## 📋 Fluxo de Uso

### Upload de Arquivo

1. **Usuário acessa** `/documents`
2. **Clica em "Novo Documento"**
3. **Preenche título, tipo e categoria**
4. **Faz upload de arquivo** (PDF, DOCX, TXT, MD)
5. **Sistema extrai conteúdo automaticamente**
6. **Usuário pode editar o conteúdo extraído**
7. **Salva documento** → Arquivo é salvo no Storage e conteúdo na tabela

### Cópia e Cola Manual

1. **Usuário acessa** `/documents`
2. **Clica em "Novo Documento"**
3. **Preenche título, tipo e categoria**
4. **Copia e cola conteúdo** no campo de texto
5. **Salva documento** → Conteúdo é salvo na tabela

---

## ⚙️ Configuração

### Bucket de Storage

O bucket `documents` já está criado no Supabase com:
- Limite de tamanho: 10MB
- Tipos permitidos: PDF, DOCX, DOC, TXT, MD
- Público: Não (requer autenticação)

### Dependências

As seguintes bibliotecas foram instaladas:
- `pdf-parse@^2.4.5`
- `mammoth@^1.11.0`

---

## 🎯 Limitações Conhecidas

1. **DOC não suportado**: Arquivos .doc (formato antigo do Word) não são suportados. Usuário deve converter para .docx ou copiar conteúdo manualmente.

2. **Tamanho máximo**: 10MB por arquivo

3. **PDF com imagens**: PDFs que contêm apenas imagens (sem texto) não terão conteúdo extraído. O sistema retornará erro.

4. **PDF escaneado**: PDFs escaneados (imagens de texto) não são processados por OCR. Apenas PDFs com texto selecionável funcionam.

---

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras

1. **OCR para PDFs escaneados**:
   - Integrar Tesseract.js ou API de OCR
   - Processar PDFs que são imagens

2. **Suporte a mais formatos**:
   - ODT (OpenDocument Text)
   - RTF (Rich Text Format)

3. **Preview de arquivos**:
   - Visualizar PDF antes de salvar
   - Preview de DOCX

4. **Upload múltiplo**:
   - Permitir upload de vários arquivos de uma vez
   - Processar em lote

---

**Última Atualização**: 2025-01-15

