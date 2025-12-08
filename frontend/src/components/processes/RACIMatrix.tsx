"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RACIEntry, RACIRole, RACILabels, RACIColors } from "@/types/raci"
import { Users } from "lucide-react"

interface RACIMatrixProps {
  raci: RACIEntry[]
  entities: string[]
}

export function RACIMatrix({ raci, entities }: RACIMatrixProps) {
  if (!raci || raci.length === 0) {
    return null
  }

  const roles: RACIRole[] = ["R", "A", "C", "I"]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-muted-foreground stroke-1" />
          Matriz RACI
        </CardTitle>
        <CardDescription className="text-xs">
          Responsabilidades por etapa do processo
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid grid-cols-[2fr_repeat(4,1fr)] gap-1 mb-1 text-xs font-medium text-muted-foreground">
              <div className="px-2 py-1">Etapa</div>
              {roles.map((role) => (
                <div key={role} className={`px-2 py-1 text-center ${RACIColors[role]}`}>
                  {RACILabels[role]}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-1">
              {raci.map((entry, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2fr_repeat(4,1fr)] gap-1 text-xs border-b border-border/50 pb-1"
                >
                  <div className="px-2 py-1.5 text-foreground">
                    {entry.step.replace(/^\d+\.\s*/, "")}
                  </div>
                  {roles.map((role) => {
                    const entitiesForRole = entry[role === "R" ? "responsible" : role === "A" ? "accountable" : role === "C" ? "consulted" : "informed"]
                    return (
                      <div
                        key={role}
                        className={`px-2 py-1.5 text-center min-h-[2rem] flex items-center justify-center ${
                          entitiesForRole.length > 0 ? RACIColors[role] : "bg-muted/30"
                        }`}
                      >
                        {entitiesForRole.length > 0 ? (
                          <div className="flex flex-wrap gap-0.5 justify-center">
                            {entitiesForRole.map((entity, idx) => (
                              <span
                                key={idx}
                                className="px-1 py-0.5 rounded text-[10px] bg-background/50"
                              >
                                {entity}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {roles.map((role) => (
              <div key={role} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${RACIColors[role]}`}></div>
                <span>
                  <strong>{role}</strong>: {RACILabels[role]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

