import { Job } from "shared-types";
import * as repo from "../repositories/job.repository";

export function getAll(): Job[] {
  return repo.findAll();
}

export function getById(id: number): Job | undefined {
  return repo.findById(id);
}

export function createJob(name: string, remarks: string): Job {
  return repo.create(name, remarks);
}

export function updateJob(
  id: number,
  data: Partial<Pick<Job, "name" | "status" | "remarks">>
): Job | undefined {
  return repo.update(id, data);
}

export function deleteJob(id: number): boolean {
  return repo.remove(id);
}
