import { FirebaseError } from "firebase/app";
import { getErrorMessage } from "@/lib/errors";

const firebaseAuthMessages: Record<string, string> = {
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  "auth/invalid-email": "El email no es válido.",
  "auth/user-not-found": "Email o contraseña incorrectos.",
  "auth/wrong-password": "Email o contraseña incorrectos.",
  "auth/user-disabled": "Tu cuenta ha sido deshabilitada.",
  "auth/too-many-requests":
    "Demasiados intentos fallidos. Espera un momento e intenta de nuevo.",
  "auth/network-request-failed":
    "No se pudo conectar. Revisa tu conexión a internet.",
};

export const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    return firebaseAuthMessages[error.code] ?? "No se pudo iniciar sesión.";
  }
  return getErrorMessage(error, "No se pudo iniciar sesión.");
};
