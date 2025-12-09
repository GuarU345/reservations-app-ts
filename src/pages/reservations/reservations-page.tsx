import { useMemo } from "react"
import { toast } from "sonner"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useBusinesses } from "@/hooks/use-businesses"
import {
  useCompleteReservation,
  useConfirmReservation,
  useReservations,
} from "@/hooks/use-reservations"
import type { BusinessSummary } from "@/types/business"
import { ReservationCard } from "@/components/reservations/reservation-card"
import { extractErrorMessage } from "@/utils/functions"

export const ReservationsPage = () => {
  const { user } = useAuth()
  const isCustomer = user?.role === "CUSTOMER"
  const { data: reservations, isLoading } = useReservations()
  const { data: businesses } = useBusinesses()
  const confirmReservation = useConfirmReservation()
  const completeReservation = useCompleteReservation()

  const businessMap = useMemo<Map<string, BusinessSummary>>(() => {
    const map = new Map<string, BusinessSummary>()
    for (const business of businesses ?? []) {
      map.set(business.id, business)
    }
    return map
  }, [businesses])

  const handleConfirm = async (reservationId: string) => {
    try {
      await confirmReservation.mutateAsync(reservationId)
    } catch (error) {
      const message = extractErrorMessage(error)
      if (message) {
        toast.error(message)
      }
    }
  }

  const handleComplete = async (reservationId: string) => {
    try {
      await completeReservation.mutateAsync(reservationId)
    } catch (error) {
      const message = extractErrorMessage(error)
      if (message) {
        toast.error(message)
      }
    }
  }

  const hasReservations = (reservations?.length ?? 0) > 0

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Reservaciones</h1>
        <p className="text-sm text-muted-foreground">
          {isCustomer
            ? "Consulta y gestiona tus reservaciones activas."
            : "Gestiona las reservaciones de tus clientes en tu negocio."}
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando reservaciones...</p>
      ) : !hasReservations ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-medium">No hay reservaciones registradas</CardTitle>
            <CardDescription>
              {isCustomer
                ? "Cuando hagas una reservación aparecerá aquí."
                : "Aún no has recibido reservaciones. Comparte tu negocio para comenzar."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reservations?.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              business={businessMap.get(reservation.business_id)}
              isCustomer={isCustomer}
              onConfirm={handleConfirm}
              onComplete={handleComplete}
              confirmPending={confirmReservation.isPending}
              completePending={completeReservation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}
