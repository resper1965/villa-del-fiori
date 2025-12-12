"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Home, 
  Users, 
  Car, 
  Heart, 
  Truck, 
  Briefcase,
  ArrowRight,
  Plus,
  Loader2
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

export default function CadastrosPage() {
  const router = useRouter()

  // Buscar estatísticas rápidas
  const { data: stats, isLoading } = useQuery({
    queryKey: ["cadastros-stats"],
    queryFn: async () => {
      const [units, vehicles, suppliers, pets] = await Promise.all([
        supabase.from("units").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("suppliers").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("pets").select("id", { count: "exact", head: true }).eq("is_active", true),
      ])
      return {
        units: units.count || 0,
        vehicles: vehicles.count || 0,
        suppliers: suppliers.count || 0,
        pets: pets.count || 0,
      }
    },
    staleTime: 2 * 60 * 1000,
  })

  const cadastroGroups = [
    {
      title: "Estrutura do Condomínio",
      description: "Cadastre unidades e estrutura do condomínio",
      items: [
        {
          title: "Unidades",
          description: "Cadastre apartamentos e casas",
          icon: Home,
          href: "/units",
          color: "bg-purple/10 text-purple border-purple/20",
          count: stats?.units || 0,
          quickAction: () => router.push("/units"),
        },
      ],
    },
    {
      title: "Unidade e Moradores",
      description: "Gerencie tudo relacionado às unidades",
      items: [
        {
          title: "Proprietários e Moradores",
          description: "Cadastre proprietários, moradores e funcionários",
          icon: Users,
          href: "/admin/users",
          color: "bg-success/10 text-success border-success/20",
          count: null,
          quickAction: () => router.push("/admin/users"),
          requires: "units",
        },
        {
          title: "Veículos",
          description: "Cadastre veículos das unidades",
          icon: Car,
          href: "/vehicles",
          color: "bg-orange/10 text-orange border-orange/20",
          count: stats?.vehicles || 0,
          quickAction: () => router.push("/vehicles"),
          requires: "units",
        },
        {
          title: "Pets",
          description: "Cadastre pets dos moradores",
          icon: Heart,
          href: null,
          color: "bg-pink/10 text-pink border-pink/20",
          count: stats?.pets || 0,
          quickAction: () => router.push("/units"),
          requires: "units",
          note: "Cadastre através da unidade",
        },
      ],
    },
    {
      title: "Serviços e Fornecedores",
      description: "Gerencie fornecedores e serviços do condomínio",
      items: [
        {
          title: "Fornecedores",
          description: "Cadastre administradora, portaria virtual, etc.",
          icon: Truck,
          href: "/suppliers",
          color: "bg-warning/10 text-warning border-warning/20",
          count: stats?.suppliers || 0,
          quickAction: () => router.push("/suppliers"),
        },
        {
          title: "Entidades",
          description: "Serviços públicos e prestadores referenciados (sem contrato)",
          icon: Briefcase,
          href: "/entities",
          color: "bg-destructive/10 text-destructive border-destructive/20",
          count: null,
          quickAction: () => router.push("/entities"),
        },
      ],
    },
  ]

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Gerencie todos os cadastros do sistema</p>
      </div>
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Fluxo Rápido de Cadastro */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Fluxo Rápido de Cadastro
                </CardTitle>
                <CardDescription>
                  Cadastre uma unidade completa com todas as informações relacionadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-card/30 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground mb-1">
                      Cadastro Completo de Unidade
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Cadastre uma unidade e adicione proprietários, moradores, veículos e pets em sequência
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push("/units/new")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Iniciar Cadastro
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grupos de Cadastros */}
            {cadastroGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">{group.title}</h2>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item, itemIndex) => {
                    const Icon = item.icon
                    const hasRequirement = "requires" in item && item.requires && 
                      (item.requires === "units" && (stats?.units || 0) === 0)

                    return (
                      <Card 
                        key={itemIndex} 
                        className={`card-elevated hover:border-primary/30 transition-all cursor-pointer ${
                          hasRequirement ? "opacity-60" : ""
                        }`}
                        onClick={() => !hasRequirement && item.quickAction()}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className={`p-2 rounded-lg ${item.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            {item.count !== null && (
                              <div className="text-2xl font-light text-foreground">
                                {item.count}
                              </div>
                            )}
                          </div>
                          <CardTitle className="text-base mt-4">{item.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {item.description}
                            {"note" in item && item.note && (
                              <span className="block mt-1 text-muted-foreground italic">
                                {item.note}
                              </span>
                            )}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {hasRequirement ? (
                            <div className="text-xs text-warning bg-warning/10 border border-warning/20 rounded p-2">
                              {"requires" in item && item.requires === "units" && "Cadastre uma unidade primeiro"}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              {item.href ? (
                                <Link 
                                  href={item.href}
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Ver todos
                                  <ArrowRight className="h-3 w-3" />
                                </Link>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Acesse através da unidade
                                </span>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  item.quickAction()
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Novo
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Dicas de Fluxo */}
            <Card className="card-elevated border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground">
                  💡 Dicas de Fluxo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    <span>Comece cadastrando as <strong className="text-foreground">Unidades</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    <span>Para cada unidade, adicione <strong className="text-foreground">Proprietários</strong> e <strong className="text-foreground">Moradores</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    <span>Complete com <strong className="text-foreground">Veículos</strong> e <strong className="text-foreground">Pets</strong> relacionados à unidade</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">4.</span>
                    <span>Cadastre <strong className="text-foreground">Fornecedores</strong> e <strong className="text-foreground">Entidades</strong> conforme necessário</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

