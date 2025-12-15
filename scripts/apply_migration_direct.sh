#!/bin/bash

# Script para aplicar migration 047 diretamente via psql
# Requer: SUPABASE_DB_URL ou variáveis de conexão

set -e

PROJECT_REF="${1:-obyrjbhomqtepebykavb}"
MIGRATION_FILE="supabase/migrations/047_enforce_single_condominium.sql"

echo "🔄 Aplicando migration 047_enforce_single_condominium.sql..."
echo "📍 Projeto: $PROJECT_REF"
echo ""

# Verificar se o arquivo existe
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Erro: Arquivo de migration não encontrado: $MIGRATION_FILE"
    exit 1
fi

# Tentar usar supabase db push se o projeto estiver linkado
if supabase db push --linked 2>/dev/null; then
    echo "✅ Migration aplicada via supabase db push!"
    exit 0
fi

echo "⚠️  Não foi possível aplicar via CLI automaticamente."
echo ""
echo "📋 Por favor, aplique manualmente via Supabase Dashboard:"
echo ""
echo "   1. Acesse: https://supabase.com/dashboard/project/$PROJECT_REF"
echo "   2. Vá em SQL Editor"
echo "   3. Clique em New Query"
echo "   4. Cole o conteúdo abaixo:"
echo ""
echo "─────────────────────────────────────────────────────────"
cat "$MIGRATION_FILE"
echo "─────────────────────────────────────────────────────────"
echo ""
echo "   5. Clique em Run (ou pressione Ctrl+Enter)"
echo ""

