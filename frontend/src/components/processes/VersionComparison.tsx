"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GitCompare, ArrowRight, Plus, Minus } from "lucide-react"
import { ProcessVersion } from "@/types"

interface VersionComparisonProps {
  processId: string
  versions: ProcessVersion[]
  onClose?: () => void
}

export function VersionComparison({
  processId,
  versions,
  onClose,
}: VersionComparisonProps) {
  const [version1, setVersion1] = React.useState<string>("")
  const [version2, setVersion2] = React.useState<string>("")

  // Ordenar versões por número (mais recente primeiro)
  const sortedVersions = [...versions].sort((a, b) => b.version_number - a.version_number)

  const selectedVersion1 = sortedVersions.find((v) => v.id === version1)
  const selectedVersion2 = sortedVersions.find((v) => v.id === version2)

  // Comparar conteúdo
  const compareContent = () => {
    if (!selectedVersion1 || !selectedVersion2) return null

    const v1Content = selectedVersion1.content_text || selectedVersion1.content?.description || ""
    const v2Content = selectedVersion2.content_text || selectedVersion2.content?.description || ""

    const v1Workflow = selectedVersion1.content?.workflow || []
    const v2Workflow = selectedVersion2.content?.workflow || selectedVersion2.content?.workflow || []

    const v1Entities = selectedVersion1.entities_involved || selectedVersion1.content?.entities || []
    const v2Entities = selectedVersion2.entities_involved || selectedVersion2.content?.entities || []

    // Converter variables_applied de Record para array se necessário
    const v1VariablesRaw = selectedVersion1.variables_applied || selectedVersion1.content?.variables || []
    const v2VariablesRaw = selectedVersion2.variables_applied || selectedVersion2.content?.variables || []
    const v1Variables = Array.isArray(v1VariablesRaw) ? v1VariablesRaw : Object.keys(v1VariablesRaw || {})
    const v2Variables = Array.isArray(v2VariablesRaw) ? v2VariablesRaw : Object.keys(v2VariablesRaw || {})

    return {
      description: {
        v1: v1Content,
        v2: v2Content,
        changed: v1Content !== v2Content,
      },
      workflow: {
        v1: v1Workflow,
        v2: v2Workflow,
        added: v2Workflow.filter((item: string) => !v1Workflow.includes(item)),
        removed: v1Workflow.filter((item: string) => !v2Workflow.includes(item)),
      },
      entities: {
        v1: v1Entities,
        v2: v2Entities,
        added: v2Entities.filter((item: string) => !v1Entities.includes(item)),
        removed: v1Entities.filter((item: string) => !v2Entities.includes(item)),
      },
      variables: {
        v1: v1Variables,
        v2: v2Variables,
        added: v2Variables.filter((item: string) => !v1Variables.includes(item)),
        removed: v1Variables.filter((item: string) => !v2Variables.includes(item)),
      },
    }
  }

  const comparison = compareContent()

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-gray-400 stroke-1" />
          Comparação de Versões
        </CardTitle>
        <CardDescription>Compare duas versões do processo para ver as diferenças</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Seletores de Versões */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Versão 1 (Anterior)</label>
              <Select value={version1} onValueChange={setVersion1}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a versão" />
                </SelectTrigger>
                <SelectContent>
                  {sortedVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      Versão {version.version_number} - {version.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Versão 2 (Posterior)</label>
              <Select value={version2} onValueChange={setVersion2}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a versão" />
                </SelectTrigger>
                <SelectContent>
                  {sortedVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      Versão {version.version_number} - {version.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comparação */}
          {comparison && (
            <div className="space-y-4 mt-6">
              {/* Descrição */}
              {comparison.description.changed && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Descrição</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs font-medium text-red-400 mb-2">Versão {selectedVersion1?.version_number} (Removido/Alterado)</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{comparison.description.v1}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs font-medium text-green-400 mb-2">Versão {selectedVersion2?.version_number} (Adicionado/Alterado)</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{comparison.description.v2}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Workflow */}
              {(comparison.workflow.added.length > 0 || comparison.workflow.removed.length > 0) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Fluxo do Processo</h4>
                  <div className="space-y-2">
                    {comparison.workflow.removed.length > 0 && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-xs font-medium text-red-400 mb-2 flex items-center gap-2">
                          <Minus className="h-3 w-3 stroke-1" />
                          Removido
                        </p>
                        <ul className="space-y-1">
                          {comparison.workflow.removed.map((item: string, index: number) => (
                            <li key={index} className="text-sm text-gray-300">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {comparison.workflow.added.length > 0 && (
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-xs font-medium text-green-400 mb-2 flex items-center gap-2">
                          <Plus className="h-3 w-3 stroke-1" />
                          Adicionado
                        </p>
                        <ul className="space-y-1">
                          {comparison.workflow.added.map((item: string, index: number) => (
                            <li key={index} className="text-sm text-gray-300">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Entidades */}
              {(comparison.entities.added.length > 0 || comparison.entities.removed.length > 0) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Entidades Envolvidas</h4>
                  <div className="flex flex-wrap gap-2">
                          {comparison.entities.removed.map((item: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-xs"
                      >
                        - {item}
                      </span>
                    ))}
                          {comparison.entities.added.map((item: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 text-xs"
                      >
                        + {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Variáveis */}
              {(comparison.variables.added.length > 0 || comparison.variables.removed.length > 0) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Variáveis do Sistema</h4>
                  <div className="flex flex-wrap gap-2">
                          {comparison.variables.removed.map((item: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-xs"
                      >
                        - {item}
                      </span>
                    ))}
                          {comparison.variables.added.map((item: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 text-xs"
                      >
                        + {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sem mudanças */}
              {!comparison.description.changed &&
                comparison.workflow.added.length === 0 &&
                comparison.workflow.removed.length === 0 &&
                comparison.entities.added.length === 0 &&
                comparison.entities.removed.length === 0 &&
                comparison.variables.added.length === 0 &&
                comparison.variables.removed.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-sm">Nenhuma diferença encontrada entre as versões selecionadas</p>
                  </div>
                )}
            </div>
          )}

          {/* Mensagem quando nenhuma versão selecionada */}
          {(!version1 || !version2) && (
            <div className="text-center py-6 text-gray-400">
              <GitCompare className="h-8 w-8 mx-auto mb-2 opacity-50 stroke-1" />
              <p className="text-sm">Selecione duas versões para comparar</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

