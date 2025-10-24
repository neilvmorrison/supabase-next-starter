import { Text } from "@/components";

export default async function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="h1">My Profile</Text>
        <Text dimmed>Manage your profile settings</Text>
      </div>
    </div>
  );
}
