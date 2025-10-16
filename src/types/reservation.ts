import type { User } from "@/types/user"

export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"

export interface ReservationCancellation {
  reason: string
  cancelled_by: string
  cancelled_at: string
}

export interface Reservation {
  id: string
  business_id: string
  user_id: string
  start_time: string
  end_time: string
  number_of_people: number
  status: ReservationStatus
  active: boolean
  created_at: string
  users?: Pick<User, "name" | "email">
  reservation_cancellations?: ReservationCancellation[]
}

export interface CreateReservationPayload {
  businessId: string
  startTime: string
  endTime: string
  numberOfPeople: number
}

export interface CancelReservationPayload {
  reason: string
}
