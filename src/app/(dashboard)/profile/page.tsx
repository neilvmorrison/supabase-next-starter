import { Text } from "@/components";

export default async function ProfilePage() {
  return (
    <div className="flex flex-col gap-3">
      <Text variant="h1">My Profile</Text>
      <Text dimmed>Your profile</Text>
    </div>
  );
}
