export interface DetectedEntity {
  name: string
  category?: string
  suggested_type: "pessoa" | "empresa" | "servico_emergencia" | "infraestrutura"
  context?: string
}

export interface WorkflowStep {
  order: number
  description: string
  role?: string
  sla?: string
  periodicity?: string
}

export interface RACIEntry {
  step: string
  responsible: string[]
  accountable: string[]
  consulted: string[]
  informed: string[]
}

export interface ContractExtractionResponse {
  suggested_title: string
  suggested_description: string
  detected_entities: DetectedEntity[]
  steps: WorkflowStep[]
  raci: RACIEntry[]
  ambiguities: string[]
  suggested_category?: string
  suggested_document_type?: string
}

