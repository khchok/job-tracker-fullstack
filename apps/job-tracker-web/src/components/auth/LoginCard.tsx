'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useSignInMutation } from '@/services/user-service/mutations';
import { ChevronDownIcon, LoaderCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const DEMO_EMAIL = 'alice@job-tracker.com';
const DEMO_PASSWORD = 'P@ssword123';

export default function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  const { signInMutation, isPending } = useSignInMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await signInMutation({ email, password });
      router.push('/');
    } catch {
      setError('Invalid email or password. Please try again.');
    }
  }

  return (
    <div className="flex flex-col justify-center px-8 py-16 sm:px-16">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-400 tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-500">Sign in to your recruiter account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm">
            <button
              type="button"
              onClick={() => setShowCredentials((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-gray-500 hover:text-gray-700"
            >
              <span>Demo credentials</span>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform duration-200 ${showCredentials ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-200',
                showCredentials ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              )}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-2 border-t border-dashed border-gray-300 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-400 text-xs w-14 shrink-0">Email</span>
                    <code className="flex-1 font-mono text-xs text-gray-600 truncate">{DEMO_EMAIL}</code>
                    <button
                      type="button"
                      onClick={() => setEmail(DEMO_EMAIL)}
                      className="shrink-0 text-xs text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      Use
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-400 text-xs w-14 shrink-0">Password</span>
                    <code className="flex-1 font-mono text-xs text-gray-600">{DEMO_PASSWORD}</code>
                    <button
                      type="button"
                      onClick={() => setPassword(DEMO_PASSWORD)}
                      className="shrink-0 text-xs text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      Use
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full flex flex-row justify-center items-center" disabled={isPending}>
            {isPending ? (
              <>
                <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                Signing in
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
