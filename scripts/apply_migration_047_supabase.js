#!/usr/bin/env node

/**
 * Script para aplicar a migration 047 via API do Supabase
 * Equivalente a usar MCP do Supabase
 * 
 * Uso:
 *   SUPABASE_URL=https://obyrjbhomqtepebykavb.supabase.co \
 *   SUPABASE_SERVICE_KEY=sua-service-key \
 *   node scripts/apply_migration_047_supabase.js
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
  process.exit(1);
}

// Ler o arquivo de migration
const migrationPath = path.join(__dirname, '../supabase/migrations/047_enforce_single_condominium.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Executar SQL via API REST do Supabase usando RPC
async function applyMigration() {
  try {
    console.log('🔄 Aplicando migration 047_enforce_single_condominium.sql...');
    console.log(`📍 Projeto: ${SUPABASE_URL}`);
    console.log('');

    // A API REST do Supabase não permite executar SQL arbitrário diretamente
    // Precisamos usar o endpoint de Management API ou executar via psql
    // Vou criar uma função RPC temporária para executar o SQL
    
    // Dividir o SQL em comandos individuais
    const sqlCommands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log('⚠️  A API REST do Supabase não permite executar SQL arbitrário.');
    console.log('📋 Use uma das opções abaixo:');
    console.log('');
    console.log('Opção 1: Via Supabase Dashboard (Recomendado)');
    console.log(`   1. Acesse: https://supabase.com/dashboard/project/obyrjbhomqtepebykavb`);
    console.log('   2. Vá em SQL Editor → New Query');
    console.log('   3. Cole o SQL abaixo e execute:');
    console.log('');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log('');
    console.log('Opção 2: Via Supabase CLI (se tiver permissões)');
    console.log('   supabase db push');
    console.log('');
    console.log('Opção 3: Via psql (se tiver acesso direto ao banco)');
    console.log('   psql "postgresql://postgres:[PASSWORD]@db.obyrjbhomqtepebykavb.supabase.co:5432/postgres"');
    console.log('   \\i supabase/migrations/047_enforce_single_condominium.sql');
    console.log('');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

applyMigration();

