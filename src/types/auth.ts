import type { User, UserRole } from "@/types/user"

export interface SignUpPayload {
  name: string
  email: string
  password: string
  phone: string
  role: UserRole
}

export interface SignInPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated"
