import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import {
  useBusinesses,
  useBusinessHours,
  useCreateBusiness,
  useDeleteBusiness,
  useFavoriteBusinesses,
  useToggleFavorite,
  useUpdateBusiness,
  useUpdateBusinessHours,
} from "@/hooks/use-businesses"
import { useBusinessCategories } from "@/hooks/use-categories"
import { ReservationDialog } from "@/components/reservations/reservation-dialog"
import type { BusinessHours, BusinessSummary, UpsertBusinessPayload } from "@/types/business"

const businessSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  phone: z
    .string()
    .min(10, "El teléfono debe tener 10 dígitos")
    .max(13, "El teléfono no debe exceder 13 dígitos"),
  email: z.string().email("Ingresa un correo válido"),
  categoryId: z.string().uuid("Selecciona una categoría"),
})

type BusinessFormValues = z.infer<typeof businessSchema>

const dayLabels = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
]

const formatHour = (value: string | null) => {
  if (!value) return ""
  if (/^\d{2}:\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(11, 16)
}

const CustomerBusinessesView = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>("todas")
  const { data: categories } = useBusinessCategories()
  const categoryId = categoryFilter === "todas" ? undefined : categoryFilter
  const { data: businesses, isLoading } = useBusinesses({ categoryId })
  const { data: favorites } = useFavoriteBusinesses()
  const toggleFavorite = useToggleFavorite()

  const isEmpty = !isLoading && (businesses?.length ?? 0) === 0

  const handleToggleFavorite = (business: BusinessSummary) => {
    const liked = business.liked ?? favorites?.some((fav) => fav.id === business.id) ?? false
    toggleFavorite.mutate({ businessId: business.id, liked })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Catálogo de negocios</h2>
          <p className="text-sm text-muted-foreground">
            Descubre negocios disponibles y agenda tu próxima reservación.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Label className="text-sm text-muted-foreground">Categoría</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando negocios...</p>
      ) : isEmpty ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
          No encontramos negocios para esta categoría por ahora.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {businesses?.map((business) => {
            const liked = business.liked ?? favorites?.some((fav) => fav.id === business.id) ?? false
            return (
              <Card key={business.id} className="relative overflow-hidden">
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <CardDescription>{business.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {business.business_categories?.category ?? "Sin categoría"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">Dirección</p>
                    <p className="text-muted-foreground">{business.address}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <span>Tel: {business.phone}</span>
                    <span>Email: {business.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant={liked ? "default" : "outline"} onClick={() => handleToggleFavorite(business)}>
                      {liked ? "En favoritos" : "Agregar a favoritos"}
                    </Button>
                    <ReservationDialog business={business} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

const BusinessForm = ({
  defaultValues,
  onSubmit,
  submitting,
  actionLabel,
}: {
  defaultValues?: Partial<BusinessFormValues>
  onSubmit: (values: BusinessFormValues) => Promise<void>
  submitting: boolean
  actionLabel: string
}) => {
  const { data: categories } = useBusinessCategories()

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      address: defaultValues?.address ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      categoryId: defaultValues?.categoryId ?? "",
    },
  })

  useEffect(() => {
    form.reset({
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      address: defaultValues?.address ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      categoryId: defaultValues?.categoryId ?? "",
    })
  }, [defaultValues, form])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
        className="grid gap-4 md:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Nombre del negocio</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Café Central" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe tu negocio" rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Calle, número, ciudad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="521234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo de contacto</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contacto@negocio.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Categoría</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : actionLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}

const BusinessHoursTable = ({ businessId }: { businessId: string }) => {
  const { data: hours, isLoading } = useBusinessHours(businessId)
  const updateHours = useUpdateBusinessHours()
  const [localHours, setLocalHours] = useState<BusinessHours[]>([])

  useEffect(() => {
    if (hours) {
      setLocalHours(hours)
    }
  }, [hours])

  const handleChange = (hourId: string, field: "is_closed" | "open_time" | "close_time", value: string | boolean) => {
    setLocalHours((prev) =>
      prev.map((item) =>
        item.id === hourId
          ? (() => {
              if (field === "is_closed") {
                const isClosed = Boolean(value)
                return {
                  ...item,
                  is_closed: isClosed,
                  open_time: isClosed ? null : item.open_time ?? "09:00",
                  close_time: isClosed ? null : item.close_time ?? "18:00",
                }
              }

              if (field === "open_time" || field === "close_time") {
                const timeValue = typeof value === "string" ? value : ""
                return {
                  ...item,
                  [field]: timeValue || null,
                }
              }

              return item
            })()
          : item,
      ),
    )
  }

  const handleSave = (hour: BusinessHours) => {
    const normalizedOpen = formatHour(hour.open_time)
    const normalizedClose = formatHour(hour.close_time)

    if (!hour.is_closed) {
      if (!normalizedOpen || !normalizedClose) {
        toast.error("Define las horas de apertura y cierre antes de guardar")
        return
      }

      const toMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number)
        return h * 60 + m
      }

      if (toMinutes(normalizedOpen) >= toMinutes(normalizedClose)) {
        toast.error("La hora de cierre debe ser mayor a la hora de apertura")
        return
      }
    }

    updateHours.mutate({
      id: hour.id,
      payload: {
        isClosed: hour.is_closed,
        openTime: hour.is_closed ? undefined : normalizedOpen,
        closeTime: hour.is_closed ? undefined : normalizedClose,
      },
    })
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando horarios...</p>
  }

  if (!localHours.length) {
    return <p className="text-sm text-muted-foreground">No hay horarios configurados aún.</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-4 py-2 font-medium">Día</th>
            <th className="px-4 py-2 font-medium">Abierto</th>
            <th className="px-4 py-2 font-medium">Apertura</th>
            <th className="px-4 py-2 font-medium">Cierre</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {localHours.map((hour) => (
            <tr key={hour.id} className="border-t">
              <td className="px-4 py-2 font-medium">{dayLabels[hour.day_of_week] ?? `Día ${hour.day_of_week}`}</td>
              <td className="px-4 py-2">
                <Switch
                  checked={!hour.is_closed}
                  onCheckedChange={(checked) => handleChange(hour.id, "is_closed", !checked)}
                />
              </td>
              <td className="px-4 py-2">
                <Input
                  type="time"
                  value={formatHour(hour.open_time)}
                  disabled={hour.is_closed}
                  onChange={(event) => handleChange(hour.id, "open_time", event.target.value)}
                />
              </td>
              <td className="px-4 py-2">
                <Input
                  type="time"
                  value={formatHour(hour.close_time)}
                  disabled={hour.is_closed}
                  onChange={(event) => handleChange(hour.id, "close_time", event.target.value)}
                />
              </td>
              <td className="px-4 py-2 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updateHours.isPending}
                  onClick={() => handleSave(hour)}
                >
                  Guardar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const OwnerBusinessCard = ({ business }: { business: BusinessSummary }) => {
  const updateBusiness = useUpdateBusiness(business.id)
  const deleteBusiness = useDeleteBusiness()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleUpdate = async (values: BusinessFormValues) => {
    await updateBusiness.mutateAsync(values as UpsertBusinessPayload)
  }

  const handleDelete = async () => {
    await deleteBusiness.mutateAsync(business.id)
    setConfirmDelete(false)
  }

  return (
    <Card>
      <CardHeader className="flex-col gap-4 space-y-0 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <CardTitle>{business.name}</CardTitle>
          <CardDescription>{business.description}</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{business.business_categories?.category ?? "Sin categoría"}</Badge>
          <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Eliminar negocio?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Esta acción despublicará tu negocio. Podrás registrarlo nuevamente si lo necesitas.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleteBusiness.isPending}>
                  {deleteBusiness.isPending ? "Eliminando..." : "Eliminar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
            Eliminar negocio
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Dirección:</span> {business.address}
          </p>
          <p>
            <span className="font-medium text-foreground">Teléfono:</span> {business.phone}
          </p>
          <p>
            <span className="font-medium text-foreground">Correo:</span> {business.email}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Información general</h3>
            <BusinessForm
              defaultValues={{
                name: business.name,
                description: business.description,
                address: business.address,
                phone: business.phone,
                email: business.email,
                categoryId: business.category_id,
              }}
              onSubmit={handleUpdate}
              submitting={updateBusiness.isPending}
              actionLabel="Guardar cambios"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Horarios de atención</h3>
            <BusinessHoursTable businessId={business.id} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const OwnerBusinessView = () => {
  const { data: businesses, isLoading } = useBusinesses({ owner: true })
  const createBusiness = useCreateBusiness()
  const [showCreateForm, setShowCreateForm] = useState(false)

  const hasBusinesses = (businesses?.length ?? 0) > 0

  useEffect(() => {
    if (!isLoading && !hasBusinesses) {
      setShowCreateForm(true)
    }
  }, [hasBusinesses, isLoading])

  const handleCreate = async (values: BusinessFormValues) => {
    try {
      await createBusiness.mutateAsync(values as UpsertBusinessPayload)
      setShowCreateForm(false)
    } catch (error) {
      // el toast es manejado por el hook de mutación
      console.error(error)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando tus negocios...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Gestión de negocios</h2>
          <p className="text-sm text-muted-foreground">
            Administra la información y los horarios de todos tus negocios.
          </p>
        </div>
        <Button variant={showCreateForm ? "outline" : "default"} onClick={() => setShowCreateForm((prev) => !prev)}>
          {showCreateForm ? "Cerrar formulario" : "Registrar nuevo negocio"}
        </Button>
      </div>

      {showCreateForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Registrar negocio</CardTitle>
            <CardDescription>Completa la información para aparecer en el catálogo y recibir reservaciones.</CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessForm
              onSubmit={handleCreate}
              submitting={createBusiness.isPending}
              actionLabel="Registrar negocio"
            />
          </CardContent>
        </Card>
      ) : null}

      {!hasBusinesses && !showCreateForm ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Aún no tienes negocios registrados</CardTitle>
            <CardDescription>Utiliza el botón “Registrar nuevo negocio” para comenzar.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {businesses?.map((business) => (
        <OwnerBusinessCard key={business.id} business={business} />
      ))}
    </div>
  )
}

export const BusinessesPage = () => {
  const { user } = useAuth()
  const isCustomer = user?.role === "CUSTOMER"

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Negocios</h1>
        <p className="text-sm text-muted-foreground">
          {isCustomer
            ? "Explora negocios, marca tus favoritos y agenda reservaciones."
            : "Gestiona la información y horarios de tu negocio."}
        </p>
      </div>

      {isCustomer ? <CustomerBusinessesView /> : <OwnerBusinessView />}
    </div>
  )
}
