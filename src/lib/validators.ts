import { email_regex } from "@/constants/regex";

export function validateEmail(email: string) {
  if (!email) return { isValid: false, validatedEmail: null };

  const isValid = email_regex.test(email);
  return { isValid, validatedEmail: isValid ? email : null };
}
