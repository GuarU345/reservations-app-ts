import { zodResolver } from "@hookform/resolvers/zod"
import type { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import * as authApi from "@/api/auth"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"

const verifyCodeSchema = z.object({
  code: z.string().min(1, "El código es requerido").regex(/^\d+$/, "El código debe ser numérico"),
})

type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>

interface LocationState {
  userId: string
  email: string
}

export const VerifyCodePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const state = location.state as LocationState | null

  const form = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
    },
  })

  // Si no hay estado, redirigir al login
  useEffect(() => {
    if (!state?.userId) {
      navigate("/auth/sign-in", { replace: true })
    }
  }, [state?.userId, navigate])

  const handleSubmit = async (values: VerifyCodeFormValues) => {
    if (!state?.userId) return

    setSubmitting(true)
    try {
      const response = await authApi.verifyCode({
        user_id: state.userId,
        code: parseInt(values.code, 10),
      })

      setSession({
        token: response.token,
        user: {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          phone: "",
          role: response.user.role,
        },
      })

      toast.success("Código verificado correctamente")
      navigate("/", { replace: true })
    } catch (error) {
      console.log(error)
      const err = error as AxiosError<{ message?: string }>
      const message = err.response?.data?.message ?? "Código inválido o expirado"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  // Mostrar nada mientras se redirige
  if (!state?.userId) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Hemos enviado un código de verificación a <span className="font-medium">{state.email}</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de verificación</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    maxLength={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Verificando..." : "Verificar código"}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-muted-foreground text-center">
        <button
          type="button"
          onClick={() => navigate("/auth/sign-in", { replace: true })}
          className="font-medium text-primary hover:underline"
        >
          Volver al inicio de sesión
        </button>
      </p>
    </div>
  )
}
