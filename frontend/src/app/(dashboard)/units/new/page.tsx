"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Home, Users, Car, Heart, Loader2 } from "lucide-react"
import { UnitForm } from "@/components/units/UnitForm"
import { UserForm } from "@/components/users/UserForm"
import { VehicleForm } from "@/components/vehicles/VehicleForm"
import { PetForm } from "@/components/pets/PetForm"
import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"

type Step = "unit" | "owner" | "residents" | "vehicles" | "pets" | "complete"

export default function NewUnitFlowPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState<Step>("unit")
  const [unitId, setUnitId] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set())

  const steps: { id: Step; label: string; icon: any; description: string }[] = [
    { id: "unit", label: "Unidade", icon: Home, description: "Cadastre a unidade" },
    { id: "owner", label: "Proprietário", icon: Users, description: "Adicione o proprietário" },
    { id: "residents", label: "Moradores", icon: Users, description: "Adicione moradores" },
    { id: "vehicles", label: "Veículos", icon: Car, description: "Cadastre veículos" },
    { id: "pets", label: "Pets", icon: Heart, description: "Cadastre pets" },
  ]

  const handleUnitSuccess = (newUnitId: string) => {
    setUnitId(newUnitId)
    setCompletedSteps(prev => new Set([...prev, "unit"]))
    setCurrentStep("owner")
    queryClient.invalidateQueries({ queryKey: ["units"] })
  }

  const handleStepComplete = (step: Step) => {
    setCompletedSteps(prev => new Set([...prev, step]))
    const currentIndex = steps.findIndex(s => s.id === step)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    } else {
      setCurrentStep("complete")
    }
  }

  const handleSkip = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    } else {
      setCurrentStep("complete")
    }
  }

  const handleFinish = () => {
    if (unitId) {
      router.push(`/units/${unitId}`)
    } else {
      router.push("/units")
    }
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="h-[73px] border-b border-border/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/cadastros")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => router.push("/cadastros")}
              >
                Cadastros
              </Button>
              <span className="text-muted-foreground text-xs">/</span>
              <span className="text-xs text-muted-foreground">Nova Unidade</span>
            </div>
            <h1 className="text-lg font-semibold text-foreground">Cadastro Completo de Unidade</h1>
            <p className="text-sm text-muted-foreground">Cadastre uma unidade com todas as informações</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Progress Steps */}
        <Card className="card-elevated mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = completedSteps.has(step.id)
                const isPast = steps.findIndex(s => s.id === currentStep) > index

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          isActive
                            ? "bg-primary border-primary text-white"
                            : isCompleted || isPast
                            ? "bg-success/10 border-green-500 text-success"
                            : "bg-card border-border text-muted-foreground"
                        }`}
                      >
                        {isCompleted || isPast ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p
                          className={`text-xs font-medium ${
                            isActive ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 ${
                          isPast || isCompleted ? "bg-green-500" : "bg-gray-700"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === "complete" ? (
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Cadastro Concluído!
              </h2>
              <p className="text-muted-foreground mb-6">
                A unidade foi cadastrada com sucesso. Você pode continuar adicionando informações depois.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => router.push("/cadastros")}>
                  Voltar para Cadastros
                </Button>
                <Button onClick={handleFinish}>
                  Ver Unidade
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const step = steps.find(s => s.id === currentStep)
                  const Icon = step?.icon || Home
                  return <Icon className="h-5 w-5 text-primary" />
                })()}
                {steps.find(s => s.id === currentStep)?.label}
              </CardTitle>
              <CardDescription>
                {steps.find(s => s.id === currentStep)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === "unit" && (
                <UnitForm
                  open={true}
                  onOpenChange={() => {}}
                  unitId={null}
                  onSuccess={(newUnitId) => {
                    if (newUnitId) {
                      handleUnitSuccess(newUnitId)
                    } else {
                      queryClient.invalidateQueries({ queryKey: ["units"] })
                      handleStepComplete("unit")
                    }
                  }}
                />
              )}

              {currentStep === "owner" && unitId && (
                <div className="space-y-4">
                  <UserForm
                    open={true}
                    onOpenChange={() => {}}
                    userId={null}
                    defaultUnitId={unitId}
                    onSuccess={() => {
                      handleStepComplete("owner")
                      queryClient.invalidateQueries({ queryKey: ["unit-owners", unitId] })
                    }}
                  />
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={handleSkip}>
                      Pular esta etapa
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === "residents" && unitId && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Você pode adicionar múltiplos moradores. Após adicionar um, pode adicionar mais ou continuar.
                  </div>
                  <UserForm
                    open={true}
                    onOpenChange={() => {}}
                    userId={null}
                    defaultUnitId={unitId}
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ["unit-residents", unitId] })
                      // Não avança automaticamente, permite adicionar mais
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleSkip}>
                      Pular esta etapa
                    </Button>
                    <Button onClick={() => handleStepComplete("residents")}>
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === "vehicles" && unitId && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Você pode adicionar múltiplos veículos. Após adicionar um, pode adicionar mais ou continuar.
                  </div>
                  <VehicleForm
                    open={true}
                    onOpenChange={() => {}}
                    vehicleId={null}
                    defaultUnitId={unitId}
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ["unit-vehicles", unitId] })
                      // Não avança automaticamente, permite adicionar mais
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleSkip}>
                      Pular esta etapa
                    </Button>
                    <Button onClick={() => handleStepComplete("vehicles")}>
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === "pets" && unitId && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Você pode adicionar múltiplos pets. Após adicionar um, pode adicionar mais ou finalizar.
                  </div>
                  <PetForm
                    open={true}
                    onOpenChange={() => {}}
                    petId={null}
                    defaultUnitId={unitId}
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ["unit-pets", unitId] })
                      // Não avança automaticamente, permite adicionar mais
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleSkip}>
                      Pular esta etapa
                    </Button>
                    <Button onClick={() => handleStepComplete("pets")}>
                      Finalizar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

