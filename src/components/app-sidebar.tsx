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
} from "@/components/ui/sidebar";
import Link from "next/link";
import Logo from "./logo";
import { UserProfile } from "@/lib/user_profiles/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";

interface IApplicationSidebarProps
  extends React.ComponentProps<typeof Sidebar> {
  user_profile: UserProfile;
}

export function AppSidebar({
  user_profile,
  ...props
}: IApplicationSidebarProps) {
  const avatarColor = user_profile.avatar_color || "#ff4a55";

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Logo />
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
        <Avatar className="w-8 h-8 md:w-10 md:h-10">
          <AvatarImage src={user_profile?.avatar_url ?? ""} />
          <AvatarFallback
            className="text-sm font-semibold"
            style={{ backgroundColor: avatarColor }}
          >
            {user_profile?.first_name?.[0] || ""}
            {user_profile?.last_name?.[0] || ""}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <Text className="text-sm font-medium truncate">
            {user_profile?.first_name} {user_profile?.last_name}
          </Text>
          <Text className="text-xs truncate" dimmed>
            {user_profile?.email}
          </Text>
        </div>
      </Link>
    </Sidebar>
  );
}
