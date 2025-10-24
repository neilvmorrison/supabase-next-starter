import { Card, CardContent } from "@/components";
import { UserAvatarGroup } from "@/components/server/user-avatar-group";
import { ReactNode } from "react";

interface IProfileLayoutProps {
  children: ReactNode;
}

export default async function ProfileLayout({ children }: IProfileLayoutProps) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 lg:col-span-3">
        <Card>
          <CardContent className="flex items-center gap-3">
            <UserAvatarGroup />
          </CardContent>
        </Card>
      </div>
      <div className="col-span-9">{children}</div>
    </div>
  );
}
