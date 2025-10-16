import { api } from "@/lib/api-client"
import type { BusinessSummary } from "@/types/business"

export const getLikedBusinesses = async () => {
  const { data } = await api.get<BusinessSummary[]>("/like/business")
  return data
}

export const likeBusiness = async (businessId: string) => {
  const { data } = await api.post<{ message: string }>(`/like/business/${businessId}`)
  return data
}

export const dislikeBusiness = async (businessId: string) => {
  const { data } = await api.delete<{ message: string }>(`/dislike/business/${businessId}`)
  return data
}
