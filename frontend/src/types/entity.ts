export enum EntityType {
  PESSOA = "pessoa",
  EMPRESA = "empresa",
  SERVICO_EMERGENCIA = "servico_emergencia",
  INFRAESTRUTURA = "infraestrutura",
}

export enum EntityCategory {
  // Pessoas
  SINDICO = "sindico",
  CONSELHEIRO = "conselheiro",
  ADMINISTRADORA = "administradora",
  FAXINEIRO = "faxineiro",
  MORADOR = "morador",
  
  // Empresas
  PORTARIA_ONLINE = "portaria_online",
  SEGURANCA = "seguranca",
  MANUTENCAO_ELEVADOR = "manutencao_elevador",
  JARDINAGEM = "jardinagem",
  DEDETIZACAO = "dedetizacao",
  MANUTENCAO = "manutencao",
  GAS = "gas",
  ENERGIA = "energia",
  OUTRO_FORNECEDOR = "outro_fornecedor",
  
  // Serviços de Emergência
  BOMBEIROS = "bombeiros",
  POLICIA = "policia",
  SAMU = "samu",
  
  // Infraestrutura
  PORTAO = "portao",
  ELEVADOR = "elevador",
  SISTEMA_BIOMETRIA = "sistema_biometria",
  SISTEMA_CAMERAS = "sistema_cameras",
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
  [EntityType.PESSOA]: "Pessoa",
  [EntityType.EMPRESA]: "Empresa",
  [EntityType.SERVICO_EMERGENCIA]: "Serviço de Emergência",
  [EntityType.INFRAESTRUTURA]: "Infraestrutura",
}

export const EntityCategoryLabels: Record<EntityCategory, string> = {
  [EntityCategory.SINDICO]: "Síndico",
  [EntityCategory.CONSELHEIRO]: "Conselheiro",
  [EntityCategory.ADMINISTRADORA]: "Administradora",
  [EntityCategory.FAXINEIRO]: "Faxineiro",
  [EntityCategory.MORADOR]: "Morador",
  [EntityCategory.PORTARIA_ONLINE]: "Portaria Online",
  [EntityCategory.SEGURANCA]: "Segurança",
  [EntityCategory.MANUTENCAO_ELEVADOR]: "Manutenção de Elevadores",
  [EntityCategory.JARDINAGEM]: "Jardinagem",
  [EntityCategory.DEDETIZACAO]: "Dedetização",
  [EntityCategory.MANUTENCAO]: "Manutenção",
  [EntityCategory.GAS]: "Gás",
  [EntityCategory.ENERGIA]: "Energia",
  [EntityCategory.OUTRO_FORNECEDOR]: "Outro Fornecedor",
  [EntityCategory.BOMBEIROS]: "Bombeiros",
  [EntityCategory.POLICIA]: "Polícia",
  [EntityCategory.SAMU]: "SAMU",
  [EntityCategory.PORTAO]: "Portão",
  [EntityCategory.ELEVADOR]: "Elevador",
  [EntityCategory.SISTEMA_BIOMETRIA]: "Sistema de Biometria",
  [EntityCategory.SISTEMA_CAMERAS]: "Sistema de Câmeras",
}

// Categorias por tipo
export const CategoriesByType: Record<EntityType, EntityCategory[]> = {
  [EntityType.PESSOA]: [
    EntityCategory.SINDICO,
    EntityCategory.CONSELHEIRO,
    EntityCategory.ADMINISTRADORA,
    EntityCategory.FAXINEIRO,
    EntityCategory.MORADOR,
  ],
  [EntityType.EMPRESA]: [
    EntityCategory.PORTARIA_ONLINE,
    EntityCategory.SEGURANCA,
    EntityCategory.MANUTENCAO_ELEVADOR,
    EntityCategory.JARDINAGEM,
    EntityCategory.DEDETIZACAO,
    EntityCategory.MANUTENCAO,
    EntityCategory.GAS,
    EntityCategory.ENERGIA,
    EntityCategory.OUTRO_FORNECEDOR,
  ],
  [EntityType.SERVICO_EMERGENCIA]: [
    EntityCategory.BOMBEIROS,
    EntityCategory.POLICIA,
    EntityCategory.SAMU,
  ],
  [EntityType.INFRAESTRUTURA]: [
    EntityCategory.PORTAO,
    EntityCategory.ELEVADOR,
    EntityCategory.SISTEMA_BIOMETRIA,
    EntityCategory.SISTEMA_CAMERAS,
  ],
}

