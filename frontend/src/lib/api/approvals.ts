import { apiClient } from "./client"

export interface ApprovalCreate {
  comments?: string
  approval_type?: "aprovado" | "aprovado_com_ressalvas"
  ressalvas?: string
}

export interface RejectionCreate {
  reason: string
  additional_comments?: string
}

export interface ApprovalResponse {
  id: string
  process_id: string
  version_id: string
  stakeholder_id: string
  approved_at: string
  comments?: string
  approval_type: string
  ressalvas?: string
}

export interface RejectionResponse {
  id: string
  process_id: string
  version_id: string
  stakeholder_id: string
  rejected_at: string
  reason: string
  additional_comments?: string
  addressed_in_version_id?: string
}

export const approvalsApi = {
  // Aprovar processo
  approve: async (
    processId: string | number,
    versionId: string | number,
    data: ApprovalCreate
  ): Promise<ApprovalResponse> => {
    const response = await apiClient.post(
      `/approvals/processes/${processId}/versions/${versionId}/approve`,
      data
    )
    return response.data
  },

  // Rejeitar processo
  reject: async (
    processId: string | number,
    versionId: string | number,
    data: RejectionCreate
  ): Promise<RejectionResponse> => {
    const response = await apiClient.post(
      `/approvals/processes/${processId}/versions/${versionId}/reject`,
      data
    )
    return response.data
  },

  // Listar aprovações de um processo
  getProcessApprovals: async (processId: string | number): Promise<ApprovalResponse[]> => {
    const response = await apiClient.get(`/approvals/processes/${processId}/approvals`)
    return response.data
  },

  // Listar rejeições de um processo
  getProcessRejections: async (processId: string | number): Promise<RejectionResponse[]> => {
    const response = await apiClient.get(`/approvals/processes/${processId}/rejections`)
    return response.data
  },
}

