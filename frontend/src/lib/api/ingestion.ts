import { apiClient } from "./client"
import { ContractExtractionResponse } from "@/types/ingestion"

export const ingestionApi = {
  analyzeContract: async (file: File): Promise<ContractExtractionResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post<ContractExtractionResponse>(
      "/ingestion/analyze",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 2 minutos para processamento de IA
      }
    )

    return response.data
  },
}

