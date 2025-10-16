import { api } from "@/lib/api-client"
import type { AuthResponse, SignInPayload, SignUpPayload } from "@/types/auth"
import type { User } from "@/types/user"

export const signin = async (payload: SignInPayload) => {
  const { data } = await api.post<AuthResponse>("/signin", payload)
  return data
}

export const signup = async (payload: SignUpPayload) => {
  const { data } = await api.post<User>("/signup", payload)
  return data
}
