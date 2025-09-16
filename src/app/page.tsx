import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/authentication");

  return (
    <div className="h-screen w-full flex items-center justify-center">Home</div>
  );
}
