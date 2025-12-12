export enum EntityType {
  SERVICO_PUBLICO = "servico_publico",
  PRESTADOR_REFERENCIADO = "prestador_referenciado",
}

export enum EntityCategory {
  // Serviços Públicos
  BOMBEIROS = "bombeiros",
  POLICIA = "policia",
  SAMU = "samu",
  DEFESA_CIVIL = "defesa_civil",
  GUARDA_MUNICIPAL = "guarda_municipal",
  
  // Prestadores Referenciados (sem contrato)
  ASSISTENCIA_TECNICA = "assistencia_tecnica",
  CONSULTORIA = "consultoria",
  OUTRO_PRESTADOR = "outro_prestador",
}

export interface Entity {
  id: string
  name: string
  type: EntityType
  category?: EntityCategory
  phone?: string
  email?: string
  contact_person?: string
  description?: string
  address?: string
  emergency_phone?: string
  meeting_point?: string
  cnpj?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EntityCreate {
  name: string
  type: EntityType
  category?: EntityCategory
  phone?: string
  email?: string
  contact_person?: string
  description?: string
  address?: string
  emergency_phone?: string
  meeting_point?: string
  cnpj?: string
  is_active?: boolean
}

export interface EntityUpdate {
  name?: string
  type?: EntityType
  category?: EntityCategory
  phone?: string
  email?: string
  contact_person?: string
  description?: string
  address?: string
  emergency_phone?: string
  meeting_point?: string
  cnpj?: string
  is_active?: boolean
}

export interface EntityListResponse {
  items: Entity[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Labels para exibição
export const EntityTypeLabels: Record<EntityType, string> = {
  [EntityType.SERVICO_PUBLICO]: "Serviço Público",
  [EntityType.PRESTADOR_REFERENCIADO]: "Prestador Referenciado",
}

export const EntityCategoryLabels: Record<EntityCategory, string> = {
  // Serviços Públicos
  [EntityCategory.BOMBEIROS]: "Bombeiros",
  [EntityCategory.POLICIA]: "Polícia",
  [EntityCategory.SAMU]: "SAMU",
  [EntityCategory.DEFESA_CIVIL]: "Defesa Civil",
  [EntityCategory.GUARDA_MUNICIPAL]: "Guarda Municipal",
  
  // Prestadores Referenciados
  [EntityCategory.ASSISTENCIA_TECNICA]: "Assistência Técnica",
  [EntityCategory.CONSULTORIA]: "Consultoria",
  [EntityCategory.OUTRO_PRESTADOR]: "Outro Prestador",
}

// Categorias por tipo
export const CategoriesByType: Record<EntityType, EntityCategory[]> = {
  [EntityType.SERVICO_PUBLICO]: [
    EntityCategory.BOMBEIROS,
    EntityCategory.POLICIA,
    EntityCategory.SAMU,
    EntityCategory.DEFESA_CIVIL,
    EntityCategory.GUARDA_MUNICIPAL,
  ],
  [EntityType.PRESTADOR_REFERENCIADO]: [
    EntityCategory.ASSISTENCIA_TECNICA,
    EntityCategory.CONSULTORIA,
    EntityCategory.OUTRO_PRESTADOR,
  ],
}

