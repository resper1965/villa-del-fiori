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
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Manter em cache por 10 minutos
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar entidades. Tente novamente.",
    },
  })
}

export const useEntity = (id: string | null) => {
  return useQuery({
    queryKey: ["entity", id],
    queryFn: async () => {
      if (!id) throw new Error("ID da entidade é obrigatório")
      return entitiesApi.getById(id)
    },
    enabled: !!id, // Só executa se tiver ID
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar entidade. Tente novamente.",
    },
  })
}

export const useCreateEntity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: entitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] })
    },
    onError: (error) => {
      console.error("Erro ao criar entidade:", error)
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
    onError: (error) => {
      console.error("Erro ao atualizar entidade:", error)
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
    onError: (error) => {
      console.error("Erro ao deletar entidade:", error)
    },
  })
}
