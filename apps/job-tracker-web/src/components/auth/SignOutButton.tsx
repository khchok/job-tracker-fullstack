'use client';
import { Button } from '@/components/ui/button';
import { useSignOutMutation } from '@/services/user-service/mutations';
import { LoaderCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();
  const { signOutMutation, isPending } = useSignOutMutation();

  async function handleSignOut() {
    try {
      await signOutMutation();
    } finally {
      router.push('/login');
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex flex-row justify-center items-center"
      onClick={handleSignOut}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <LoaderCircleIcon className="h-4 w-4 animate-spin" />
          Signing out
        </>
      ) : (
        'Sign out'
      )}
    </Button>
  );
}
