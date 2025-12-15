#!/bin/bash

# Script para aplicar a migration 047 via Supabase CLI
# Uso: ./scripts/apply_migration_via_cli.sh [project-ref]

set -e

PROJECT_REF="${1:-hyplrlakowbwntkidtcp}"
MIGRATION_FILE="supabase/migrations/047_enforce_single_condominium.sql"

echo "🔄 Aplicando migration 047_enforce_single_condominium.sql..."
echo "📍 Projeto: $PROJECT_REF"
echo ""

# Verificar se o arquivo existe
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Erro: Arquivo de migration não encontrado: $MIGRATION_FILE"
    exit 1
fi

# Tentar executar via Supabase CLI
echo "📤 Executando SQL via Supabase CLI..."
if supabase db execute --project-ref "$PROJECT_REF" < "$MIGRATION_FILE"; then
    echo ""
    echo "✅ Migration aplicada com sucesso!"
    echo ""
    echo "🔍 Verificando se foi aplicada corretamente..."
    echo ""
    # Verificar se a função foi criada
    supabase db execute --project-ref "$PROJECT_REF" <<EOF
SELECT 
    routine_name, 
    routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'check_single_active_condominium';
EOF
    echo ""
    echo "✅ Verificação concluída!"
else
    echo ""
    echo "❌ Erro ao aplicar migration."
    echo ""
    echo "💡 Possíveis causas:"
    echo "   - Projeto está pausado (despause no dashboard)"
    echo "   - Sem permissões adequadas"
    echo "   - Erro de conexão"
    echo ""
    echo "📋 Alternativa: Aplique manualmente via Supabase Dashboard:"
    echo "   1. Acesse: https://supabase.com/dashboard/project/$PROJECT_REF"
    echo "   2. Vá em SQL Editor"
    echo "   3. Cole o conteúdo de: $MIGRATION_FILE"
    echo "   4. Execute a query"
    exit 1
fi

