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
    gcTime: 10 * 60 * 1000, // Manter em cache por 10 minutos
    refetchOnWindowFocus: false, // Não refazer fetch ao focar na janela
    // Timeout para evitar loading infinito (30 segundos)
    meta: {
      errorMessage: "Erro ao carregar processos. Tente novamente.",
    },
  })
}

export const useProcess = (id: string | number) => {
  return useQuery({
    queryKey: ["process", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do processo é obrigatório")
      return processesApi.getById(id)
    },
    enabled: !!id, // Só executa se tiver ID
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Manter em cache por 10 minutos
    retry: 2, // Tentar 2 vezes
    retryDelay: 1000, // Esperar 1 segundo antes de tentar novamente
    refetchOnWindowFocus: false, // Não refazer fetch ao focar na janela
    // Timeout para evitar loading infinito (30 segundos)
    meta: {
      errorMessage: "Erro ao carregar processo. Tente novamente.",
    },
  })
}

export const useCreateProcess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: processesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] })
    },
    onError: (error) => {
      console.error("Erro ao criar processo:", error)
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
    onError: (error) => {
      console.error("Erro ao atualizar processo:", error)
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
    onError: (error) => {
      console.error("Erro ao deletar processo:", error)
    },
  })
}
