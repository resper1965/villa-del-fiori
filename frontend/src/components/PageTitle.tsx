"use client"

import { usePathname } from "next/navigation"

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
  
  // Para rotas dinâmicas como /processes/[id], pegar o título base
  const basePath = pathname.split("/").slice(0, 3).join("/")
  const title = pageTitles[pathname] || pageTitles[basePath] || ""
  
  if (!title) return null
  
  return (
    <h1 className="text-lg font-semibold text-foreground">
      {title}
    </h1>
  )
}

