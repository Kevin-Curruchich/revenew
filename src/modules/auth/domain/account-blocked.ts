/**
 * The backend answers 403 with these exact `detail` texts when the account
 * can't use the app. They are fixed by the API contract.
 */
const ACCOUNT_BLOCKED_MESSAGES: Record<string, string> = {
  "Tu cuenta no pertenece a ningun comercio":
    "Tu cuenta no pertenece a ningún comercio. Pide al administrador que te agregue.",
  "Tu cuenta esta desactivada":
    "Tu cuenta está desactivada. Habla con el administrador de tu comercio.",
};

/** Message to show when a response means the session must end, else null. */
export const getAccountBlockedMessage = (
  status: number | undefined,
  detail: unknown,
): string | null =>
  status === 403 && typeof detail === "string"
    ? (ACCOUNT_BLOCKED_MESSAGES[detail] ?? null)
    : null;
