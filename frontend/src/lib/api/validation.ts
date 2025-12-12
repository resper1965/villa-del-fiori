import { supabase } from "@/lib/supabase/client"

export interface ValidationResult {
  entity_name: string
  exists: boolean
  is_complete: boolean
  missing_fields: string[]
  entity_id?: string
  process_id?: string
  process_name?: string
}

export interface ValidationResponse {
  success: boolean
  valid: boolean
  results: ValidationResult[]
  stats: {
    total: number
    valid: number
    missing: number
    incomplete: number
  }
}

export interface IntegrityMetrics {
  total_entities: number
  complete_entities: number
  incomplete_entities: number
  total_processes: number
  processes_with_valid_entities: number
  processes_with_invalid_entities: number
  orphaned_entities: number
}

export const validationApi = {
  // Validar lista de entidades
  async validateEntities(entityNames: string[]): Promise<ValidationResponse> {
    const { data, error } = await supabase.functions.invoke("validate-entities", {
      body: {
        entity_names: entityNames,
      },
    })

    if (error) {
      throw new Error(`Erro ao validar entidades: ${error.message}`)
    }

    if (!data || !data.success) {
      throw new Error(data?.error || "Erro desconhecido ao validar entidades")
    }

    return data
  },

  // Validar entidades de um processo específico
  async validateProcess(processId: string): Promise<ValidationResponse> {
    const { data, error } = await supabase.functions.invoke("validate-entities", {
      body: {
        process_id: processId,
      },
    })

    if (error) {
      throw new Error(`Erro ao validar processo: ${error.message}`)
    }

    if (!data || !data.success) {
      throw new Error(data?.error || "Erro desconhecido ao validar processo")
    }

    return data
  },

  // Validação em lote de todos os processos
  async validateAllProcesses(): Promise<ValidationResponse> {
    const { data, error } = await supabase.functions.invoke("validate-entities", {
      body: {
        batch: true,
      },
    })

    if (error) {
      throw new Error(`Erro na validação em lote: ${error.message}`)
    }

    if (!data || !data.success) {
      throw new Error(data?.error || "Erro desconhecido na validação em lote")
    }

    return data
  },

  // Obter métricas de integridade
  async getIntegrityMetrics(): Promise<IntegrityMetrics> {
    const { data, error } = await supabase.functions.invoke("integrity-metrics", {})

    if (error) {
      throw new Error(`Erro ao buscar métricas: ${error.message}`)
    }

    if (!data || !data.success) {
      throw new Error(data?.error || "Erro desconhecido ao buscar métricas")
    }

    return data.metrics
  },
}

