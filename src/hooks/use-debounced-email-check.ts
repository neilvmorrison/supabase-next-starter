import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseDebouncedEmailCheckOptions {
  delay?: number;
  onEmailExists?: (exists: boolean) => void;
}

interface UseDebouncedEmailCheckReturn {
  email: string;
  setEmail: (email: string) => void;
  isChecking: boolean;
  emailExists: boolean | null;
  error: string | null;
}

export function useDebouncedEmailCheck({
  delay = 500,
  onEmailExists,
}: UseDebouncedEmailCheckOptions = {}): UseDebouncedEmailCheckReturn {
  const [email, setEmailState] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckedEmail, setLastCheckedEmail] = useState<string | null>(null);

  const checkEmailExists = useCallback(
    async (emailToCheck: string) => {
      if (!emailToCheck || !emailToCheck.includes("@")) {
        setEmailExists(null);
        setLastCheckedEmail(null);
        return;
      }

      // Don't check if we already checked this exact email
      if (lastCheckedEmail === emailToCheck) {
        return;
      }

      setIsChecking(true);
      setError(null);

      try {
        const supabase = createClient();
        const { data, error: queryError } = await supabase
          .from("user_profiles")
          .select("email")
          .eq("email", emailToCheck)
          .maybeSingle();

        if (queryError) {
          throw queryError;
        }

        const exists = !!data;
        setEmailExists(exists);
        setLastCheckedEmail(emailToCheck);
        onEmailExists?.(exists);
      } catch (err) {
        console.error("Error checking email:", err);
        setError("Failed to check email. Please try again.");
        setEmailExists(null);
        setLastCheckedEmail(null);
      } finally {
        setIsChecking(false);
      }
    },
    [onEmailExists, lastCheckedEmail]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (email) {
        // Only check if we haven't already checked this email
        if (lastCheckedEmail !== email) {
          checkEmailExists(email);
        }
      } else {
        setEmailExists(null);
        setError(null);
        setLastCheckedEmail(null);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [email, delay, checkEmailExists, lastCheckedEmail]);

  const setEmail = useCallback(
    (newEmail: string) => {
      setEmailState(newEmail);
      setError(null);
      // Reset the last checked email when a new email is entered
      if (newEmail !== lastCheckedEmail) {
        setLastCheckedEmail(null);
        setEmailExists(null);
      }
    },
    [lastCheckedEmail]
  );

  return {
    email,
    setEmail,
    isChecking,
    emailExists,
    error,
  };
}
