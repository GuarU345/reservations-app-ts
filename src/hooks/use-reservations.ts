import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import * as reservationsApi from "@/api/reservations"
import { queryKeys } from "@/lib/query-keys"
import type { CancelReservationPayload, CreateReservationPayload } from "@/types/reservation"

export const useReservations = () => {
  return useQuery({
    queryKey: queryKeys.reservations.list,
    queryFn: reservationsApi.getReservations,
  })
}

export const useCreateReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateReservationPayload) => reservationsApi.createReservation(payload),
    onSuccess: () => {
      toast.success("Reservación creada")
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.list })
    }
  })
}

export const useConfirmReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reservationId: string) => reservationsApi.confirmReservation(reservationId),
    onSuccess: () => {
      toast.success("Reservación confirmada")
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.list })
    },
  })
}

export const useCompleteReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reservationId: string) => reservationsApi.completeReservation(reservationId),
    onSuccess: () => {
      toast.success("Reservación completada")
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.list })
    }
  })
}

export const useCancelReservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reservationId, payload }: { reservationId: string; payload: CancelReservationPayload }) =>
      reservationsApi.cancelReservation(reservationId, payload),
    onSuccess: () => {
      toast.success("Reservación cancelada")
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.list })
    }
  })
}
