import { tokenIsActive } from "@/api/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export const DashboardPage = () => {
  const { user, token, isAuthenticated,logout } = useAuth()

  const navigate = useNavigate()

  useEffect(() => {
    const checkTokenIsActive = async () => {
      try {
        const response = await tokenIsActive(token!)
        if (!response.active) {
          logout()
          navigate("/auth/sign-in")
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (isAuthenticated && token) {
      checkTokenIsActive()
    }
  }, [isAuthenticated])

  return (
    <div className="grid gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Panel principal</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona tus reservaciones y negocios desde un solo lugar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado de la sesión</CardTitle>
          <CardDescription>Resumen rápido del usuario autenticado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Nombre:</span>
            <p className="font-medium">{user?.name ?? "Desconocido"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Correo:</span>
            <p className="font-medium">{user?.email ?? "Sin definir"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
