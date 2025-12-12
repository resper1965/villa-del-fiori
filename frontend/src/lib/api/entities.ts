import { supabase } from "@/lib/supabase/client"
import { Entity, EntityCreate, EntityUpdate, EntityListResponse, EntityType, EntityCategory } from "@/types/entity"

export const entitiesApi = {
  list: async (params?: {
    type?: EntityType
    category?: EntityCategory
    is_active?: boolean
    search?: string
    page?: number
    page_size?: number
  }): Promise<EntityListResponse> => {
    // Timeout de 5 segundos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Query timeout")), 5000)
    )
    
    const queryFn = async () => {
      // Por padrão, buscar apenas entidades ativas (otimização)
      let query = supabase.from("entities").select("*", { count: "exact" })
        .eq("is_active", params?.is_active !== undefined ? params.is_active : true)

      // Aplicar filtros
      if (params?.type) {
        query = query.eq("type", params.type)
      }
      if (params?.category) {
        query = query.eq("category", params.category)
      }
      if (params?.search) {
        query = query.ilike("name", `%${params.search}%`)
      }

      // Paginação
      const page = params?.page || 1
      const pageSize = params?.page_size || 100
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      query = query.range(from, to).order("name", { ascending: true })

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const totalPages = count ? Math.ceil(count / pageSize) : 0

      return {
        items: data || [],
        total: count || 0,
        page: page,
        page_size: pageSize,
        total_pages: totalPages,
      }
    }
    
    return Promise.race([queryFn(), timeoutPromise]) as Promise<EntityListResponse>
  },

  getById: async (id: string): Promise<Entity> => {
    const { data, error } = await supabase
      .from("entities")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      throw error
    }

    return data
  },

  create: async (data: EntityCreate): Promise<Entity> => {
    const { data: created, error } = await supabase
      .from("entities")
      .insert(data)
      .select()
      .single()

    if (error) {
      throw error
    }

    return created
  },

  update: async (id: string, data: EntityUpdate): Promise<Entity> => {
    const { data: updated, error } = await supabase
      .from("entities")
      .update(data)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return updated
  },

  delete: async (id: string): Promise<void> => {
    // Soft delete - marcar como inativo
    const { error } = await supabase
      .from("entities")
      .update({ is_active: false })
      .eq("id", id)

    if (error) {
      throw error
    }
  },
}

