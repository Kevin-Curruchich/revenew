import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface SetupLink {
  email: string;
  link: string;
  emailSent: boolean;
}

/**
 * The backend sends no email: Firebase mails its "password reset" template,
 * which also works for a member who never had a password.
 */
export const sendSetupEmail = async (
  email: string,
  link: string,
): Promise<SetupLink> => {
  const emailSent = await sendPasswordResetEmail(auth, email).then(
    () => true,
    () => false,
  );
  return { email, link, emailSent };
};
