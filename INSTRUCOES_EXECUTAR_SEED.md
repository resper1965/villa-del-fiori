# 🚀 Instruções para Executar Seed de Processos

## ✅ Status Atual

- ✅ Scripts criados
- ✅ JSON gerado com 35 processos
- ✅ Pronto para migrar para Supabase

## 📋 Pré-requisitos

1. **Biblioteca Python instalada**:
   ```bash
   pip3 install supabase
   ```

2. **Service Key do Supabase**:
   - Acesse: https://supabase.com/dashboard/project/obyrjbhomqtepebykavb/settings/api
   - Copie a **Service Key** (role: `service_role`)
   - ⚠️ **NÃO use a anon key!** Precisa ser a service key para bypassar RLS

## 🎯 Executar Migração

### Opção 1: Usando variáveis de ambiente

```bash
export SUPABASE_URL="https://obyrjbhomqtepebykavb.supabase.co"
export SUPABASE_SERVICE_KEY="sua-service-key-aqui"

python3 scripts/seed_processes_to_supabase.py
```

### Opção 2: Usando argumentos

```bash
python3 scripts/seed_processes_to_supabase.py \
  --url "https://obyrjbhomqtepebykavb.supabase.co" \
  --key "sua-service-key-aqui"
```

## 📊 O que será feito

1. ✅ Criar stakeholder "Sistema" (se não existir)
2. ✅ Inserir 35 processos no banco
3. ✅ Criar versão inicial de cada processo
4. ✅ Pular processos duplicados (por nome)

## 🔍 Verificar Resultado

Após executar, verifique no Supabase:

```sql
-- Total de processos
SELECT COUNT(*) FROM public.processes;
-- Deve retornar 35

-- Por categoria
SELECT category, COUNT(*) 
FROM public.processes 
GROUP BY category;

-- Verificar versões
SELECT COUNT(*) FROM public.process_versions;
-- Deve retornar 35 (uma versão por processo)
```

## ⚠️ Importante

- O script é **idempotente**: pode executar múltiplas vezes sem criar duplicatas
- Processos com mesmo nome são automaticamente pulados
- Use a **Service Key**, não a anon key!

## 🐛 Troubleshooting

### Erro: "Biblioteca 'supabase' não instalada"
```bash
pip3 install supabase
```

### Erro: "SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios"
Configure as variáveis de ambiente ou use `--url` e `--key`

### Erro de permissão
Verifique se está usando a **Service Key** (não anon key)

