import { Navigate, createBrowserRouter } from "react-router-dom"

import { AuthLayout } from "@/layouts/auth-layout"
import { AppLayout } from "@/layouts/app-layout"
import { SignInPage } from "@/pages/auth/sign-in-page"
import { SignUpPage } from "@/pages/auth/sign-up-page"
import { DashboardPage } from "@/pages/dashboard/dashboard-page"
import { BusinessesPage } from "@/pages/businesses/businesses-page"
import { ReservationsPage } from "@/pages/reservations/reservations-page"

import { ProtectedRoute } from "./protected-route"
import { PublicRoute } from "./public-route"

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "businesses", element: <BusinessesPage /> },
          { path: "reservations", element: <ReservationsPage /> },
        ],
      },
    ],
  },
  {
    path: "/auth",
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { index: true, element: <Navigate to="sign-in" replace /> },
          { path: "sign-in", element: <SignInPage /> },
          { path: "sign-up", element: <SignUpPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
])
