import { zodResolver } from "@hookform/resolvers/zod"
import type { AxiosError } from "axios"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"

const signInSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres"),
})

type SignInFormValues = z.infer<typeof signInSchema>

export const SignInPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleSubmit = async (values: SignInFormValues) => {
    setSubmitting(true)
    try {

      const data = {
        ...values,
        role: 'BUSINESS_OWNER',
      }

      await login(data)
      toast.success("Sesión iniciada correctamente")
      navigate("/", { replace: true })
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>
      const message = err.response?.data?.message ?? "No se pudo iniciar sesión"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="tu@correo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-muted-foreground text-center">
        ¿No tienes cuenta?{" "}
        <Link to="/auth/sign-up" className="font-medium text-primary">
          Regístrate aquí
        </Link>
      </p>
    </div>
  )
}
