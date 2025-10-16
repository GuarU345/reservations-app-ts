import { Navigate, Outlet } from "react-router-dom"

import { FullscreenLoader } from "@/components/feedback/fullscreen-loader"
import { useAuth } from "@/hooks/use-auth"

export const PublicRoute = () => {
  const { isAuthenticated, status } = useAuth()

  if (status === "idle" || status === "loading") {
    return <FullscreenLoader message="Cargando" />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
