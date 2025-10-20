import { createContext } from "react"

import type { AuthResponse, AuthStatus, SignInPayload, SignUpPayload } from "@/types/auth"
import type { User } from "@/types/user"

export interface AuthContextValue {
  user: User | null
  token: string | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (payload: SignInPayload) => Promise<AuthResponse>
  register: (payload: SignUpPayload) => Promise<User>
  logout: () => void
  setSession: (session: AuthResponse | null) => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
