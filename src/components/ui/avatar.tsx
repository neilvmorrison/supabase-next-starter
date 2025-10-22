"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn, getAvatarBorderColorClass } from "@/lib/utils";

interface IAvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  className?: string;
  isActive?: boolean;
  activeColor?: string; // color name like "green", "blue", etc.
}

function Avatar({
  className,
  isActive = false,
  activeColor,
  ...props
}: IAvatarProps) {
  if (isActive) {
    return (
      <div className="relative rounded-full p-1">
        <div
          className={cn(
            "absolute inset-0 z-0",
            "border-2 rounded-full",
            "animate-ping-small",
            getAvatarBorderColorClass(activeColor)
          )}
        />

        <AvatarPrimitive.Root
          data-slot="avatar"
          className={cn(
            "relative flex size-8 shrink-0 overflow-hidden rounded-full z-10",
            className
          )}
          {...props}
        />
      </div>
    );
  }
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
