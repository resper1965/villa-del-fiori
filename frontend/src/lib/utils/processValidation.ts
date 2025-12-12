import { Process } from "@/types"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Valida se um processo está completo e pode ser enviado para aprovação
 */
export function validateProcessForSubmission(process: Process | null | undefined): ValidationResult {
  const errors: string[] = []

  if (!process) {
    return {
      isValid: false,
      errors: ["Processo não encontrado"],
    }
  }

  // Validar nome
  if (!process.name || process.name.trim().length < 3) {
    errors.push("Nome do processo deve ter pelo menos 3 caracteres")
  }

  // Validar categoria
  if (!process.category) {
    errors.push("Categoria é obrigatória")
  }

  // Validar tipo de documento
  if (!process.document_type) {
    errors.push("Tipo de documento é obrigatório")
  }

  // Validar descrição (mínimo de conteúdo)
  if (!process.description || process.description.trim().length < 10) {
    errors.push("Descrição deve ter pelo menos 10 caracteres")
  }

  // Validar que tem versão atual
  if (!process.current_version_number || process.current_version_number < 1) {
    errors.push("Processo deve ter uma versão válida")
  }

  // Validar status
  if (process.status !== "rascunho") {
    errors.push("Apenas processos em rascunho podem ser enviados para aprovação")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida se um processo pode ser editado
 */
export function canEditProcess(process: Process | null | undefined, isCreator: boolean): ValidationResult {
  const errors: string[] = []

  if (!process) {
    return {
      isValid: false,
      errors: ["Processo não encontrado"],
    }
  }

  if (!isCreator) {
    errors.push("Apenas o criador do processo pode editá-lo")
  }

  if (process.status !== "rascunho") {
    errors.push("Apenas processos em rascunho podem ser editados")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}



