import { apiClient } from "./client"
import { Entity, EntityCreate, EntityUpdate, EntityListResponse, EntityType, EntityCategory } from "@/types/entity"

export const entitiesApi = {
  list: async (params?: {
    type?: EntityType
    category?: EntityCategory
    is_active?: boolean
    search?: string
    page?: number
    page_size?: number
  }): Promise<EntityListResponse> => {
    const response = await apiClient.get<EntityListResponse>("/entities", { params })
    return response.data
  },

  getById: async (id: string): Promise<Entity> => {
    const response = await apiClient.get<Entity>(`/entities/${id}`)
    return response.data
  },

  create: async (data: EntityCreate): Promise<Entity> => {
    const response = await apiClient.post<Entity>("/entities", data)
    return response.data
  },

  update: async (id: string, data: EntityUpdate): Promise<Entity> => {
    const response = await apiClient.put<Entity>(`/entities/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/entities/${id}`)
  },
}

