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
  role?: UserRole
}

export interface SignInResponse {
  user: {
    id: string
    email: string
  }
}

export interface VerifyCodePayload {
  user_id: string
  code: number
}

export interface VerifyCodeResponse {
  message: string
  token: string
  user: {
    id: string
    name: string
    email: string
    role: UserRole
  }
}

export interface AuthResponse {
  token: string
  user: User
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated"
