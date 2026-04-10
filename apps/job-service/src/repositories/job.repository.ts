import { Job, JobDetail, JobStatusEntry, JobStatus } from "shared-types";
import prisma from "../lib/prisma";

// Bidirectional mapping between DB status IDs and shared-types enum values
const DB_STATUS_TO_ENUM: Record<string, JobStatus> = {
  "New": JobStatus.NEW,
  "Pending Interview": JobStatus.PENDING_INTERVIEW,
  "Pending Offer": JobStatus.PENDING_OFFER,
  "Rejected": JobStatus.REJECTED,
  "Accepted": JobStatus.ACCEPTED,
};

const ENUM_TO_DB_STATUS: Record<JobStatus, string> = {
  [JobStatus.NEW]: "New",
  [JobStatus.PENDING_INTERVIEW]: "Pending Interview",
  [JobStatus.PENDING_OFFER]: "Pending Offer",
  [JobStatus.REJECTED]: "Rejected",
  [JobStatus.ACCEPTED]: "Accepted",
};

// Include clause reused across queries — fetches only the latest status record
const latestStatusInclude = {
  jobStatuses: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: { status: true },
  },
};

type JobWithStatus = Awaited<ReturnType<typeof prisma.job.findUniqueOrThrow>> & {
  jobStatuses: Array<{ status: { id: string } }>;
};

function toJob(raw: JobWithStatus): Job {
  const latestStatus = raw.jobStatuses[0];
  const dbStatusId = latestStatus?.status?.id ?? "New";
  return {
    id: raw.id,
    name: raw.title,
    status: DB_STATUS_TO_ENUM[dbStatusId] ?? JobStatus.NEW,
    remarks: raw.notes ?? "",
  };
}

export async function findAll(): Promise<Job[]> {
  const jobs = await prisma.job.findMany({ include: latestStatusInclude });
  return jobs.map(toJob);
}

// Include clause for full status history — chronological order for timeline
const allStatusesInclude = {
  jobStatuses: {
    orderBy: { createdAt: "asc" as const },
    include: { status: true },
  },
};

type JobWithAllStatuses = Awaited<ReturnType<typeof prisma.job.findUniqueOrThrow>> & {
  jobStatuses: Array<{ id: string; status: { id: string }; createdAt: Date }>;
};

function toJobDetail(raw: JobWithAllStatuses): JobDetail {
  const statuses: JobStatusEntry[] = raw.jobStatuses.map((js) => ({
    id: js.id,
    status: DB_STATUS_TO_ENUM[js.status.id] ?? JobStatus.NEW,
    createdAt: js.createdAt.toISOString(),
  }));
  return {
    id: raw.id,
    name: raw.title,
    remarks: raw.notes ?? "",
    statuses,
  };
}

export async function findById(id: string): Promise<JobDetail | undefined> {
  const job = await prisma.job.findUnique({ where: { id }, include: allStatusesInclude });
  return job ? toJobDetail(job) : undefined;
}

export async function create(name: string, remarks: string): Promise<Job> {
  const job = await prisma.job.create({
    data: {
      title: name,
      company: "",
      notes: remarks,
      userId: "default",
      jobStatuses: {
        create: [{ status: { connect: { id: "New" } } }],
      },
    },
    include: latestStatusInclude,
  });
  return toJob(job);
}

export async function update(
  id: string,
  data: Partial<Pick<Job, "name" | "status" | "remarks">>
): Promise<Job | undefined> {
  const exists = await prisma.job.findUnique({ where: { id } });
  if (!exists) return undefined;

  const job = await prisma.job.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { title: data.name }),
      ...(data.remarks !== undefined && { notes: data.remarks }),
      ...(data.status !== undefined && {
        jobStatuses: {
          create: [{ status: { connect: { id: ENUM_TO_DB_STATUS[data.status] } } }],
        },
      }),
    },
    include: latestStatusInclude,
  });
  return toJob(job);
}

export async function remove(id: string): Promise<boolean> {
  const exists = await prisma.job.findUnique({ where: { id } });
  if (!exists) return false;

  // ON DELETE RESTRICT — must delete child records first
  await prisma.jobStatus.deleteMany({ where: { jobId: id } });
  await prisma.job.delete({ where: { id } });
  return true;
}
