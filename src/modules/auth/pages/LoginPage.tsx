import { useTransition, type FormEvent } from "react";
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

export const LoginPage = () => {
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const [isSubmitting, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    // On success the auth store updates and <LoginGuard /> redirects.
    startTransition(() => login(email, password));
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

          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a Revenew
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
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
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>
            <FormErrorAlert message={error} />
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
