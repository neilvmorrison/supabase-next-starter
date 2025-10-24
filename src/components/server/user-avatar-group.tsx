import { getCurrentUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage, Text } from "../ui";

export async function UserAvatarGroup() {
  const user_profile = await getCurrentUser();
  if (!user_profile) return null;

  return (
    <>
      <Avatar className="w-8 h-8 md:w-10 md:h-10" activeColor="green">
        <AvatarImage src={user_profile?.avatar_url ?? ""} />
        <AvatarFallback
          avatarColor={user_profile.avatar_color}
          className="text-sm font-semibold"
        >
          {user_profile.initials}
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
    </>
  );
}
