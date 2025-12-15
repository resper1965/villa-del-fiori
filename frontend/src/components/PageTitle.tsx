"use client"

import { usePathname } from "next/navigation"
import { useCondominium } from "@/lib/hooks/useCondominium"
import { Building2 } from "lucide-react"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/processes": "Processos",
  "/entities": "Entidades",
  "/suppliers": "Fornecedores",
  "/chat": "Chat",
  "/admin/users": "Gerenciar Usuários",
  "/admin/knowledge-base": "Base de Conhecimento",
  "/cadastros": "Cadastros",
  "/notifications": "Notificações",
  "/condominiums": "Gerenciar Condomínios",
  "/units": "Gerenciar Unidades",
  "/vehicles": "Gerenciar Veículos",
  "/approvals": "Aprovações",
  "/processes/import": "Importar Processo de Contrato",
  "/units/new": "Cadastro Completo de Unidade",
}

export function PageTitle() {
  const pathname = usePathname()
  const { data: condominium } = useCondominium()
  
  // Para rotas dinâmicas como /processes/[id], pegar o título base
  const basePath = pathname.split("/").slice(0, 3).join("/")
  const title = pageTitles[pathname] || pageTitles[basePath] || ""
  
  return (
    <div className="flex items-center gap-3">
      {condominium && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{condominium.name}</span>
        </div>
      )}
      {title && (
        <h1 className="text-lg font-semibold text-foreground">
          {title}
        </h1>
      )}
    </div>
  )
}

