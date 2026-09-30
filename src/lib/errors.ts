import { isAxiosError } from "axios";

interface ApiErrorBody {
  detail?: unknown;
  message?: unknown;
}

const extractApiMessage = (body: ApiErrorBody | undefined): string | null => {
  if (!body) return null;

  if (typeof body.detail === "string") return body.detail;
  if (typeof body.message === "string") return body.message;

  // FastAPI-style validation errors: { detail: [{ msg: "..." }] }
  if (Array.isArray(body.detail)) {
    const messages = body.detail
      .map((item) =>
        item && typeof item === "object" && "msg" in item
          ? String(item.msg)
          : null,
      )
      .filter(Boolean);
    if (messages.length > 0) return messages.join(". ");
  }

  return null;
};

/**
 * Normalizes any thrown value (axios errors, Error, strings) into a message
 * that can be shown to the user.
 */
export const getErrorMessage = (
  error: unknown,
  fallback = "Ocurrió un error inesperado. Intenta de nuevo.",
): string => {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return "No se pudo conectar con el servidor. Revisa tu conexión.";
    }
    return extractApiMessage(error.response.data) ?? fallback;
  }

  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;

  return fallback;
};
