"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@/components/ui";
import {
  upload_user_avatar,
  delete_user_avatar,
  update_user_avatar,
} from "@/lib/uploads";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IAvatarUploadButtonProps {
  userId: string;
  currentAvatarUrl?: string | null;
  userInitials?: string;
  avatarColor?: string | null;
  onAvatarChange?: (avatarUrl: string | null) => void;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export function AvatarUploadButton({
  userId,
  currentAvatarUrl,
  userInitials = "U",
  avatarColor,
  onAvatarChange,
  size = "md",
}: IAvatarUploadButtonProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    currentAvatarUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const action = avatarUrl ? update_user_avatar : upload_user_avatar;
      const result = await action(userId, formData);

      if (!result.success) {
        toast.error("Upload failed", {
          description: result.error || "Failed to upload avatar",
        });
        return;
      }

      const newAvatarUrl = result.data?.avatar_url || null;
      setAvatarUrl(newAvatarUrl);
      onAvatarChange?.(newAvatarUrl);

      toast.success("Avatar updated", {
        description: "Your avatar has been successfully updated",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!avatarUrl) return;

    setIsDeleting(true);

    try {
      const result = await delete_user_avatar(userId);

      if (!result.success) {
        toast.error("Delete failed", {
          description: result.error || "Failed to delete avatar",
        });
        return;
      }

      setAvatarUrl(null);
      onAvatarChange?.(null);

      toast.success("Avatar deleted", {
        description: "Your avatar has been successfully removed",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={avatarUrl || undefined} alt="User avatar" />
          <AvatarFallback
            avatarColor={avatarColor}
            className={cn(
              "font-semibold",
              "text-4xl",
              size === "lg" && "text-6xl"
            )}
          >
            {userInitials}
          </AvatarFallback>
        </Avatar>
        {(isUploading || isDeleting) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleUploadClick}
          disabled={isUploading || isDeleting}
          variant="outline"
          size="sm"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {avatarUrl ? "Change" : "Upload"}
            </>
          )}
        </Button>

        {avatarUrl && (
          <Button
            onClick={handleDelete}
            disabled={isUploading || isDeleting}
            variant="outline"
            size="sm"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </>
            )}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
