import { api } from "@/lib/api-client"
import type { BusinessCategory } from "@/types/category"

export const getBusinessCategories = async () => {
  const { data } = await api.get<BusinessCategory[]>("/business-categories")
  return data
}
