import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { Button } from "@/components/ui/button";

const ErrorLayout = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="max-w-md text-muted-foreground">{description}</p>
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => window.location.reload()}>
        Recargar
      </Button>
      <Button asChild>
        <Link to="/dashboard">Ir al Dashboard</Link>
      </Button>
    </div>
  </div>
);

export const NotFoundPage = () => (
  <ErrorLayout
    title="Página no encontrada"
    description="La página que buscas no existe o fue movida."
  />
);

/** Catches render errors and failed lazy imports (e.g. after a deploy). */
export const RouteErrorPage = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  if (import.meta.env.DEV) {
    console.error(error);
  }

  return (
    <ErrorLayout
      title="Algo salió mal"
      description="Ocurrió un error inesperado. Recarga la página e intenta de nuevo."
    />
  );
};
