import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useFavoriteBusinesses, useToggleFavorite } from "@/hooks/use-businesses"
import { ReservationDialog } from "@/components/reservations/reservation-dialog"

export const FavoritesPage = () => {
  const { user } = useAuth()
  const isCustomer = user?.role === "CUSTOMER"
  const { data: favorites, isLoading } = useFavoriteBusinesses({ enabled: isCustomer })
  const toggleFavorite = useToggleFavorite()

  if (!isCustomer) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Favoritos</h1>
          <p className="text-sm text-muted-foreground">
            Solo los clientes pueden gestionar negocios favoritos.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
            <CardDescription>Inicia sesión con un rol de cliente para ver tus favoritos.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleToggleFavorite = (businessId: string) => {
    toggleFavorite.mutate({ businessId, liked: true })
  }

  const hasFavorites = (favorites?.length ?? 0) > 0

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Favoritos</h1>
        <p className="text-sm text-muted-foreground">Accede rápido a los negocios que más te gustan.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando favoritos...</p>
      ) : !hasFavorites ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-medium">No tienes favoritos aún</CardTitle>
            <CardDescription>
              Explora el catálogo de negocios y agrega aquellos que quieras tener a la mano.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {favorites?.map((business) => (
            <Card key={business.id} className="flex flex-col justify-between">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <CardDescription>{business.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{business.business_categories?.category ?? "Sin categoría"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-1 text-muted-foreground">
                  <p>Dirección: {business.address}</p>
                  <p>Teléfono: {business.phone}</p>
                  <p>Correo: {business.email}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleToggleFavorite(business.id)}>
                    Quitar de favoritos
                  </Button>
                  <ReservationDialog business={{ id: business.id, name: business.name }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
