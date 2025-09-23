import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "scroll-m-20 text-lg font-semibold tracking-tight",
      h6: "scroll-m-20 text-base font-semibold tracking-tight",
      body: "text-base leading-7",
      "body-bold": "text-base font-semibold leading-7",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  asChild?: boolean;
  dimmed?: boolean;
  component?: React.ElementType;
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      className,
      variant,
      dimmed = false,
      asChild = false,
      component,
      children,
      ...props
    },
    ref
  ) => {
    const Component = asChild
      ? Slot
      : component
      ? component
      : variant?.toString().startsWith("h") &&
        ["h1", "h2", "h3", "h4", "h5", "h6"].includes(variant.toString())
      ? (variant as React.ElementType)
      : "p";

    return (
      <Component
        className={cn(
          textVariants({ variant }),
          dimmed && "text-gray-500",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = "Text";

export { Text, textVariants };
