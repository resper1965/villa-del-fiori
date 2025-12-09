import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { processesApiSupabase as processesApi } from "@/lib/api/processes-supabase"
import { Process, ProcessDetailResponse } from "@/types"

export const useProcesses = (params?: {
  category?: string
  status?: string
  page?: number
  page_size?: number
}) => {
  return useQuery({
    queryKey: ["processes", params],
    queryFn: () => processesApi.list(params),
    retry: 1, // Tentar apenas 1 vez
    retryDelay: 1000, // Esperar 1 segundo antes de tentar novamente
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  })
}

export const useProcess = (id: string | number) => {
  return useQuery({
    queryKey: ["process", id],
    queryFn: () => processesApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateProcess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: processesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] })
    },
  })
}

export const useUpdateProcess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
      processesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["processes"] })
      queryClient.invalidateQueries({ queryKey: ["process", variables.id] })
    },
  })
}

export const useDeleteProcess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: processesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] })
    },
  })
}

