"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "./ui";
import { useRouter } from "next/navigation";

export function LogoutButton({ className }: { className?: string }) {
  const { replace } = useRouter();

  async function handleSignout() {
    const { error } = await signOut();
    if (!error) replace("/authentication");
  }

  return (
    <Button variant="destructive" onClick={handleSignout} className={className}>
      Logout
    </Button>
  );
}
