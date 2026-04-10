"use client";
import { Button } from "@/components/ui/button";
import { useSignOutMutation } from "@/services/user-service/mutations";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const { signOutMutation, isPending } = useSignOutMutation();

  async function handleSignOut() {
    try {
      await signOutMutation();
    } finally {
      router.push("/login");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isPending}>
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
