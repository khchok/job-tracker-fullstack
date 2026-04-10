import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Job } from "shared-types";
import { apiCreateJob, apiDeleteJob, apiUpdateJob } from "./services";

export const useCreateJobMutation = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, ...mutation } = useMutation({
    mutationFn: (data: { name: string; remarks: string }) => apiCreateJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
  return { createJobMutation: mutateAsync, ...mutation };
};

export const useUpdateJobMutation = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, ...mutation } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<Job, "name" | "status" | "remarks">>;
    }) => apiUpdateJob(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
    },
  });
  return { updateJobMutation: mutateAsync, ...mutation };
};

export const useDeleteJobMutation = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, ...mutation } = useMutation({
    mutationFn: (id: string) => apiDeleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
  return { deleteJobMutation: mutateAsync, ...mutation };
};
