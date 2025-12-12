import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { validationApi, ValidationResponse, IntegrityMetrics } from "@/lib/api/validation"

// Hook para validar entidades
export const useValidateEntities = () => {
  return useMutation({
    mutationFn: (entityNames: string[]) => validationApi.validateEntities(entityNames),
  })
}

// Hook para validar processo
export const useValidateProcess = () => {
  return useMutation({
    mutationFn: (processId: string) => validationApi.validateProcess(processId),
  })
}

// Hook para validação em lote
export const useValidateAllProcesses = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => validationApi.validateAllProcesses(),
    onSuccess: () => {
      // Invalidar cache de processos após validação
      queryClient.invalidateQueries({ queryKey: ["processes"] })
    },
  })
}

// Hook para métricas de integridade
export const useIntegrityMetrics = () => {
  return useQuery<IntegrityMetrics>({
    queryKey: ["integrity-metrics"],
    queryFn: () => validationApi.getIntegrityMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

