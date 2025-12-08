export type RACIRole = "R" | "A" | "C" | "I"

export interface RACIEntry {
  step: string
  responsible: string[] // R - Quem executa
  accountable: string[] // A - Quem aprova/decide
  consulted: string[] // C - Quem é consultado
  informed: string[] // I - Quem é informado
}

export interface ProcessRACI {
  processId: number
  entries: RACIEntry[]
}

export const RACILabels: Record<RACIRole, string> = {
  R: "Responsável",
  A: "Aprovador",
  C: "Consultado",
  I: "Informado",
}

export const RACIColors: Record<RACIRole, string> = {
  R: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  A: "bg-green-500/20 text-green-400 border-green-500/30",
  C: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  I: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

