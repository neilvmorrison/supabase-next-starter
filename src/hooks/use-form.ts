import { useState, useCallback, FormEvent } from "react";

export interface UseFormOptions<T> {
  initialValues: T;
  onSubmit?: (values: T) => void | Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  clearErrors: () => void;
  reset: () => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleChange: <K extends keyof T>(field: K) => (value: T[K]) => void;
  getFieldProps: <K extends keyof T>(
    field: K
  ) => {
    value: T[K];
    onChange: (value: T[K]) => void;
    error: string | undefined;
  };
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrorsState((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrorsState((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setErrors = useCallback(
    (newErrors: Partial<Record<keyof T, string>>) => {
      setErrorsState((prev) => ({ ...prev, ...newErrors }));
    },
    []
  );

  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleChange = useCallback(
    <K extends keyof T>(field: K) => {
      return (value: T[K]) => {
        setValue(field, value);
      };
    },
    [setValue]
  );

  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => {
      return {
        value: values[field],
        onChange: (value: T[K]) => setValue(field, value),
        error: errors[field],
      };
    },
    [values, errors, setValue]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault(); // Prevent default form submission

      if (!onSubmit) return;

      setIsSubmitting(true);
      clearErrors();

      try {
        // Run validation if provided
        if (validate) {
          const validationErrors = validate(values);
          const hasErrors = Object.keys(validationErrors).length > 0;

          if (hasErrors) {
            setErrors(validationErrors);
            return;
          }
        }

        await onSubmit(values);
      } catch (error) {
        console.error("Form submission error:", error);
        // You might want to set a general error here
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit, validate, clearErrors, setErrors]
  );

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    setValues,
    setError,
    setErrors,
    clearErrors,
    reset,
    handleSubmit,
    handleChange,
    getFieldProps,
  };
}
