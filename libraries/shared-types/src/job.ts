export enum JobStatus {
  NEW = "NEW",
  PENDING_INTERVIEW = "PENDING_INTERVIEW",
  PENDING_OFFER = "PENDING_OFFER",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
}

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  remarks: string;
}

export interface JobStatusEntry {
  id: string;
  status: JobStatus;
  createdAt: string;
}

export interface JobDetail {
  id: string;
  name: string;
  remarks: string;
  statuses: JobStatusEntry[];
}
