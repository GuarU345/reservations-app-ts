import { zodResolver } from "@hookform/resolvers/zod"
import type { AxiosError } from "axios"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import * as authApi from "@/api/auth"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import ReCAPTCHA from "react-google-recaptcha";

const signInSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres"),
})

type SignInFormValues = z.infer<typeof signInSchema>

export const SignInPage = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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
        role: 'BUSINESS_OWNER' as const,
      }

      if (!captchaToken) {
        toast.error("Debes completar el reCAPTCHA");
        return;
      }

      const response = await authApi.signin(data)

      // Redirigir a la página de verificación de código
      toast.success("Te hemos enviado un código de verificación")
      navigate("/auth/verify-code", {
        replace: true,
        state: {
          userId: response.user.id,
          email: response.user.email,
        },
      })
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

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
            />
          </div>

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
