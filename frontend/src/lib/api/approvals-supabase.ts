import { supabase } from "@/lib/supabase/client"

export interface ApprovalCreate {
  comments?: string
  approval_type?: "aprovado" | "aprovado_com_ressalvas"
  ressalvas?: string
}

export interface RejectionCreate {
  reason: string
  additional_comments?: string
}

export const approvalsApiSupabase = {
  // Aprovar processo
  approve: async (
    processId: string | number,
    versionId: string | number,
    data: ApprovalCreate
  ) => {
    // Obter usuário atual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Buscar stakeholder do usuário
    const { data: stakeholder, error: stakeholderError } = await supabase
      .from("stakeholders")
      .select("id")
      .eq("email", user.email)
      .single()

    if (stakeholderError || !stakeholder) {
      throw new Error("Stakeholder not found for user")
    }

    // Criar aprovação
    const { data: approval, error: approvalError } = await supabase
      .from("approvals")
      .insert({
        process_id: processId.toString(),
        version_id: versionId.toString(),
        stakeholder_id: stakeholder.id,
        comments: data.comments || null,
        approval_type: data.approval_type || "aprovado",
        ressalvas: data.ressalvas || null,
        approved_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (approvalError) {
      console.error("Error creating approval:", approvalError)
      throw approvalError
    }

    // Atualizar status do processo e versão para "aprovado"
    const { error: processUpdateError } = await supabase
      .from("processes")
      .update({ status: "aprovado", updated_at: new Date().toISOString() })
      .eq("id", processId)

    if (processUpdateError) {
      console.error("Error updating process status:", processUpdateError)
      // Não falhar se apenas a atualização de status falhar
    }

    const { error: versionUpdateError } = await supabase
      .from("process_versions")
      .update({ status: "aprovado" })
      .eq("id", versionId)

    if (versionUpdateError) {
      console.error("Error updating version status:", versionUpdateError)
      // Não falhar se apenas a atualização de status falhar
    }

    return approval
  },

  // Rejeitar processo
  reject: async (
    processId: string | number,
    versionId: string | number,
    data: RejectionCreate
  ) => {
    // Obter usuário atual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Buscar stakeholder do usuário
    const { data: stakeholder, error: stakeholderError } = await supabase
      .from("stakeholders")
      .select("id")
      .eq("email", user.email)
      .single()

    if (stakeholderError || !stakeholder) {
      throw new Error("Stakeholder not found for user")
    }

    // Criar rejeição
    const { data: rejection, error: rejectionError } = await supabase
      .from("rejections")
      .insert({
        process_id: processId.toString(),
        version_id: versionId.toString(),
        stakeholder_id: stakeholder.id,
        reason: data.reason,
        additional_comments: data.additional_comments || null,
        rejected_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (rejectionError) {
      console.error("Error creating rejection:", rejectionError)
      throw rejectionError
    }

    // Atualizar status do processo e versão para "rejeitado"
    const { error: processUpdateError } = await supabase
      .from("processes")
      .update({ status: "rejeitado", updated_at: new Date().toISOString() })
      .eq("id", processId)

    if (processUpdateError) {
      console.error("Error updating process status:", processUpdateError)
    }

    const { error: versionUpdateError } = await supabase
      .from("process_versions")
      .update({ status: "rejeitado" })
      .eq("id", versionId)

    if (versionUpdateError) {
      console.error("Error updating version status:", versionUpdateError)
    }

    return rejection
  },

  // Buscar aprovações de um processo
  getProcessApprovals: async (processId: string | number) => {
    const { data, error } = await supabase
      .from("approvals")
      .select(`
        *,
        stakeholder:stakeholders(*)
      `)
      .eq("process_id", processId)
      .order("approved_at", { ascending: false })

    if (error) {
      console.error("Error fetching approvals:", error)
      throw error
    }

    return data || []
  },

  // Buscar rejeições de um processo
  getProcessRejections: async (processId: string | number) => {
    const { data, error } = await supabase
      .from("rejections")
      .select(`
        *,
        stakeholder:stakeholders(*)
      `)
      .eq("process_id", processId)
      .order("rejected_at", { ascending: false })

    if (error) {
      console.error("Error fetching rejections:", error)
      throw error
    }

    return data || []
  },
}

