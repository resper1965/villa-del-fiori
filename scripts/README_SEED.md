# 🌱 Scripts de Seed de Processos

Scripts para migrar processos do arquivo mock (`frontend/src/data/processes.ts`) para o banco Supabase.

## 📋 Pré-requisitos

1. **Node.js** (para converter TypeScript → JSON)
2. **Python 3.8+** com biblioteca `supabase`:
   ```bash
   pip install supabase
   ```
3. **Variáveis de ambiente** ou argumentos:
   - `SUPABASE_URL`: URL do projeto Supabase
   - `SUPABASE_SERVICE_KEY`: Service Key (não anon key!)

## 🚀 Como Usar

### Opção 1: Usando JSON intermediário (Recomendado)

1. **Converter TypeScript para JSON**:
   ```bash
   node scripts/convert_processes_to_json.js
   ```
   Isso cria `scripts/processes.json`

2. **Migrar para Supabase**:
   ```bash
   # Usando variáveis de ambiente
   export SUPABASE_URL="https://obyrjbhomqtepebykavb.supabase.co"
   export SUPABASE_SERVICE_KEY="sua-service-key-aqui"
   python scripts/seed_processes_to_supabase.py
   
   # Ou usando argumentos
   python scripts/seed_processes_to_supabase.py \
     --url "https://obyrjbhomqtepebykavb.supabase.co" \
     --key "sua-service-key-aqui"
   ```

### Opção 2: Parse direto do TypeScript

```bash
python scripts/seed_processes_to_supabase.py \
  --url "https://obyrjbhomqtepebykavb.supabase.co" \
  --key "sua-service-key-aqui" \
  --file "frontend/src/data/processes.ts"
```

### Opção 3: Dry Run (simulação)

Para testar sem inserir dados:

```bash
python scripts/seed_processes_to_supabase.py --dry-run
```

## 📊 O que o script faz

1. ✅ Lê processos do arquivo mock
2. ✅ Converte formato frontend → formato banco
3. ✅ Cria stakeholder "Sistema" (se não existir)
4. ✅ Insere processos no banco
5. ✅ Cria versão inicial de cada processo
6. ✅ Pula processos que já existem (por nome)

## 🔍 Verificar Resultado

```sql
-- Ver total de processos
SELECT COUNT(*) FROM public.processes;

-- Ver processos por categoria
SELECT category, COUNT(*) 
FROM public.processes 
GROUP BY category;

-- Ver versões criadas
SELECT COUNT(*) FROM public.process_versions;
```

## ⚠️ Notas Importantes

- **Service Key**: Use a **Service Key** (role: service_role), não a anon key!
- **RLS**: O script usa service key, então RLS é bypassado
- **Duplicatas**: Processos com mesmo nome são pulados
- **Stakeholder**: Cria automaticamente stakeholder "Sistema" se não existir

## 🐛 Troubleshooting

### Erro: "Biblioteca 'supabase' não instalada"
```bash
pip install supabase
```

### Erro: "SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios"
Configure as variáveis de ambiente ou use `--url` e `--key`

### Erro: "Não foi possível criar stakeholder Sistema"
Verifique se você tem permissões no banco (service key deve ter acesso)

### Processos não aparecem no frontend
- Verifique se RLS está configurado corretamente
- Verifique se usuário está autenticado
- Verifique logs do Supabase

## 📝 Estrutura de Dados

O script converte:

| Frontend (mock) | Banco de Dados |
|----------------|----------------|
| `name` | `processes.name` |
| `category` (string) | `processes.category` (enum) |
| `documentType` | `processes.document_type` (enum) |
| `status` | `process_versions.status` |
| `description` | `process_versions.content.description` |
| `workflow` | `process_versions.content.workflow` |
| `entities` | `process_versions.entities_involved` |
| `variables` | `process_versions.variables_applied` |
| `mermaid_diagram` | `process_versions.content.mermaid_diagram` |
| `raci` | `process_versions.content.raci` |

## 🔄 Re-executar

O script é **idempotente**: pode ser executado múltiplas vezes sem criar duplicatas.

Processos com mesmo nome são automaticamente pulados.

