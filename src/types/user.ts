export type UserRole = "CUSTOMER" | "BUSINESS_OWNER"

export interface User {
  id?: string
  name: string
  email: string
  role: UserRole
  phone?: string
}
