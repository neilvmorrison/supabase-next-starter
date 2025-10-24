import * as React from "react";

import {
  Icon,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "./ui";
import Link from "next/link";
import { Logo } from "./logo";
import { UserAvatarGroup } from "./server/user-avatar-group";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Logo asLink />
      </SidebarHeader>
      <SidebarContent className="px-2 mt-4">
        <SidebarMenuButton asChild>
          <span>
            <Icon name="dashboard" />
            <Link href="/">Dashboard</Link>
          </span>
        </SidebarMenuButton>
      </SidebarContent>
      <SidebarRail />
      <Link
        className="bg-card p-2.5 md:p-3 flex gap-2 items-center border-t"
        href="/profile"
      >
        <UserAvatarGroup />
      </Link>
    </Sidebar>
  );
}
