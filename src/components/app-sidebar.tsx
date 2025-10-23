import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Text as UIText,
} from "./ui";
import Link from "next/link";
import { Logo } from "./logo";
import { UserProfile } from "@/lib/user_profiles/types";

interface IApplicationSidebarProps
  extends React.ComponentProps<typeof Sidebar> {
  user_profile: UserProfile;
}

export function AppSidebar({
  user_profile,
  ...props
}: IApplicationSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Logo asLink />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>User Information</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/profile">Profile</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <Link
        className="bg-card p-2.5 md:p-3 flex gap-2 items-center border-t"
        href="/profile"
      >
        <Avatar className="w-8 h-8 md:w-10 md:h-10" activeColor="green">
          <AvatarImage src={user_profile?.avatar_url ?? ""} />
          <AvatarFallback
            avatarColor={user_profile.avatar_color}
            className="text-sm font-semibold"
          >
            {user_profile?.first_name?.[0] || ""}
            {user_profile?.last_name?.[0] || ""}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <UIText className="text-sm font-medium truncate">
            {user_profile?.first_name} {user_profile?.last_name}
          </UIText>
          <UIText className="text-xs truncate" dimmed>
            {user_profile?.email}
          </UIText>
        </div>
      </Link>
    </Sidebar>
  );
}
