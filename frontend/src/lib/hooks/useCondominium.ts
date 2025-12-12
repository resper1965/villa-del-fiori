import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { Condominium } from "@/types"

/**
 * Hook para buscar o condomínio único (single-tenant)
 * Retorna o primeiro condomínio ativo, já que a aplicação é single-tenant
 */
export function useCondominium() {
  return useQuery<Condominium | null>({
    queryKey: ["condominium"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("condominiums")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .single()

      if (error) {
        // Se não encontrar, retorna null (condomínio ainda não foi criado)
        if (error.code === "PGRST116") {
          return null
        }
        throw error
      }

      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Função auxiliar para obter o ID do condomínio
 * Útil para usar em formulários e queries
 */
export async function getCondominiumId(): Promise<string | null> {
  const { data, error } = await supabase
    .from("condominiums")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return data.id
}



