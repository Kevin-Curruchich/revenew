import { Bot } from "lucide-react";

export const AgentHomePage = () => (
  <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
    <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Bot className="size-6" />
    </span>
    <h1 className="text-xl font-semibold">Asistente de ventas</h1>
    <p className="max-w-sm text-sm text-muted-foreground">
      Registra ventas, compras y movimientos de caja escribiendo en lenguaje
      natural. Elige una conversación o empieza una nueva.
    </p>
  </div>
);
