import { Job, JobDetail } from "shared-types";
import * as repo from "../repositories/job.repository";

export function getAll(): Promise<Job[]> {
  return repo.findAll();
}

export function getById(id: string): Promise<JobDetail | undefined> {
  return repo.findById(id);
}

export function createJob(name: string, remarks: string): Promise<Job> {
  return repo.create(name, remarks);
}

export function updateJob(
  id: string,
  data: Partial<Pick<Job, "name" | "status" | "remarks">>
): Promise<Job | undefined> {
  return repo.update(id, data);
}

export function deleteJob(id: string): Promise<boolean> {
  return repo.remove(id);
}
