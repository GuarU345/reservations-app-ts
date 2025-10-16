export interface BusinessHours {
  id: string
  business_id: string
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

export interface BusinessSummary {
  id: string
  user_id: string
  category_id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  active: boolean
  created_at: string
  liked?: boolean
  business_categories?: {
    category: string
  }
}

export interface BusinessDetail extends BusinessSummary {
  business_hours: BusinessHours[]
}

export interface UpsertBusinessPayload {
  name: string
  description: string
  address: string
  phone: string
  email: string
  categoryId: string
}

export interface UpdateBusinessHoursPayload {
  openTime?: string
  closeTime?: string
  isClosed: boolean
}
