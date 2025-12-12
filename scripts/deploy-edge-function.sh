#!/bin/bash
# Script para fazer deploy da Edge Function de notificações via Supabase CLI
# 
# Pré-requisitos:
# 1. Ter o Supabase CLI instalado: npm install -g supabase
# 2. Estar autenticado: supabase login
# 3. Ter o projeto linkado: supabase link --project-ref <project-ref>
# 
# Ou configurar o token de acesso:
# export SUPABASE_ACCESS_TOKEN=sbp_xxxxx
# 
# Uso:
# ./scripts/deploy-edge-function.sh

set -e

PROJECT_REF="obyrjbhomqtepebykavb"
FUNCTION_NAME="notifications"

echo "🚀 Fazendo deploy da Edge Function: $FUNCTION_NAME"
echo "📦 Project Ref: $PROJECT_REF"
echo ""

# Verificar se está autenticado
if ! supabase projects list &>/dev/null; then
    echo "❌ Erro: Não está autenticado no Supabase CLI"
    echo ""
    echo "Para autenticar, execute:"
    echo "  supabase login"
    echo ""
    echo "Ou configure o token de acesso:"
    echo "  export SUPABASE_ACCESS_TOKEN=sbp_xxxxx"
    echo ""
    exit 1
fi

# Verificar se o projeto está linkado
if ! supabase status &>/dev/null; then
    echo "⚠️  Projeto não está linkado. Tentando linkar..."
    supabase link --project-ref "$PROJECT_REF" || {
        echo "❌ Erro ao linkar projeto. Verifique se tem acesso ao projeto."
        exit 1
    }
fi

# Fazer deploy
echo "📤 Fazendo upload e deploy..."
supabase functions deploy "$FUNCTION_NAME" --project-ref "$PROJECT_REF" --no-verify-jwt

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "A Edge Function está disponível em:"
echo "  https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME"

