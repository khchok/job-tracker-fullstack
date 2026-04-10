import { useMutation } from "@tanstack/react-query";
import { apiSignIn, apiSignOut } from "./services";

export const useSignInMutation = () => {
  const { mutateAsync, ...mutation } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiSignIn(email, password),
  });
  return {
    signInMutation: mutateAsync,
    ...mutation,
  };
};

export const useSignOutMutation = () => {
  const { mutateAsync, ...mutation } = useMutation({
    mutationFn: () => apiSignOut(),
  });
  return {
    signOutMutation: mutateAsync,
    ...mutation,
  };
};
