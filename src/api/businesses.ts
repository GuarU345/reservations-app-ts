import { api } from "@/lib/api-client"
import type {
  BusinessDetail,
  BusinessHours,
  BusinessSummary,
  UpsertBusinessPayload,
  UpdateBusinessHoursPayload,
} from "@/types/business"

type BusinessListFilters = {
  categoryId?: string
  owner?: boolean
}

export const getBusinesses = async (filters?: BusinessListFilters) => {
  const params: Record<string, string> = {}

  if (filters?.categoryId) {
    params.categoryId = filters.categoryId
  }

  if (filters?.owner) {
    params.owner = "true"
  }

  const { data } = await api.get<BusinessSummary[]>("/businesses", {
    params: Object.keys(params).length ? params : undefined,
  })
  return data
}

export const getBusinessById = async (businessId: string) => {
  const { data } = await api.get<BusinessDetail>(`/businesses/${businessId}`)
  return data
}

export const getBusinessHours = async (businessId: string) => {
  const { data } = await api.get<BusinessHours[]>(`/businesses/${businessId}/hours`)
  return data
}

export const createBusiness = async (payload: UpsertBusinessPayload) => {
  const { data } = await api.post<BusinessSummary>("/businesses", payload)
  return data
}

export const updateBusiness = async (businessId: string, payload: UpsertBusinessPayload) => {
  const { data } = await api.put<BusinessSummary>(`/businesses/${businessId}`, payload)
  return data
}

export const deleteBusiness = async (businessId: string) => {
  const { data } = await api.delete<BusinessSummary>(`/businesses/${businessId}`)
  return data
}

export const updateBusinessHours = async (businessHourId: string, payload: UpdateBusinessHoursPayload) => {
  const { data } = await api.put<BusinessHours>(`/business-hours/${businessHourId}`, payload)
  return data
}
