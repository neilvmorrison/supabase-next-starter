import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

function Input({ className, type, left, right, ...props }: InputProps) {
  return (
    <div className="relative flex w-full items-center">
      {left && (
        <div className="absolute left-2 flex items-center pointer-events-none">
          {left}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          left && "pl-8",
          right && "pr-8",
          className
        )}
        {...props}
      />
      {right && (
        <div className="absolute right-2 flex items-center">{right}</div>
      )}
    </div>
  );
}

export { Input };
