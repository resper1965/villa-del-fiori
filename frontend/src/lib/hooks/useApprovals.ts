import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { approvalsApi, ApprovalCreate, RejectionCreate } from "@/lib/api/approvals"

export const useApproveProcess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      processId,
      versionId,
      data,
    }: {
      processId: string | number
      versionId: string | number
      data: ApprovalCreate
    }) => approvalsApi.approve(processId, versionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["process", variables.processId] })
      queryClient.invalidateQueries({ queryKey: ["processes"] })
      queryClient.invalidateQueries({ queryKey: ["approvals", variables.processId] })
    },
  })
}

export const useRejectProcess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      processId,
      versionId,
      data,
    }: {
      processId: string | number
      versionId: string | number
      data: RejectionCreate
    }) => approvalsApi.reject(processId, versionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["process", variables.processId] })
      queryClient.invalidateQueries({ queryKey: ["processes"] })
      queryClient.invalidateQueries({ queryKey: ["rejections", variables.processId] })
    },
  })
}

export const useProcessApprovals = (processId: string | number) => {
  return useQuery({
    queryKey: ["approvals", processId],
    queryFn: () => approvalsApi.getProcessApprovals(processId),
    enabled: !!processId,
  })
}

export const useProcessRejections = (processId: string | number) => {
  return useQuery({
    queryKey: ["rejections", processId],
    queryFn: () => approvalsApi.getProcessRejections(processId),
    enabled: !!processId,
  })
}

