"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function LogoutButton() {
  return (
    <Button variant="destructive" onClick={signOut}>
      Logout
    </Button>
  );
}
