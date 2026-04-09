import { Job } from "shared-types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

export async function getJobs(): Promise<Job[]> {
  const res = await fetch(`${BASE_URL}/jobs`);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

export async function createJob(data: { name: string; remarks: string }): Promise<Job> {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create job");
  return res.json();
}

export async function updateJob(
  id: number,
  data: Partial<Pick<Job, "name" | "status" | "remarks">>
): Promise<Job> {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update job");
  return res.json();
}

export async function deleteJob(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete job");
}
