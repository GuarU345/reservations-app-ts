import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBusinessHours } from "@/hooks/use-businesses"
import { useCreateReservation } from "@/hooks/use-reservations"
import type { BusinessHours, BusinessSummary } from "@/types/business"

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/
const SLOT_INTERVAL_MINUTES = 30

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number)
  return hour * 60 + minute
}

const minutesToTime = (minutes: number) => {
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

const combineDateAndTimeToISO = (date: string, time: string) => new Date(`${date}T${time}:00`).toISOString()

const getDayIndexFromDate = (date: string) => {
  if (!date) return null
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.getUTCDay()
}

const reservationSchema = z
  .object({
    date: z.string().min(1, "Selecciona una fecha"),
    startTime: z.string().regex(TIME_REGEX, "Selecciona una hora de inicio"),
    endTime: z.string().regex(TIME_REGEX, "Selecciona una hora de fin"),
    numberOfPeople: z.number().min(1, "Debe ser al menos 1 persona").max(8, "Máximo 8 personas"),
  })
  .superRefine((data, ctx) => {
    const startDate = new Date(`${data.date}T${data.startTime}:00`)
    const endDate = new Date(`${data.date}T${data.endTime}:00`)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      ctx.addIssue({
        path: ["date"],
        message: "Selecciona una fecha válida",
        code: z.ZodIssueCode.custom,
      })
      return
    }

    if (endDate <= startDate) {
      ctx.addIssue({
        path: ["endTime"],
        message: "La hora de fin debe ser posterior a la de inicio",
        code: z.ZodIssueCode.custom,
      })
    }

    if (startDate <= new Date()) {
      ctx.addIssue({
        path: ["startTime"],
        message: "Selecciona un horario futuro",
        code: z.ZodIssueCode.custom,
      })
    }
  })

type ReservationFormValues = z.infer<typeof reservationSchema>

type ReservationDialogProps = {
  business: Pick<BusinessSummary, "id" | "name">
  triggerLabel?: string
  onSuccess?: () => void
  trigger?: ReactNode
}

const isDayClosed = (schedule: BusinessHours | null | undefined) => {
  if (!schedule) return true
  return schedule.is_closed || !schedule.open_time || !schedule.close_time
}

export const ReservationDialog = ({
  business,
  triggerLabel = "Reservar",
  onSuccess,
  trigger,
}: ReservationDialogProps) => {
  const [open, setOpen] = useState(false)
  const createReservation = useCreateReservation()
  const { data: hours, isLoading: hoursLoading } = useBusinessHours(business.id)

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      date: "",
      startTime: "",
      endTime: "",
      numberOfPeople: 1,
    },
  })

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const selectedDate = form.watch("date")
  const startTime = form.watch("startTime")
  const endTime = form.watch("endTime")

  const scheduleForDay = useMemo(() => {
    const dayIndex = getDayIndexFromDate(selectedDate)
    if (dayIndex === null) return null
    return hours?.find((entry) => entry.day_of_week === dayIndex) ?? null
  }, [hours, selectedDate])

  const availableStartTimes = useMemo(() => {
    if (!scheduleForDay || isDayClosed(scheduleForDay)) return []
    const openMinutes = toMinutes(scheduleForDay.open_time!)
    const closeMinutes = toMinutes(scheduleForDay.close_time!)
    const times: string[] = []

    for (let minutes = openMinutes; minutes < closeMinutes; minutes += SLOT_INTERVAL_MINUTES) {
      times.push(minutesToTime(minutes))
    }

    return times
  }, [scheduleForDay])

  const availableEndTimes = useMemo(() => {
    if (!scheduleForDay || isDayClosed(scheduleForDay) || !startTime) return []
    const closeMinutes = toMinutes(scheduleForDay.close_time!)
    const startMinutes = toMinutes(startTime)
    const times: string[] = []

    for (let minutes = startMinutes + SLOT_INTERVAL_MINUTES; minutes <= closeMinutes; minutes += SLOT_INTERVAL_MINUTES) {
      times.push(minutesToTime(minutes))
    }

    return times
  }, [scheduleForDay, startTime])

  useEffect(() => {
    if (!selectedDate || !scheduleForDay || isDayClosed(scheduleForDay) || !availableStartTimes.length) {
      if (startTime) {
        form.setValue("startTime", "", { shouldDirty: true })
      }
      if (endTime) {
        form.setValue("endTime", "", { shouldDirty: true })
      }
      return
    }

    if (!startTime || !availableStartTimes.includes(startTime)) {
      const nextStart = availableStartTimes[0]
      form.setValue("startTime", nextStart, { shouldDirty: true })
    }
  }, [selectedDate, scheduleForDay, availableStartTimes, startTime, endTime, form])

  useEffect(() => {
    if (!selectedDate || !scheduleForDay || isDayClosed(scheduleForDay) || !availableEndTimes.length) {
      if (endTime) {
        form.setValue("endTime", "", { shouldDirty: true })
      }
      return
    }

    if (!endTime || !availableEndTimes.includes(endTime)) {
      form.setValue("endTime", availableEndTimes[0], { shouldDirty: true })
    }
  }, [selectedDate, scheduleForDay, availableEndTimes, endTime, form])

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      form.reset({
        date: "",
        startTime: "",
        endTime: "",
        numberOfPeople: 1,
      })
    }
    setOpen(value)
  }

  const scheduleMessage = useMemo(() => {
    if (!selectedDate) {
      return "Selecciona una fecha para ver la disponibilidad."
    }

    if (hoursLoading) {
      return "Cargando horarios disponibles..."
    }

    if (!scheduleForDay) {
      return "No hay horarios configurados para este día."
    }

    if (isDayClosed(scheduleForDay)) {
      return "El negocio está cerrado en la fecha seleccionada."
    }

    return `Disponibilidad: ${scheduleForDay.open_time} - ${scheduleForDay.close_time}`
  }, [hoursLoading, scheduleForDay, selectedDate])

  const onSubmit = async (values: ReservationFormValues) => {
    try {
      await createReservation.mutateAsync({
        businessId: business.id,
        startTime: combineDateAndTimeToISO(values.date, values.startTime),
        endTime: combineDateAndTimeToISO(values.date, values.endTime),
        numberOfPeople: values.numberOfPeople,
      })

      onSuccess?.()
      setOpen(false)
      form.reset()
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (message) {
        toast.error(message)
      }
    }
  }

  const isSubmitting = createReservation.isPending
  const disabledBySchedule = !selectedDate || isDayClosed(scheduleForDay) || !availableStartTimes.length || !availableEndTimes.length
  const isSubmitDisabled = isSubmitting || disabledBySchedule || !startTime || !endTime

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="secondary" size="sm">
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear reservación en {business.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input type="date" min={today} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {scheduleMessage}
            </div>

            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora de inicio</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    disabled={disabledBySchedule}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una hora" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableStartTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora de fin</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    disabled={disabledBySchedule || !availableEndTimes.length}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la hora de fin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableEndTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberOfPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de personas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={8}
                      value={field.value}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? "Creando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
