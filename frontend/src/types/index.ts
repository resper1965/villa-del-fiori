// Types for the application

import { RACIEntry } from "./raci"

export interface Process {
  id: string
  name: string
  category: string
  subcategory?: string
  document_type: string
  status: string
  current_version_number: number
  creator_id: string
  created_at: string
  updated_at: string
  description?: string
  workflow?: string[]
  entities?: string[]
  variables?: string[]
  raci?: RACIEntry[]
}

export interface ProcessVersion {
  id: string
  process_id: string
  version_number: number
  content: Record<string, any>
  content_text?: string
  natural_description?: string
  variables_applied?: Record<string, any>
  entities_involved?: string[]
  status: string
  created_by: string
  created_at: string
  change_summary?: string
}

export interface ProcessDetailResponse extends Process {
  current_version?: ProcessVersion
  versions?: ProcessVersion[]
}

export interface ProcessListResponse {
  items: Process[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface Unit {
  id: string
  number: string
  block?: string
  floor?: number
  area?: number
  parking_spots?: number
  description?: string
  condominium_id?: string | null
  condominium?: Condominium | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Stakeholder {
  id: string
  name: string
  email: string
  type: string
  role: string
  unit_id?: string
  unit?: Unit
  relationship_type?: 'proprietario' | 'morador' | 'proprietario_morador'
  is_owner?: boolean
  is_resident?: boolean
  owner_id?: string
  owner?: Stakeholder
  // Campos de contato
  phone?: string
  phone_secondary?: string
  whatsapp?: string
  has_whatsapp?: boolean
  address_street?: string
  address_number?: string
  address_complement?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zipcode?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  // Campos de funcionário e cargo
  is_employee?: boolean
  employee_role?: string
  employee_unit_id?: string
  condominium_role?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  unit_id?: string | null
  unit?: Unit | null
  stakeholder_id?: string | null
  stakeholder?: Stakeholder | null
  brand: string
  model: string
  license_plate: string
  color?: string
  year?: number
  vehicle_type?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Condominium {
  id: string
  name: string
  cnpj?: string
  email?: string
  phone?: string
  address_street?: string
  address_number?: string
  address_complement?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zipcode?: string
  total_units?: number
  total_floors?: number
  total_blocks?: number
  has_elevator?: boolean
  has_pool?: boolean
  has_gym?: boolean
  has_party_room?: boolean
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
  owner_id?: string | null // Para SaaS - multi-tenancy
  slug?: string | null // Para SaaS - URLs amigáveis
}

export interface Pet {
  id: string
  name: string
  species: string
  breed?: string
  color?: string
  size?: string
  weight?: number
  birth_date?: string
  microchip_number?: string
  vaccination_status?: string
  last_vaccination_date?: string
  notes?: string
  unit_id: string
  unit?: Unit
  owner_id?: string | null
  owner?: Stakeholder | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  cnpj?: string
  cpf?: string
  email?: string
  phone?: string
  address_street?: string
  address_number?: string
  address_complement?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zipcode?: string
  supplier_type: string
  category?: string
  contact_person?: string
  contact_phone?: string
  contract_start_date?: string
  contract_end_date?: string
  monthly_value?: number
  payment_day?: number
  notes?: string
  condominium_id: string
  condominium?: Condominium
  is_active: boolean
  created_at: string
  updated_at: string
}
