import { api } from "@/lib/api-client"
import type { SignInPayload, SignInResponse, SignUpPayload, VerifyCodePayload, VerifyCodeResponse } from "@/types/auth"
import type { User } from "@/types/user"

export const signin = async (payload: SignInPayload) => {
  const { data } = await api.post<SignInResponse>("/signin", payload)
  return data
}

export const signup = async (payload: SignUpPayload) => {
  const { data } = await api.post<User>("/signup", payload)
  return data
}

export const verifyCode = async (payload: VerifyCodePayload) => {
  const { data } = await api.post<VerifyCodeResponse>("/verify", payload)
  return data
}

export const tokenIsActive = async (token: string) => {
  const { data } = await api.get("/session/active", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}
