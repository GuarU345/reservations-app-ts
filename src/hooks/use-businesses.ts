import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import * as businessesApi from "@/api/businesses"
import * as favoritesApi from "@/api/favorites"
import { queryKeys } from "@/lib/query-keys"
import type { UpsertBusinessPayload, UpdateBusinessHoursPayload } from "@/types/business"

export const useBusinesses = (categoryId?: string) => {
  return useQuery({
    queryKey: queryKeys.businesses.list(categoryId),
    queryFn: () => businessesApi.getBusinesses(categoryId),
  })
}

export const useBusiness = (businessId: string | undefined) => {
  return useQuery({
    queryKey: businessId ? queryKeys.businesses.detail(businessId) : [],
    queryFn: () => businessesApi.getBusinessById(businessId!),
    enabled: Boolean(businessId),
  })
}

export const useBusinessHours = (businessId: string | undefined) => {
  return useQuery({
    queryKey: businessId ? queryKeys.businesses.hours(businessId) : [],
    queryFn: () => businessesApi.getBusinessHours(businessId!),
    enabled: Boolean(businessId),
  })
}

export const useCreateBusiness = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpsertBusinessPayload) => businessesApi.createBusiness(payload),
    onSuccess: (data) => {
      toast.success("Negocio creado correctamente")
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.list(undefined) })
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.detail(data.id) })
    },
    onError: () => {
      toast.error("No se pudo crear el negocio")
    },
  })
}

export const useUpdateBusiness = (businessId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpsertBusinessPayload) => businessesApi.updateBusiness(businessId, payload),
    onSuccess: () => {
      toast.success("Negocio actualizado")
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.detail(businessId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.list(undefined) })
    },
    onError: () => toast.error("No se pudo actualizar el negocio"),
  })
}

export const useDeleteBusiness = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (businessId: string) => businessesApi.deleteBusiness(businessId),
    onSuccess: () => {
      toast.success("Negocio eliminado")
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.list(undefined) })
    },
    onError: () => toast.error("No se pudo eliminar el negocio"),
  })
}

export const useUpdateBusinessHours = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBusinessHoursPayload }) =>
      businessesApi.updateBusinessHours(id, payload),
    onSuccess: (data) => {
      toast.success("Horario actualizado")
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.hours(data.business_id) })
    },
    onError: () => toast.error("No se pudo actualizar el horario"),
  })
}

export const useToggleFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ businessId, liked }: { businessId: string; liked: boolean }) => {
      if (liked) {
        return favoritesApi.dislikeBusiness(businessId)
      }
      return favoritesApi.likeBusiness(businessId)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.list(undefined) })
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list })
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.detail(variables.businessId) })
    },
    onError: () => toast.error("No se pudo actualizar el favorito"),
  })
}

export const useFavoriteBusinesses = () => {
  return useQuery({
    queryKey: queryKeys.favorites.list,
    queryFn: favoritesApi.getLikedBusinesses,
  })
}
