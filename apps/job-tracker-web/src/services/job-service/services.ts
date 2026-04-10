import { Job, JobDetail } from "shared-types";
import request from "../request";

export const apiGetJobs = async (): Promise<Job[]> => {
  const response = await request.get("/api/job/jobs");
  return response.data;
};

export const apiGetJobById = async (id: string): Promise<JobDetail> => {
  const response = await request.get(`/api/job/jobs/${id}`);
  return response.data;
};

export const apiCreateJob = async (data: {
  name: string;
  remarks: string;
}): Promise<Job> => {
  const response = await request.post("/api/job/jobs", data);
  return response.data;
};

export const apiUpdateJob = async (
  id: string,
  data: Partial<Pick<Job, "name" | "status" | "remarks">>
): Promise<Job> => {
  const response = await request.put(`/api/job/jobs/${id}`, data);
  return response.data;
};

export const apiDeleteJob = async (id: string): Promise<void> => {
  await request.delete(`/api/job/jobs/${id}`);
};
