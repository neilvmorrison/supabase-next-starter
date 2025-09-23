"use client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useForm } from "@/hooks/use-form";
import { useDebouncedEmailCheck } from "@/hooks/use-debounced-email-check";
import { useState } from "react";
import { signInWithMagicLink } from "@/lib/auth-client";

interface FormValues extends Record<string, unknown> {
  email: string;
  firstName: string;
  lastName: string;
}

export default function LoginForm() {
  const [showNameFields, setShowNameFields] = useState(false);

  const { values, errors, isSubmitting, setValue, handleSubmit } =
    useForm<FormValues>({
      initialValues: {
        email: "",
        firstName: "",
        lastName: "",
      },
      onSubmit: async (values) => {
        await signInWithMagicLink(values.email);
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

  // Sync the email from the debounced hook with the form
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setValue("email", value);
  };

  return (
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
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        {emailCheckError && (
          <p className="text-sm text-red-500">{emailCheckError}</p>
        )}
        {isChecking && (
          <p className="text-sm text-gray-500">Checking email...</p>
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
  );
}
