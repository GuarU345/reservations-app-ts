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
import type { UserRole } from "@/types/user"

const signUpSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Ingresa un correo válido"),
  password: z
    .string()
    .min(10, "La contraseña debe tener al menos 10 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{10,32}$/g, {
      message: "Incluye mayúsculas, minúsculas, número y caracter especial",
    }),
  phone: z
    .string()
    .min(10, "El teléfono debe tener 10 dígitos")
    .max(13, "El teléfono no debe exceder 13 dígitos"),
  role: z.enum(["BUSINESS_OWNER"] satisfies [UserRole]),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

export const SignUpPage = () => {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "BUSINESS_OWNER",
    },
  })

  const handleSubmit = async (values: SignUpFormValues) => {
    setSubmitting(true)
    try {
      await registerUser(values)
      toast.success("Cuenta creada, inicia sesión")
      navigate("/auth/sign-in", { replace: true })
    } catch (error) {
      const err = error as AxiosError<{ message?: string; errors?: { message: string }[] }>
      const message =
        err.response?.data?.message ?? err.response?.data?.errors?.[0]?.message ?? "No se pudo crear la cuenta"
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@correo.com" autoComplete="email" {...field} />
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
                  <Input type="password" placeholder="********" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="521234567890" autoComplete="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-muted-foreground text-center">
        ¿Ya tienes una cuenta?{" "}
        <Link to="/auth/sign-in" className="font-medium text-primary">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  )
}
