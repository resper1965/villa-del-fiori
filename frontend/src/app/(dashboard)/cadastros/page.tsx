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
          color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
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
          color: "bg-green-500/10 text-green-400 border-green-500/20",
          count: null,
          quickAction: () => router.push("/admin/users"),
          requires: "units",
        },
        {
          title: "Veículos",
          description: "Cadastre veículos das unidades",
          icon: Car,
          href: "/vehicles",
          color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
          count: stats?.vehicles || 0,
          quickAction: () => router.push("/vehicles"),
          requires: "units",
        },
        {
          title: "Pets",
          description: "Cadastre pets dos moradores",
          icon: Heart,
          href: null,
          color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
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
          color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
          count: stats?.suppliers || 0,
          quickAction: () => router.push("/suppliers"),
        },
        {
          title: "Entidades",
          description: "Serviços públicos e prestadores referenciados (sem contrato)",
          icon: Briefcase,
          href: "/entities",
          color: "bg-red-500/10 text-red-400 border-red-500/20",
          count: null,
          quickAction: () => router.push("/entities"),
        },
      ],
    },
  ]

  return (
    <div className="px-1 sm:px-2 md:px-3 py-4 md:py-6">
      <div className="mb-4">
        <p className="text-sm text-gray-400">Gerencie todos os cadastros do sistema</p>
      </div>
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
                <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-300 mb-1">
                      Cadastro Completo de Unidade
                    </h3>
                    <p className="text-xs text-gray-400">
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
                  <h2 className="text-xl font-semibold text-gray-300 mb-1">{group.title}</h2>
                  <p className="text-sm text-gray-400">{group.description}</p>
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
                              <div className="text-2xl font-light text-gray-300">
                                {item.count}
                              </div>
                            )}
                          </div>
                          <CardTitle className="text-base mt-4">{item.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {item.description}
                            {"note" in item && item.note && (
                              <span className="block mt-1 text-gray-500 italic">
                                {item.note}
                              </span>
                            )}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {hasRequirement ? (
                            <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
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
                                <span className="text-xs text-gray-500">
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
                <CardTitle className="text-sm font-medium text-gray-300">
                  💡 Dicas de Fluxo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    <span>Comece cadastrando as <strong className="text-gray-300">Unidades</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    <span>Para cada unidade, adicione <strong className="text-gray-300">Proprietários</strong> e <strong className="text-gray-300">Moradores</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    <span>Complete com <strong className="text-gray-300">Veículos</strong> e <strong className="text-gray-300">Pets</strong> relacionados à unidade</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">4.</span>
                    <span>Cadastre <strong className="text-gray-300">Fornecedores</strong> e <strong className="text-gray-300">Entidades</strong> conforme necessário</span>
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

