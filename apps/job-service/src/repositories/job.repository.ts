import { Job, JobStatus } from "shared-types";

let jobs: Job[] = [
  { id: 1, name: "Software Engineer at Acme", status: JobStatus.NEW, remarks: "" },
];
let nextId = 2;

export function findAll(): Job[] {
  return jobs;
}

export function findById(id: number): Job | undefined {
  return jobs.find((j) => j.id === id);
}

export function create(name: string, remarks: string): Job {
  const job: Job = { id: nextId++, name, status: JobStatus.NEW, remarks };
  jobs.push(job);
  return job;
}

export function update(
  id: number,
  data: Partial<Pick<Job, "name" | "status" | "remarks">>
): Job | undefined {
  const job = jobs.find((j) => j.id === id);
  if (!job) return undefined;
  if (data.name !== undefined) job.name = data.name;
  if (data.status !== undefined) job.status = data.status;
  if (data.remarks !== undefined) job.remarks = data.remarks;
  return job;
}

export function remove(id: number): boolean {
  const index = jobs.findIndex((j) => j.id === id);
  if (index === -1) return false;
  jobs.splice(index, 1);
  return true;
}
