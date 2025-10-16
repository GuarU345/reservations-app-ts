import type { AuthResponse } from "@/types/auth"
import type { User } from "@/types/user"

const TOKEN_KEY = "reservations.token"
const USER_KEY = "reservations.user"

const isBrowser = typeof window !== "undefined"

const safeParse = <T>(raw: string | null): T | null => {
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn("Failed to parse storage value", error)
    return null
  }
}

const decodeBase64 = (value: string) => {
  if (typeof atob === "function") {
    return atob(value)
  }

  const globalRef = globalThis as Record<string, unknown>
  const maybeBuffer = globalRef?.Buffer as { from?: (input: string, encoding: string) => { toString: (encoding: string) => string } } | undefined

  if (maybeBuffer?.from) {
    return maybeBuffer.from(value, "base64").toString("utf-8")
  }

  throw new Error("No base64 decoder available")
}

const decodeToken = (token: string) => {
  try {
    const [, payload] = token.split(".")
    if (!payload) return null
    const decoded = JSON.parse(decodeBase64(payload)) as { id?: string; email?: string; role?: string }
    return decoded
  } catch (error) {
    console.warn("Failed to decode token", error)
    return null
  }
}

const mergeUserWithToken = (user: User, token: string) => {
  const decoded = decodeToken(token)
  if (!decoded) return user

  return {
    ...user,
    id: decoded.id ?? user.id,
    email: decoded.email ?? user.email,
    role: (decoded.role as User["role"]) ?? user.role,
  }
}

const setToken = (token: string) => {
  if (!isBrowser) return
  window.localStorage.setItem(TOKEN_KEY, token)
}

const getToken = () => {
  if (!isBrowser) return null
  return window.localStorage.getItem(TOKEN_KEY)
}

const setUser = (user: User) => {
  if (!isBrowser) return
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

const getUser = () => {
  if (!isBrowser) return null
  return safeParse<User>(window.localStorage.getItem(USER_KEY))
}

const setSession = ({ token, user }: AuthResponse) => {
  const mergedUser = mergeUserWithToken(user, token)
  setToken(token)
  setUser(mergedUser)
}

const getSession = () => {
  const token = getToken()
  const storedUser = getUser()

  if (!token || !storedUser) {
    return null
  }

  const mergedUser = mergeUserWithToken(storedUser, token)

  if (mergedUser !== storedUser) {
    setUser(mergedUser)
  }

  return { token, user: mergedUser }
}

const clearSession = () => {
  if (!isBrowser) return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export const storage = {
  setToken,
  getToken,
  setUser,
  getUser,
  setSession,
  getSession,
  clearSession,
}
