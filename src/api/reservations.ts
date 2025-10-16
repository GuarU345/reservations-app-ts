import { api } from "@/lib/api-client"
import type { CancelReservationPayload, CreateReservationPayload, Reservation } from "@/types/reservation"

export const getReservations = async () => {
  const { data } = await api.get<Reservation[]>("/reservations")
  return data
}

export const createReservation = async (payload: CreateReservationPayload) => {
  const { data } = await api.post<Reservation>("/reservations", payload)
  return data
}

export const confirmReservation = async (reservationId: string) => {
  const { data } = await api.put<{ message: string }>(`/reservations/${reservationId}/confirm`)
  return data
}

export const completeReservation = async (reservationId: string) => {
  const { data } = await api.put<{ message: string }>(`/reservations/${reservationId}/complete`)
  return data
}

export const cancelReservation = async (reservationId: string, payload: CancelReservationPayload) => {
  const { data } = await api.delete<{ message: string }>(`/reservations/${reservationId}/cancel`, {
    data: payload,
  })
  return data
}
