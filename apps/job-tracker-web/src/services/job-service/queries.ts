import { useQuery } from "@tanstack/react-query";
import { apiGetJobById, apiGetJobs } from "./services";

export const useGetJobsQuery = () => {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: apiGetJobs,
  });
};

export const useGetJobByIdQuery = (id: string | null) => {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => apiGetJobById(id!),
    enabled: !!id,
  });
};
