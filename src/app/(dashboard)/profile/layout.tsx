import {
  AvatarUploadWrapper,
  Button,
  Card,
  CardContent,
  Label,
  Separator,
  Text,
} from "@/components";
import { getCurrentUser } from "@/lib/auth";
import { ReactNode } from "react";

interface IProfileLayoutProps {
  children: ReactNode;
}

export default async function ProfileLayout({ children }: IProfileLayoutProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 lg:col-span-3">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex flex-col gap-4 justify-center w-full">
              <AvatarUploadWrapper
                userId={user.auth_user_id!}
                currentAvatarUrl={user.avatar_url}
                userInitials={user.initials}
                avatarColor={user.avatar_color}
                size="md"
              />
              <div>
                <Text className="font-semibold">
                  {user.first_name} {user.last_name}
                </Text>
                <Text dimmed className="text-xs">
                  {user.email}
                </Text>
              </div>
              <Separator />
              <Button variant="destructive">Delete Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-9">{children}</div>
    </div>
  );
}
