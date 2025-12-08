import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { entitiesApi } from "@/lib/api/entities"
import { Entity, EntityCreate, EntityUpdate, EntityType, EntityCategory } from "@/types/entity"

export const useEntities = (params?: {
  type?: EntityType
  category?: EntityCategory
  is_active?: boolean
  search?: string
  page?: number
  page_size?: number
}) => {
  return useQuery({
    queryKey: ["entities", params],
    queryFn: () => entitiesApi.list(params),
    retry: 1,
    retryDelay: 1000,
  })
}

export const useEntity = (id: string | null) => {
  return useQuery({
    queryKey: ["entity", id],
    queryFn: () => entitiesApi.getById(id!),
    enabled: !!id,
    retry: 1,
    retryDelay: 1000,
  })
}

export const useCreateEntity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: entitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] })
    },
  })
}

export const useUpdateEntity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EntityUpdate }) =>
      entitiesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entities"] })
      queryClient.invalidateQueries({ queryKey: ["entity", variables.id] })
    },
  })
}

export const useDeleteEntity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: entitiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] })
    },
  })
}

