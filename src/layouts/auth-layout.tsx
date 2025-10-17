import { Link, Outlet } from "react-router-dom"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link to="/" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Bookly
          </Link>
          <CardTitle className="text-2xl">Bienvenido de vuelta</CardTitle>
          <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Outlet />
        </CardContent>
      </Card>
    </div>
  )
}
