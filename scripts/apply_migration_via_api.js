#!/usr/bin/env node

/**
 * Script para aplicar migration 047 via API do Supabase
 * Usa a Management API do Supabase para executar SQL
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'obyrjbhomqtepebykavb';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente necessárias:');
  console.error('   SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '../supabase/migrations/047_enforce_single_condominium.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

async function applyMigration() {
  try {
    console.log('🔄 Tentando aplicar migration via Management API...');
    console.log(`📍 Projeto: ${PROJECT_REF}`);
    console.log('');

    // A Management API do Supabase não expõe endpoint direto para executar SQL
    // Precisamos usar o endpoint de Database ou criar uma Edge Function
    // Por enquanto, vamos mostrar as opções disponíveis

    console.log('ℹ️  A Management API do Supabase não permite executar SQL arbitrário diretamente.');
    console.log('');
    console.log('📋 Opções disponíveis:');
    console.log('');
    console.log('1️⃣  Via Supabase Dashboard (Mais Simples)');
    console.log(`   👉 https://supabase.com/dashboard/project/${PROJECT_REF}/sql`);
    console.log('   - Cole o SQL e execute');
    console.log('');
    console.log('2️⃣  Via Supabase CLI (se tiver permissões)');
    console.log('   supabase link --project-ref ' + PROJECT_REF);
    console.log('   supabase db push');
    console.log('');
    console.log('3️⃣  Via psql (se tiver acesso direto)');
    console.log(`   psql "postgresql://postgres:[PASSWORD]@db.${PROJECT_REF}.supabase.co:5432/postgres"`);
    console.log('   \\i supabase/migrations/047_enforce_single_condominium.sql');
    console.log('');
    console.log('📄 SQL para copiar:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

applyMigration();

