// Types for the application

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
}

export interface ProcessVersion {
  id: string
  process_id: string
  version_number: number
  content: Record<string, any>
  content_text?: string
  variables_applied?: Record<string, any>
  entities_involved?: string[]
  status: string
  created_by: string
  created_at: string
  change_summary?: string
}

export interface ProcessDetailResponse extends Process {
  current_version?: ProcessVersion
}

export interface ProcessListResponse {
  items: Process[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface Stakeholder {
  id: string
  name: string
  email: string
  type: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}
