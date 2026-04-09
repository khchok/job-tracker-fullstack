import { JobStatus } from "shared-types";

export const COLUMNS: { id: JobStatus; label: string }[] = [
  { id: JobStatus.NEW, label: "New" },
  { id: JobStatus.PENDING_INTERVIEW, label: "Pending Interview" },
  { id: JobStatus.PENDING_OFFER, label: "Pending Offer" },
  { id: JobStatus.REJECTED, label: "Rejected" },
  { id: JobStatus.ACCEPTED, label: "Accepted" },
];

export const STATUS_BADGE_COLORS: Record<JobStatus, string> = {
  [JobStatus.NEW]: "bg-blue-100 text-blue-800",
  [JobStatus.PENDING_INTERVIEW]: "bg-yellow-100 text-yellow-800",
  [JobStatus.PENDING_OFFER]: "bg-purple-100 text-purple-800",
  [JobStatus.REJECTED]: "bg-red-100 text-red-800",
  [JobStatus.ACCEPTED]: "bg-green-100 text-green-800",
};
