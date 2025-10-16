import { Link } from "react-router-dom"

export const SignUpPage = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Muy pronto podrás crear una cuenta directamente desde esta pantalla.</p>
        <p>Prepararemos el formulario y la validación durante el siguiente paso.</p>
      </div>
      <p className="text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{" "}
        <Link to="/auth/sign-in" className="font-medium text-primary">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  )
}
