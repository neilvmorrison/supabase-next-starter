"use client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useForm } from "@/hooks/use-form";
import { useDebouncedEmailCheck } from "@/hooks/use-debounced-email-check";
import { useState } from "react";
import { signInWithMagicLink } from "@/lib/auth-client";
import { Spinner } from "./ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Icon from "./ui/icons";

interface FormValues extends Record<string, unknown> {
  email: string;
  firstName: string;
  lastName: string;
}

export default function LoginForm() {
  const [showNameFields, setShowNameFields] = useState(false);
  const [showEmailScreen, setShowEmailScreen] = useState(false);
  const [showErrorScreen, setShowErrorScreen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { values, errors, isSubmitting, setValue, handleSubmit } =
    useForm<FormValues>({
      initialValues: {
        email: "",
        firstName: "",
        lastName: "",
      },
      onSubmit: async (values) => {
        let new_user_creds:
          | { first_name: string; last_name: string }
          | undefined = undefined;

        if (values.firstName && values.lastName) {
          new_user_creds = {
            first_name: values.firstName,
            last_name: values.lastName,
          };
        }
        const { error } = await signInWithMagicLink(
          values.email,
          new_user_creds
        );
        if (!error) {
          setShowEmailScreen(true);
        } else {
          setErrorMessage(
            error.message || "Failed to send magic link. Please try again."
          );
          setShowErrorScreen(true);
        }
      },
      validate: (values) => {
        const newErrors: Partial<Record<keyof FormValues, string>> = {};

        if (!values.email) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
          newErrors.email = "Please enter a valid email address";
        }

        if (showNameFields) {
          if (!values.firstName) {
            newErrors.firstName = "First name is required";
          }
          if (!values.lastName) {
            newErrors.lastName = "Last name is required";
          }
        }

        return newErrors;
      },
    });

  const {
    setEmail,
    isChecking,
    emailExists,
    error: emailCheckError,
  } = useDebouncedEmailCheck({
    onEmailExists: (exists) => {
      setShowNameFields(!exists);
      if (exists) {
        setValue("firstName", "");
        setValue("lastName", "");
      }
    },
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setValue("email", value);
  };

  if (showErrorScreen) {
    return (
      <div>
        <Alert variant="destructive">
          <Icon name="alert" size={24} asChild={true} />
          <AlertTitle>Sign-in Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <Button
          onClick={() => {
            setShowErrorScreen(false);
            setErrorMessage("");
          }}
          className="mt-4 w-full"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return !showEmailScreen ? (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={values.email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className={errors.email ? "border-red-500" : ""}
          right={isChecking ? <Spinner /> : null}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        {emailCheckError && (
          <p className="text-sm text-red-500">{emailCheckError}</p>
        )}
        {emailExists === false && !isChecking && values.email && (
          <p className="text-sm text-blue-600">
            New user detected. Please provide your name below.
          </p>
        )}
      </div>

      {showNameFields && (
        <>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="Enter your first name"
              value={values.firstName}
              onChange={(e) => setValue("firstName", e.target.value)}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Enter your last name"
              value={values.lastName}
              onChange={(e) => setValue("lastName", e.target.value)}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || isChecking}
        className="mt-4"
      >
        {isSubmitting ? "Sending..." : "Get Link"}
      </Button>
    </form>
  ) : (
    <div>
      <Alert variant="success">
        <Icon name="email_check" size={24} asChild={true} />
        <AlertTitle>Check your email!</AlertTitle>
        <AlertDescription>
          We sent an email to {values.email}, follow that link to sign into the
          application
        </AlertDescription>
      </Alert>
    </div>
  );
}
