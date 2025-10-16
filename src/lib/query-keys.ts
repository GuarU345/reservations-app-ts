export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  categories: {
    list: ["categories"] as const,
  },
  businesses: {
    root: ["businesses"] as const,
    list: (filters?: { categoryId?: string; owner?: boolean }) =>
      ["businesses", "list", filters ?? {}] as const,
    detail: (businessId: string) => ["businesses", "detail", businessId] as const,
    hours: (businessId: string) => ["businesses", "detail", businessId, "hours"] as const,
  },
  favorites: {
    list: ["favorites"] as const,
  },
  reservations: {
    list: ["reservations"] as const,
  },
}
