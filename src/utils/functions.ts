export const extractErrorMessage = (error: unknown) =>
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message