export type ProcessStatus = "rascunho" | "em_revisao" | "aprovado" | "rejeitado"

export type ProcessCategory =
  | "governanca"
  | "acesso_seguranca"
  | "operacao"
  | "areas_comuns"
  | "convivencia"
  | "eventos"
  | "emergencias"

export type DocumentType =
  | "pop"
  | "manual"
  | "regulamento"
  | "fluxograma"
  | "aviso"
  | "comunicado"
  | "checklist"
  | "formulario"
  | "politica"

export interface Process {
  id: string
  name: string
  category: ProcessCategory
  subcategory?: string
  document_type: DocumentType
  status: ProcessStatus
  current_version_number: number
  creator_id: string
  created_at: string
  updated_at: string
}

export interface ProcessVersion {
  id: string
  process_id: string
  version_number: number
  content: Record<string, unknown>
  status: ProcessStatus
  created_at: string
}

export interface Stakeholder {
  id: string
  name: string
  email: string
  type: string
  role: string
  is_active: boolean
}

export interface Approval {
  id: string
  process_id: string
  version_id: string
  stakeholder_id: string
  approved_at: string
  comments?: string
}

export interface Rejection {
  id: string
  process_id: string
  version_id: string
  stakeholder_id: string
  rejected_at: string
  reason: string
  additional_comments?: string
}


