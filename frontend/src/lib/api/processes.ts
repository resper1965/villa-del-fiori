import { apiClient } from "./client"
import { Process, ProcessDetailResponse, ProcessListResponse } from "@/types"

export const processesApi = {
  // Listar processos
  list: async (params?: {
    category?: string
    status?: string
    page?: number
    page_size?: number
  }): Promise<ProcessListResponse> => {
    const response = await apiClient.get("/processes", { params })
    return response.data
  },

  // Buscar processo por ID
  getById: async (id: string | number): Promise<ProcessDetailResponse> => {
    const response = await apiClient.get(`/processes/${id}`)
    return response.data
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
    const response = await apiClient.post("/processes", data)
    return response.data
  },

  // Atualizar processo
  update: async (
    id: string | number,
    data: {
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
    const response = await apiClient.put(`/processes/${id}`, data)
    return response.data
  },

  // Deletar processo
  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/processes/${id}`)
  },
}

