/**
 * Script para aprovar usuário no Supabase Auth
 * Uso: node scripts/approve_user.js <email>
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../frontend/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://obyrjbhomqtepebykavb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não definida');
  console.error('Configure a variável de ambiente SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function approveUser(email) {
  try {
    // Buscar usuário pelo email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
      process.exit(1);
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ Usuário com email ${email} não encontrado`);
      process.exit(1);
    }

    console.log(`📧 Encontrado usuário: ${user.email} (ID: ${user.id})`);

    // Atualizar app_metadata via Admin API
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      app_metadata: {
        user_role: 'admin',
        is_approved: true,
        approved_at: new Date().toISOString()
      }
    });

    if (error) {
      console.error('❌ Erro ao aprovar usuário:', error);
      process.exit(1);
    }

    console.log('✅ Usuário aprovado com sucesso!');
    console.log('   User ID:', data.user.id);
    console.log('   Email:', data.user.email);
    console.log('   App Metadata:', JSON.stringify(data.user.app_metadata, null, 2));
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
}

const email = process.argv[2] || 'resper@ness.com.br';
approveUser(email);

