import { Job, JobDetail } from "shared-types";
import request from "../request";

export const apiGetJobs = async (): Promise<Job[]> => {
  const response = await request.get("/jobs");
  return response.data;
};

export const apiGetJobById = async (id: string): Promise<JobDetail> => {
  const response = await request.get(`/jobs/${id}`);
  return response.data;
};

export const apiCreateJob = async (data: {
  name: string;
  remarks: string;
}): Promise<Job> => {
  const response = await request.post("/jobs", data);
  return response.data;
};

export const apiUpdateJob = async (
  id: string,
  data: Partial<Pick<Job, "name" | "status" | "remarks">>
): Promise<Job> => {
  const response = await request.put(`/jobs/${id}`, data);
  return response.data;
};

export const apiDeleteJob = async (id: string): Promise<void> => {
  await request.delete(`/jobs/${id}`);
};
