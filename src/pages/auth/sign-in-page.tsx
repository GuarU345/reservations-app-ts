import { Link } from "react-router-dom"

export const SignInPage = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Formulario de inicio de sesión pendiente de implementación.</p>
        <p>En la siguiente iteración conectaremos este flujo con la API.</p>
      </div>
      <p className="text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link to="/auth/sign-up" className="font-medium text-primary">
          Regístrate aquí
        </Link>
      </p>
    </div>
  )
}
