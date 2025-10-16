export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  categories: {
    list: ["categories"] as const,
  },
  businesses: {
    list: (categoryId?: string) => ["businesses", { categoryId }] as const,
    detail: (businessId: string) => ["business", businessId] as const,
    hours: (businessId: string) => ["business", businessId, "hours"] as const,
  },
  favorites: {
    list: ["favorites"] as const,
  },
  reservations: {
    list: ["reservations"] as const,
  },
}
