import { supabase } from "@/lib/supabase/client"
import { Process, ProcessDetailResponse, ProcessListResponse } from "@/types"

// Mapear categorias do banco para frontend
const categoryMap: Record<string, string> = {
  governanca: "Governança",
  acesso_seguranca: "Acesso e Segurança",
  operacao: "Operação",
  areas_comuns: "Áreas Comuns",
  convivencia: "Convivência",
  eventos: "Eventos",
  emergencias: "Emergências",
}

// Mapear categorias do frontend para banco
const reverseCategoryMap: Record<string, string> = Object.fromEntries(
  Object.entries(categoryMap).map(([k, v]) => [v, k])
)

// Função auxiliar para mapear processo do banco para o formato do frontend
const mapProcessFromDB = (dbProcess: any): Process => {
  const currentVersion = dbProcess.current_version || {}
  const content = currentVersion.content || {}
  
  // Extrair entities e variables dos campos JSONB
  const entities = currentVersion.entities_involved 
    ? (Array.isArray(currentVersion.entities_involved) 
        ? currentVersion.entities_involved 
        : Object.keys(currentVersion.entities_involved))
    : (content.entities || [])
  
  const variables = currentVersion.variables_applied
    ? (Array.isArray(currentVersion.variables_applied)
        ? currentVersion.variables_applied
        : Object.keys(currentVersion.variables_applied))
    : (content.variables || [])
  
  return {
    id: dbProcess.id,
    name: dbProcess.name,
    category: categoryMap[dbProcess.category] || dbProcess.category,
    subcategory: dbProcess.subcategory || undefined,
    document_type: dbProcess.document_type,
    status: dbProcess.status,
    current_version_number: currentVersion.version_number || dbProcess.current_version_number || 1,
    creator_id: dbProcess.creator_id,
    created_at: dbProcess.created_at,
    updated_at: dbProcess.updated_at,
    description: content.description || currentVersion.content_text || undefined,
    workflow: content.workflow || [],
    entities: entities,
    variables: variables,
    raci: content.raci || undefined,
  }
}

// Função auxiliar para fallback (fora do objeto para evitar referência circular)
async function getByIdFallback(id: string | number): Promise<ProcessDetailResponse> {
  // Buscar processo
  const { data: processData, error: processError } = await supabase
    .from("processes")
    .select("*")
    .eq("id", id)
    .single()

  if (processError) {
    console.error("Error fetching process:", processError)
    throw processError
  }

  // Buscar versões do processo
  const { data: versions, error: versionsError } = await supabase
    .from("process_versions")
    .select("*")
    .eq("process_id", id)
    .order("version_number", { ascending: false })

  if (versionsError) {
    console.error("Error fetching versions:", versionsError)
    throw versionsError
  }

  // Encontrar versão atual
  const currentVersion = versions?.find(
    (v) => v.version_number === processData.current_version_number
  ) || versions?.[0] || null

  const process = mapProcessFromDB({ ...processData, current_version: currentVersion })

  return {
    ...process,
    current_version: currentVersion
      ? {
          id: currentVersion.id,
          process_id: currentVersion.process_id,
          version_number: currentVersion.version_number,
          content: currentVersion.content || {},
          content_text: currentVersion.content_text,
          natural_description: currentVersion.natural_description,
          variables_applied: currentVersion.variables_applied || {},
          entities_involved: currentVersion.entities_involved || [],
          status: currentVersion.status || processData.status,
          created_by: currentVersion.created_by || processData.creator_id,
          created_at: currentVersion.created_at,
          change_summary: currentVersion.change_summary,
        }
      : undefined,
    versions: (versions || []).map((v: any) => ({
      id: v.id,
      process_id: v.process_id,
      version_number: v.version_number,
      content: v.content || {},
          content_text: v.content_text,
          natural_description: v.natural_description,
      variables_applied: v.variables_applied || {},
      entities_involved: v.entities_involved || [],
      status: v.status || processData.status,
      created_by: v.created_by,
      created_at: v.created_at,
      change_summary: v.change_summary,
    })),
  }
}

export const processesApiSupabase = {
  // Buscar estatísticas agregadas (otimizado para dashboard)
  getStatistics: async (): Promise<{
    total: number
    approved: number
    pending: number
    rejected: number
    draft: number
  }> => {
    // Query otimizada: usar contagens agregadas no banco (muito mais rápido)
    // Fazer queries paralelas para cada status
    const [totalResult, approvedResult, pendingResult, rejectedResult, draftResult] = await Promise.all([
      supabase.from("processes").select("*", { count: "exact", head: true }),
      supabase.from("processes").select("*", { count: "exact", head: true }).eq("status", "aprovado"),
      supabase.from("processes").select("*", { count: "exact", head: true }).eq("status", "em_revisao"),
      supabase.from("processes").select("*", { count: "exact", head: true }).eq("status", "rejeitado"),
      supabase.from("processes").select("*", { count: "exact", head: true }).eq("status", "rascunho"),
    ])

    // Verificar erros
    const errors = [totalResult.error, approvedResult.error, pendingResult.error, rejectedResult.error, draftResult.error].filter(Boolean)
    if (errors.length > 0) {
      console.error("Error fetching process statistics:", errors)
      throw errors[0]
    }

    const total = totalResult.count || 0
    const approved = approvedResult.count || 0
    const pending = (pendingResult.count || 0) + (draftResult.count || 0) // Incluir rascunhos em pendentes
    const rejected = rejectedResult.count || 0
    const draft = draftResult.count || 0

    return {
      total,
      approved,
      pending,
      rejected,
      draft,
    }
  },

  // Listar processos
  list: async (params?: {
    category?: string
    status?: string
    page?: number
    page_size?: number
  }): Promise<ProcessListResponse> => {
    const page = params?.page || 1
    const pageSize = Math.min(params?.page_size || 20, 50) // Limitar máximo a 50
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Construir query - OTIMIZADO: buscar apenas campos essenciais, SEM versões
    // Versões serão carregadas apenas na página de detalhes
    // Isso reduz drasticamente o tamanho da resposta (90%+ de redução)
    let query = supabase
      .from("processes")
      .select("id, name, category, subcategory, document_type, status, current_version_number, creator_id, created_at, updated_at", { count: "exact" })

    // Aplicar filtros
    if (params?.category) {
      const dbCategory = reverseCategoryMap[params.category] || params.category
      query = query.eq("category", dbCategory)
    }

    if (params?.status) {
      query = query.eq("status", params.status)
    }

    // Aplicar paginação
    query = query.range(from, to).order("created_at", { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching processes:", error)
      throw error
    }

    // Mapear processos - sem versões (otimização de performance)
    // Versões serão carregadas apenas na página de detalhes
    const items = (data || []).map((process: any) => {
      // Criar objeto básico sem versão completa (só metadados)
      return {
        id: process.id,
        name: process.name,
        category: categoryMap[process.category] || process.category,
        subcategory: process.subcategory || undefined,
        document_type: process.document_type,
        status: process.status,
        current_version_number: process.current_version_number || 1,
        creator_id: process.creator_id,
        created_at: process.created_at,
        updated_at: process.updated_at,
        description: undefined, // Não carregar na listagem
        workflow: [],
        entities: [],
        variables: [],
        raci: undefined,
      } as Process
    })
    
    const total = count || 0
    const totalPages = Math.ceil(total / pageSize)

    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: totalPages,
    }
  },

  // Buscar processo por ID (otimizado com join, com fallback)
  getById: async (id: string | number): Promise<ProcessDetailResponse> => {
    try {
      // Tentar buscar processo e versões em uma única query
      const { data: processData, error: processError } = await supabase
        .from("processes")
        .select(`
          *,
          versions:process_versions(
            *
          )
        `)
        .eq("id", id)
        .single()

      if (processError) {
        console.error("Error fetching process with join:", processError)
        // Fallback: buscar separadamente se o join falhar
        // Usar função local para evitar referência circular
        return await getByIdFallback(id)
      }

      // Ordenar versões por número (mais recente primeiro)
      const versions = (processData.versions || []).sort(
        (a: any, b: any) => b.version_number - a.version_number
      )

      // Encontrar versão atual
      const currentVersion = versions.find(
        (v: any) => v.version_number === processData.current_version_number
      ) || versions[0] || null

      const process = mapProcessFromDB({ ...processData, current_version: currentVersion })

  return {
    ...process,
    current_version: currentVersion
      ? {
          id: currentVersion.id,
          process_id: currentVersion.process_id,
          version_number: currentVersion.version_number,
          content: currentVersion.content || {},
          content_text: currentVersion.content_text,
          natural_description: currentVersion.natural_description,
          variables_applied: currentVersion.variables_applied || {},
          entities_involved: currentVersion.entities_involved || [],
          status: currentVersion.status || processData.status,
          created_by: currentVersion.created_by || processData.creator_id,
          created_at: currentVersion.created_at,
          change_summary: currentVersion.change_summary,
        }
      : undefined,
    versions: (versions || []).map((v: any) => ({
      id: v.id,
      process_id: v.process_id,
      version_number: v.version_number,
      content: v.content || {},
          content_text: v.content_text,
          natural_description: v.natural_description,
      variables_applied: v.variables_applied || {},
      entities_involved: v.entities_involved || [],
      status: v.status || processData.status,
      created_by: v.created_by,
      created_at: v.created_at,
      change_summary: v.change_summary,
    })),
  }
    } catch (error) {
      console.error("Error in getById:", error)
      // Fallback: buscar separadamente
      return await getByIdFallback(id)
    }
  },

  // Criar processo
  create: async (data: {
    name: string
    category: string
    subcategory?: string
    document_type: string
    description?: string
    workflow?: string[]
    entities?: string[]
    variables?: string[]
  }): Promise<Process> => {
    // Obter usuário atual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Buscar stakeholder do usuário
    const { data: stakeholder } = await supabase
      .from("stakeholders")
      .select("id")
      .eq("email", user.email)
      .single()

    if (!stakeholder) {
      throw new Error("Stakeholder not found for user")
    }

    const dbCategory = reverseCategoryMap[data.category] || data.category

    // Criar conteúdo da versão
    const content = {
      description: data.description || "",
      workflow: data.workflow || [],
      entities: data.entities || [],
      variables: data.variables || [],
    }

    // Criar processo
    const { data: process, error: processError } = await supabase
      .from("processes")
      .insert({
        name: data.name,
        category: dbCategory,
        subcategory: data.subcategory || null,
        document_type: data.document_type,
        status: "rascunho",
        creator_id: stakeholder.id,
      })
      .select()
      .single()

    if (processError) {
      console.error("Error creating process:", processError)
      throw processError
    }

    // Criar versão inicial
    const { data: version, error: versionError } = await supabase
      .from("process_versions")
      .insert({
        process_id: process.id,
        version_number: 1,
        content: content,
        content_text: data.description || null,
        entities_involved: data.entities || [],
        variables_applied: data.variables || [],
        created_by: stakeholder.id,
        status: "rascunho",
      })
      .select()
      .single()

    if (versionError) {
      console.error("Error creating version:", versionError)
      throw versionError
    }

    // Atualizar processo com current_version_number
    const { error: updateError } = await supabase
      .from("processes")
      .update({ current_version_number: 1 })
      .eq("id", process.id)

    if (updateError) {
      console.error("Error updating process:", updateError)
      throw updateError
    }

    return mapProcessFromDB({ ...process, current_version: version })
  },

  // Atualizar processo
  update: async (
    id: string | number,
    updateData: {
      name?: string
      category?: string
      subcategory?: string
      document_type?: string
      description?: string
      workflow?: string[]
      entities?: string[]
      variables?: string[]
      status?: string
    }
  ): Promise<Process> => {
    // Buscar processo atual
    const current = await processesApiSupabase.getById(id)

    // Preparar dados de atualização
    const processUpdate: any = {}
    if (updateData.name) processUpdate.name = updateData.name
    if (updateData.category) {
      processUpdate.category = reverseCategoryMap[updateData.category] || updateData.category
    }
    if (updateData.subcategory !== undefined) processUpdate.subcategory = updateData.subcategory
    if (updateData.document_type) processUpdate.document_type = updateData.document_type
    if (updateData.status) processUpdate.status = updateData.status

    // Atualizar processo
    const { data: process, error: processError } = await supabase
      .from("processes")
      .update(processUpdate)
      .eq("id", id)
      .select()
      .single()

    if (processError) {
      console.error("Error updating process:", processError)
      throw processError
    }

    // Se houver mudanças no conteúdo, criar nova versão
    const contentChanged =
      updateData.description !== undefined ||
      updateData.workflow !== undefined ||
      updateData.entities !== undefined ||
      updateData.variables !== undefined

    if (contentChanged && current.current_version) {
      const newContent = {
        description: updateData.description ?? current.description ?? "",
        workflow: updateData.workflow ?? current.workflow ?? [],
        entities: updateData.entities ?? current.entities ?? [],
        variables: updateData.variables ?? current.variables ?? [],
      }

      // Obter usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Buscar stakeholder do usuário
      const { data: stakeholder } = await supabase
        .from("stakeholders")
        .select("id")
        .eq("email", user.email)
        .single()

      if (!stakeholder) {
        throw new Error("Stakeholder not found for user")
      }

      // Criar nova versão
      const { data: version, error: versionError } = await supabase
        .from("process_versions")
        .insert({
          process_id: id.toString(),
          version_number: (current.current_version.version_number || 1) + 1,
          content: newContent,
          content_text: updateData.description || current.description || null,
          entities_involved: updateData.entities || current.entities || [],
          variables_applied: updateData.variables || current.variables || [],
          created_by: stakeholder.id,
          status: updateData.status || current.status,
        })
        .select()
        .single()

      if (versionError) {
        console.error("Error creating version:", versionError)
        throw versionError
      }

      // Atualizar processo com nova versão
      await supabase
        .from("processes")
        .update({ current_version_number: version.version_number })
        .eq("id", id)
    }

    // Buscar processo atualizado
    return processesApiSupabase.getById(id)
  },

  // Deletar processo
  delete: async (id: string | number): Promise<void> => {
    const { error } = await supabase.from("processes").delete().eq("id", id)

    if (error) {
      console.error("Error deleting process:", error)
      throw error
    }
  },

  // Enviar processo para aprovação
  submitForApproval: async (id: string | number): Promise<Process> => {
    // Obter usuário atual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Buscar processo atual
    const { data: process, error: processError } = await supabase
      .from("processes")
      .select("*")
      .eq("id", id)
      .single()

    if (processError || !process) {
      throw new Error("Process not found")
    }

    // Validar que processo está em rascunho
    if (process.status !== "rascunho") {
      throw new Error("Processo deve estar em rascunho para ser enviado para aprovação")
    }

    // Buscar stakeholder do usuário
    const { data: stakeholder } = await supabase
      .from("stakeholders")
      .select("id")
      .eq("email", user.email)
      .single()

    if (!stakeholder) {
      throw new Error("Stakeholder not found for user")
    }

    // Validar que usuário é o criador
    if (process.creator_id !== stakeholder.id) {
      throw new Error("Apenas o criador do processo pode enviá-lo para aprovação")
    }

    // Validar que processo tem versão atual
    if (!process.current_version_number) {
      throw new Error("Processo deve ter uma versão para ser enviado para aprovação")
    }

    // Atualizar status para "em_revisao"
    const { data: updatedProcess, error: updateError } = await supabase
      .from("processes")
      .update({
        status: "em_revisao",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating process status:", updateError)
      throw updateError
    }

    // Atualizar status da versão atual
    const { error: versionUpdateError } = await supabase
      .from("process_versions")
      .update({ status: "em_revisao" })
      .eq("process_id", id)
      .eq("version_number", process.current_version_number)

    if (versionUpdateError) {
      console.error("Error updating version status:", versionUpdateError)
      // Não falhar se apenas a atualização de versão falhar
    }

    // Buscar processo atualizado com versão
    return processesApiSupabase.getById(id)
  },

  // Refazer processo (criar nova versão baseada em rejeição)
  refactorProcess: async (id: string | number, changeSummary?: string): Promise<Process> => {
    // Obter usuário atual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Buscar processo atual
    const current = await processesApiSupabase.getById(id)

    // Validar que processo está rejeitado
    if (current.status !== "rejeitado") {
      throw new Error("Apenas processos rejeitados podem ser refeitos")
    }

    // Buscar stakeholder do usuário
    const { data: stakeholder } = await supabase
      .from("stakeholders")
      .select("id")
      .eq("email", user.email)
      .single()

    if (!stakeholder) {
      throw new Error("Stakeholder not found for user")
    }

    // Validar que usuário é o criador
    if (current.creator_id !== stakeholder.id) {
      throw new Error("Apenas o criador do processo pode refazê-lo")
    }

    // Validar que existe versão atual
    if (!current.current_version) {
      throw new Error("Processo deve ter uma versão atual para ser refeito")
    }

    // Calcular nova versão
    const newVersionNumber = (current.current_version_number || 1) + 1

    // Criar nova versão baseada na versão atual
    const newContent = {
      description: current.description || "",
      workflow: current.workflow || [],
      entities: current.entities || [],
      variables: current.variables || [],
    }

    const { data: newVersion, error: versionError } = await supabase
      .from("process_versions")
      .insert({
        process_id: id.toString(),
        version_number: newVersionNumber,
        content: newContent,
        content_text: current.description || null,
        entities_involved: current.entities || [],
        variables_applied: current.variables || [],
        previous_version_id: current.current_version.id,
        change_summary: changeSummary || null,
        created_by: stakeholder.id,
        status: "rascunho",
      })
      .select()
      .single()

    if (versionError) {
      console.error("Error creating new version:", versionError)
      throw versionError
    }

    // Atualizar processo com nova versão e status rascunho
    const { error: processUpdateError } = await supabase
      .from("processes")
      .update({
        current_version_number: newVersionNumber,
        status: "rascunho",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (processUpdateError) {
      console.error("Error updating process:", processUpdateError)
      throw processUpdateError
    }

    // Buscar processo atualizado
    return processesApiSupabase.getById(id)
  },
}

