import { toast } from "sonner"
import type { BusinessSummary } from "@/types/business"
import type { Reservation, ReservationStatus } from "@/types/reservation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ReservationDialog } from "./reservation-dialog"
import { useState } from "react"
import { useCancelReservation } from "@/hooks/use-reservations"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { extractErrorMessage } from "@/utils/functions"

const cancelSchema = z.object({
    reason: z.string().min(5, "Describe el motivo de la cancelación"),
})

type CancelFormValues = z.infer<typeof cancelSchema>

type CancelReservationDialogProps = {
    reservationId: string
    disabled?: boolean
    label?: string
}

const formatDateTime = (value: string) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date)
}

const statusConfig: Record<ReservationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }>
    = {
    PENDING: { label: "Pendiente", variant: "outline" },
    CONFIRMED: { label: "Confirmada", variant: "default" },
    CANCELLED: { label: "Cancelada", variant: "destructive" },
    COMPLETED: { label: "Completada", variant: "secondary" },
}

const CancelReservationDialog = ({ reservationId, disabled = false, label = "Cancelar" }: CancelReservationDialogProps) => {
    const [open, setOpen] = useState(false)
    const cancelReservation = useCancelReservation()
    const form = useForm<CancelFormValues>({
        resolver: zodResolver(cancelSchema),
        defaultValues: { reason: "" },
    })

    const handleOpenChange = (value: boolean) => {
        if (!value) {
            form.reset({ reason: "" })
        }
        setOpen(value)
    }

    const onSubmit = async (values: CancelFormValues) => {
        try {
            await cancelReservation.mutateAsync({ reservationId, payload: values })
            handleOpenChange(false)
        } catch (error) {
            const message = extractErrorMessage(error)
            if (message) {
                toast.error(message)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled || cancelReservation.isPending}>
                    {cancelReservation.isPending ? "Cancelando..." : label}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Cancelar reservación</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Motivo</FormLabel>
                                    <FormControl>
                                        <Textarea rows={3} placeholder="Describe el motivo de la cancelación" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                Cerrar
                            </Button>
                            <Button type="submit" disabled={cancelReservation.isPending}>
                                {cancelReservation.isPending ? "Cancelando..." : "Confirmar cancelación"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export const ReservationCard = ({
    reservation,
    business,
    isCustomer,
    onConfirm,
    onComplete,
    confirmPending,
    completePending,
}: {
    reservation: Reservation
    business?: BusinessSummary
    isCustomer: boolean
    onConfirm: (reservationId: string) => Promise<void>
    onComplete: (reservationId: string) => Promise<void>
    confirmPending: boolean
    completePending: boolean
}) => {
    const status = statusConfig[reservation.status]
    const cancellation = reservation.reservation_cancellations?.[0]
    const canConfirm = !isCustomer && reservation.status === "PENDING"
    const canComplete = !isCustomer && reservation.status === "CONFIRMED"
    const canCancel = reservation.status === "PENDING"

    return (
        <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-lg">
                        {isCustomer ? business?.name ?? "Negocio" : reservation.users?.name ?? "Cliente sin definir"}
                    </CardTitle>
                    <CardDescription>
                        {isCustomer
                            ? business?.description ?? "Reservación sin descripción"
                            : reservation.users?.email ?? "Sin correo registrado"}
                    </CardDescription>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="grid gap-2 md:grid-cols-2">
                    <div>
                        <p className="text-muted-foreground">Fecha de inicio</p>
                        <p className="font-medium text-foreground">{formatDateTime(reservation.start_time)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Fecha de fin</p>
                        <p className="font-medium text-foreground">{formatDateTime(reservation.end_time)}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="font-medium text-foreground">Personas: {reservation.number_of_people}</span>
                    {!isCustomer && business ? <span className="text-muted-foreground">Negocio: {business.name}</span> : null}
                </div>

                {cancellation ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                        Cancelada: {cancellation.reason}
                    </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                    {isCustomer ? (
                        <>
                            <CancelReservationDialog reservationId={reservation.id} disabled={!canCancel} />
                            <ReservationDialog
                                business={{ id: reservation.business_id, name: business?.name ?? "Negocio" }}
                                trigger={<Button variant="secondary" size="sm">Reservar de nuevo</Button>}
                            />
                        </>
                    ) : (
                        <>
                            <Button
                                size="sm"
                                onClick={() => onConfirm(reservation.id)}
                                disabled={!canConfirm || confirmPending}
                            >
                                Confirmar
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onComplete(reservation.id)}
                                disabled={!canComplete || completePending}
                            >
                                Marcar como completada
                            </Button>
                            <CancelReservationDialog reservationId={reservation.id} disabled={!canCancel} label="Cancelar reservación" />
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}