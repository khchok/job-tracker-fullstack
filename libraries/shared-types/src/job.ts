export enum JobStatus {
  NEW = "NEW",
  PENDING_INTERVIEW = "PENDING_INTERVIEW",
  PENDING_OFFER = "PENDING_OFFER",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
}

export interface Job {
  id: number;
  name: string;
  status: JobStatus;
  remarks: string;
}
