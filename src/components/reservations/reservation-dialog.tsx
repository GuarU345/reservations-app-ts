import { zodResolver } from "@hookform/resolvers/zod"
import { useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { BusinessSummary } from "@/types/business"
import { useCreateReservation } from "@/hooks/use-reservations"

const reservationSchema = z
  .object({
    startTime: z.string().min(1, "Selecciona una fecha de inicio"),
    endTime: z.string().min(1, "Selecciona una fecha de fin"),
    numberOfPeople: z.number().min(1, "Debe ser al menos 1 persona").max(8, "Máximo 8 personas"),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    path: ["endTime"],
    message: "La hora de fin debe ser posterior a la de inicio",
  })

type ReservationFormValues = z.infer<typeof reservationSchema>

type ReservationDialogProps = {
  business: Pick<BusinessSummary, "id" | "name">
  triggerLabel?: string
  onSuccess?: () => void
  trigger?: ReactNode
}

const convertToDateTimeLocal = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 16)
}

export const ReservationDialog = ({
  business,
  triggerLabel = "Reservar",
  onSuccess,
  trigger,
}: ReservationDialogProps) => {
  const [open, setOpen] = useState(false)
  const createReservation = useCreateReservation()

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
      numberOfPeople: 1,
    },
  })

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      form.reset({
        startTime: "",
        endTime: "",
        numberOfPeople: 1,
      })
    }
    setOpen(value)
  }

  const onSubmit = async (values: ReservationFormValues) => {
    try {
      await createReservation.mutateAsync({
        businessId: business.id,
        startTime: new Date(values.startTime).toISOString(),
        endTime: new Date(values.endTime).toISOString(),
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
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora de inicio</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={convertToDateTimeLocal(field.value)}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  </FormControl>
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
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={convertToDateTimeLocal(field.value)}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={createReservation.isPending}>
                {createReservation.isPending ? "Creando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
