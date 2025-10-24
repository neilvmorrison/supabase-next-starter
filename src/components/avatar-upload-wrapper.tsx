"use client";

import { AvatarUploadButton } from "./avatar-upload-button";
import { useRouter } from "next/navigation";

interface IAvatarUploadWrapperProps {
  userId: string;
  currentAvatarUrl?: string | null;
  userInitials?: string;
  avatarColor?: string | null;
  size?: "sm" | "md" | "lg";
}

export function AvatarUploadWrapper({
  userId,
  currentAvatarUrl,
  userInitials,
  avatarColor,
  size,
}: IAvatarUploadWrapperProps) {
  const router = useRouter();

  const handleAvatarChange = () => {
    router.refresh();
  };

  return (
    <AvatarUploadButton
      userId={userId}
      currentAvatarUrl={currentAvatarUrl}
      userInitials={userInitials}
      avatarColor={avatarColor ?? ""}
      size={size}
      onAvatarChange={handleAvatarChange}
    />
  );
}
