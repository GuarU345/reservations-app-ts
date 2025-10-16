import { Navigate, Outlet, useLocation } from "react-router-dom"

import { FullscreenLoader } from "@/components/feedback/fullscreen-loader"
import { useAuth } from "@/hooks/use-auth"

export const ProtectedRoute = () => {
  const { isAuthenticated, status } = useAuth()
  const location = useLocation()

  if (status === "idle" || status === "loading") {
    return <FullscreenLoader message="Validando sesión" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location }} />
  }

  return <Outlet />
}
