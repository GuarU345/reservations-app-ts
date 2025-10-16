import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { AuthProvider } from "@/context/auth-provider"
import { Toaster } from "@/components/ui/sonner"
import { queryClient } from "@/lib/query-client"

import { ThemeProvider } from "./theme-provider"

type AppProvidersProps = {
  children: React.ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
