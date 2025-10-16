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
  setToken(token)
  setUser(user)
}

const getSession = () => {
  const token = getToken()
  const user = getUser()

  if (!token || !user) {
    return null
  }

  return { token, user }
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
