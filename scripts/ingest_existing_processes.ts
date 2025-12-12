// Script: Ingerir Processos Existentes na Base de Conhecimento
// Descrição: Busca todos os processos aprovados e os ingere na base de conhecimento
// Uso: tsx scripts/ingest_existing_processes.ts

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ingest-process`

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente necessárias:')
  console.error('   SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function ingestExistingProcesses() {
  console.log('🚀 Iniciando ingestão de processos existentes...\n')

  try {
    // 1. Buscar todos os processos aprovados
    console.log('📋 Buscando processos aprovados...')
    const { data: processes, error: processesError } = await supabase
      .from('processes')
      .select('id, name, status, current_version_number')
      .eq('status', 'aprovado')

    if (processesError) {
      throw new Error(`Erro ao buscar processos: ${processesError.message}`)
    }

    if (!processes || processes.length === 0) {
      console.log('✅ Nenhum processo aprovado encontrado.')
      return
    }

    console.log(`✅ Encontrados ${processes.length} processos aprovados\n`)

    // 2. Para cada processo, buscar versão atual e ingerir
    let successCount = 0
    let errorCount = 0

    for (const process of processes) {
      try {
        console.log(`📄 Processando: ${process.name} (${process.id})`)

        // Buscar versão atual do processo
        const { data: version, error: versionError } = await supabase
          .from('process_versions')
          .select('id')
          .eq('process_id', process.id)
          .eq('version_number', process.current_version_number)
          .single()

        if (versionError || !version) {
          console.error(`   ⚠️  Versão não encontrada: ${versionError?.message}`)
          errorCount++
          continue
        }

        // Chamar Edge Function para ingerir
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            process_id: process.id,
            process_version_id: version.id,
          }),
        })

        if (!response.ok) {
          const error = await response.text()
          console.error(`   ❌ Erro ao ingerir: ${error}`)
          errorCount++
          continue
        }

        const result = await response.json()
        console.log(`   ✅ Ingerido com sucesso (${result.chunks_ingested} chunks)`)
        successCount++

        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error: any) {
        console.error(`   ❌ Erro ao processar ${process.name}: ${error.message}`)
        errorCount++
      }
    }

    // 3. Resumo
    console.log('\n' + '='.repeat(50))
    console.log('📊 Resumo da Ingestão:')
    console.log(`   ✅ Sucesso: ${successCount}`)
    console.log(`   ❌ Erros: ${errorCount}`)
    console.log(`   📄 Total: ${processes.length}`)
    console.log('='.repeat(50))

    // 4. Criar índice vetorial se ainda não existe
    console.log('\n🔍 Verificando índice vetorial...')
    const { data: indexExists } = await supabase.rpc('pg_indexes', {
      tablename: 'knowledge_base_documents',
      indexname: 'idx_kb_docs_embedding',
    })

    if (!indexExists || indexExists.length === 0) {
      console.log('📊 Criando índice vetorial IVFFlat...')
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_kb_docs_embedding 
          ON knowledge_base_documents 
          USING ivfflat (embedding vector_cosine_ops) 
          WITH (lists = 100);
        `,
      })

      if (indexError) {
        console.error('   ⚠️  Erro ao criar índice (pode ser normal se não houver dados):', indexError.message)
        console.log('   💡 Execute manualmente após ter dados na tabela:')
        console.log('      CREATE INDEX idx_kb_docs_embedding ON knowledge_base_documents')
        console.log('      USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);')
      } else {
        console.log('   ✅ Índice criado com sucesso')
      }
    } else {
      console.log('   ✅ Índice já existe')
    }

    console.log('\n✅ Ingestão concluída!')
  } catch (error: any) {
    console.error('\n❌ Erro fatal:', error.message)
    process.exit(1)
  }
}

// Executar
ingestExistingProcesses()





