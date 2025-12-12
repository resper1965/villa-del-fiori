// Script: Testar Ingestão de Processo
// Descrição: Testa a ingestão de um processo específico na base de conhecimento
// Uso: tsx scripts/test_ingestion.ts <process_id>

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente necessárias:')
  console.error('   SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const processId = process.argv[2]

async function testIngestion() {
  if (!processId) {
    console.error('❌ Forneça o ID do processo como argumento')
    console.error('   Uso: tsx scripts/test_ingestion.ts <process_id>')
    process.exit(1)
  }

  console.log(`🧪 Testando ingestão do processo: ${processId}\n`)

  try {
    // 1. Buscar processo
    console.log('📋 Buscando processo...')
    const { data: process, error: processError } = await supabase
      .from('processes')
      .select('id, name, status, current_version_number')
      .eq('id', processId)
      .single()

    if (processError || !process) {
      throw new Error(`Processo não encontrado: ${processError?.message}`)
    }

    console.log(`✅ Processo encontrado: ${process.name}`)
    console.log(`   Status: ${process.status}`)
    console.log(`   Versão atual: ${process.current_version_number}\n`)

    if (process.status !== 'aprovado') {
      console.error(`❌ Processo não está aprovado (status: ${process.status})`)
      console.error('   Apenas processos aprovados podem ser ingeridos.')
      process.exit(1)
    }

    // 2. Buscar versão
    console.log('📄 Buscando versão do processo...')
    const { data: version, error: versionError } = await supabase
      .from('process_versions')
      .select('id')
      .eq('process_id', process.id)
      .eq('version_number', process.current_version_number)
      .single()

    if (versionError || !version) {
      throw new Error(`Versão não encontrada: ${versionError?.message}`)
    }

    console.log(`✅ Versão encontrada: ${version.id}\n`)

    // 3. Chamar Edge Function
    console.log('🚀 Chamando Edge Function ingest-process...')
    const { data, error } = await supabase.functions.invoke('ingest-process', {
      body: {
        process_id: process.id,
        process_version_id: version.id,
      },
    })

    if (error) {
      throw error
    }

    console.log('✅ Ingestão concluída com sucesso!')
    console.log(`   Chunks ingeridos: ${data.chunks_ingested}\n`)

    // 4. Verificar documentos criados
    console.log('🔍 Verificando documentos criados...')
    const { data: documents, error: docsError } = await supabase
      .from('knowledge_base_documents')
      .select('id, chunk_type, chunk_index, content')
      .eq('process_id', process.id)
      .eq('process_version_id', version.id)
      .order('chunk_index')

    if (docsError) {
      console.error('⚠️  Erro ao verificar documentos:', docsError.message)
    } else {
      console.log(`✅ ${documents?.length || 0} documentos encontrados:`)
      documents?.forEach((doc) => {
        console.log(`   - ${doc.chunk_type} (índice ${doc.chunk_index}): ${doc.content.substring(0, 50)}...`)
      })
    }

    // 5. Verificar embeddings
    console.log('\n🔍 Verificando embeddings...')
    const { data: embeddingsCheck, error: embError } = await supabase
      .from('knowledge_base_documents')
      .select('id, chunk_type, embedding')
      .eq('process_id', process.id)
      .eq('process_version_id', version.id)
      .limit(1)
      .single()

    if (embError) {
      console.error('⚠️  Erro ao verificar embedding:', embError.message)
    } else if (embeddingsCheck?.embedding) {
      console.log('✅ Embedding encontrado e não é nulo')
    } else {
      console.error('❌ Embedding é nulo!')
    }

    console.log('\n✅ Teste concluído!')
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message)
    console.error(error)
    process.exit(1)
  }
}

testIngestion()

