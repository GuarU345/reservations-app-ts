import { useQuery } from "@tanstack/react-query"

import * as categoriesApi from "@/api/categories"
import { queryKeys } from "@/lib/query-keys"

export const useBusinessCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: categoriesApi.getBusinessCategories,
  })
}
