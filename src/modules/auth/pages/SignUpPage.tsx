import { useEffect, useTransition, type FormEvent } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import { useAuthStore } from "../store/auth.store";

export const SignUpPage = () => {
  const signUp = useAuthStore((state) => state.signUp);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const [isSubmitting, startTransition] = useTransition();

  // Don't carry an error over from the login page.
  useEffect(() => clearError(), [clearError]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const field = (name: string) => String(formData.get(name) ?? "").trim();

    // On success the auth store signs in and <LoginGuard /> redirects.
    startTransition(() =>
      signUp({
        business_name: field("business_name"),
        display_name: field("display_name") || null,
        email: field("email"),
        password: String(formData.get("password") ?? ""),
      }),
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <img
            src="/logo.svg"
            alt="Revenew"
            className="h-6 w-auto m-auto mb-4"
          />

          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            Registra tu comercio. Tú serás su administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="business_name">Nombre del comercio</Label>
              <Input
                id="business_name"
                name="business_name"
                autoComplete="organization"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Tu nombre (opcional)</Label>
              <Input
                id="display_name"
                name="display_name"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>
            <FormErrorAlert message={error} />
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-foreground underline"
              >
                Inicia sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
