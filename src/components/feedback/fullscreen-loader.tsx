import { Spinner } from "@/components/ui/spinner"

interface FullscreenLoaderProps {
  message?: string
}

export const FullscreenLoader = ({ message = "Cargando" }: FullscreenLoaderProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
      <Spinner className="size-8" />
      <p className="text-sm font-medium text-muted-foreground">{message}...</p>
    </div>
  )
}
