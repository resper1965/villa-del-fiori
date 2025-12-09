// API de ingestão de contratos (funcionalidade futura)
// Por enquanto, esta funcionalidade não está implementada

import { ContractExtractionResponse } from "@/types/ingestion"

export const ingestionApi = {
  analyzeContract: async (file: File): Promise<ContractExtractionResponse> => {
    // TODO: Implementar via Edge Function quando necessário
    throw new Error("Funcionalidade de ingestão de contratos ainda não está implementada. Use o formulário manual para criar processos.")
  },
}

