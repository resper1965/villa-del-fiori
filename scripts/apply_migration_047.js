#!/usr/bin/env node

/**
 * Script para aplicar a migration 047_enforce_single_condominium.sql
 * via API do Supabase
 * 
 * Uso:
 *   SUPABASE_URL=https://seu-projeto.supabase.co \
 *   SUPABASE_SERVICE_KEY=sua-service-key \
 *   node scripts/apply_migration_047.js
 */

const fs = require('fs');
const path = require('path');

// Ler variáveis de ambiente
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente necessárias:');
  console.error('   SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_KEY');
  console.error('');
  console.error('Exemplo:');
  console.error('  SUPABASE_URL=https://xxx.supabase.co \\');
  console.error('  SUPABASE_SERVICE_KEY=eyJ... \\');
  console.error('  node scripts/apply_migration_047.js');
  process.exit(1);
}

// Ler o arquivo de migration
const migrationPath = path.join(__dirname, '../supabase/migrations/047_enforce_single_condominium.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Executar SQL via API do Supabase
async function applyMigration() {
  try {
    console.log('🔄 Aplicando migration 047_enforce_single_condominium.sql...');
    console.log(`📍 Projeto: ${SUPABASE_URL}`);
    
    // Usar a API REST do Supabase para executar SQL
    // Nota: A API REST não suporta execução direta de SQL
    // Vamos usar o endpoint de RPC ou executar via psql se disponível
    
    // Alternativa: usar fetch para executar via API
    // Mas a API REST do Supabase não expõe endpoint para executar SQL arbitrário
    // Precisamos usar o Supabase CLI ou psql diretamente
    
    console.log('');
    console.log('⚠️  A API REST do Supabase não permite executar SQL arbitrário.');
    console.log('📋 Use uma das opções abaixo:');
    console.log('');
    console.log('Opção 1: Via Supabase CLI (recomendado)');
    console.log('  1. Link o projeto: supabase link --project-ref SEU_PROJECT_REF');
    console.log('  2. Execute: supabase db push');
    console.log('');
    console.log('Opção 2: Via Supabase Dashboard');
    console.log('  1. Acesse: https://supabase.com/dashboard');
    console.log('  2. Vá em SQL Editor');
    console.log('  3. Cole o conteúdo do arquivo:');
    console.log(`     ${migrationPath}`);
    console.log('  4. Execute a query');
    console.log('');
    console.log('Opção 3: Via psql (se tiver acesso direto)');
    console.log('  psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"');
    console.log('  \\i supabase/migrations/047_enforce_single_condominium.sql');
    console.log('');
    
    // Mostrar o SQL para facilitar
    console.log('📄 Conteúdo da migration:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error.message);
    process.exit(1);
  }
}

applyMigration();

