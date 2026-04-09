# Job Tracker Frontend — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js Kanban board for tracking job applications with drag-and-drop status updates, add/edit/delete modals, and React Query for data fetching.

**Architecture:** Next.js 15 app router in `apps/job-tracker-web` consuming job-service REST API at `http://localhost:3030`. React Query manages server state with optimistic updates for drag-and-drop. `@dnd-kit` handles drag interactions across 5 status columns. shadcn/ui provides the component library.

**Tech Stack:** Next.js 15, React Query v5 (TanStack Query), @dnd-kit/core + @dnd-kit/utilities, shadcn/ui, Tailwind CSS, TypeScript, shared-types workspace package.

---

## File Map

### Modified
- `libraries/shared-types/src/job.ts` — update JobStatus enum to NEW, PENDING_INTERVIEW, PENDING_OFFER, REJECTED, ACCEPTED
- `apps/job-service/src/repositories/job.repository.ts` — default status NEW, partial update support
- `apps/job-service/src/services/job.service.ts` — partial update signature
- `apps/job-service/src/routes/jobs/index.ts` — updated enum values, optional PUT body fields
- `package.json` (root) — add `dev:frontend` script

### Created
- `apps/job-tracker-web/` — scaffolded via create-next-app
- `apps/job-tracker-web/next.config.ts` — transpilePackages: ["shared-types"]
- `apps/job-tracker-web/src/app/layout.tsx` — QueryClientProvider + Toaster
- `apps/job-tracker-web/src/app/page.tsx` — renders KanbanBoard + AddJobModal trigger
- `apps/job-tracker-web/src/lib/constants.ts` — COLUMNS array, STATUS_BADGE_COLORS map
- `apps/job-tracker-web/src/lib/api.ts` — typed fetch wrappers (getJobs, createJob, updateJob, deleteJob)
- `apps/job-tracker-web/src/lib/queryClient.ts` — React Query client singleton
- `apps/job-tracker-web/src/components/Providers.tsx` — client-side QueryClientProvider wrapper
- `apps/job-tracker-web/src/components/kanban/KanbanBoard.tsx` — DndContext, groups jobs by status, optimistic drag
- `apps/job-tracker-web/src/components/kanban/KanbanColumn.tsx` — useDroppable column with skeleton loading
- `apps/job-tracker-web/src/components/kanban/JobCard.tsx` — useDraggable card with edit/delete buttons
- `apps/job-tracker-web/src/components/jobs/AddJobModal.tsx` — shadcn Dialog with create form
- `apps/job-tracker-web/src/components/jobs/EditJobModal.tsx` — shadcn Dialog with edit form
- `apps/job-tracker-web/__tests__/api.test.ts` — unit tests for api.ts

---

## Task 1: Update shared-types enum and backend

**Files:**
- Modify: `libraries/shared-types/src/job.ts`
- Modify: `apps/job-service/src/repositories/job.repository.ts`
- Modify: `apps/job-service/src/services/job.service.ts`
- Modify: `apps/job-service/src/routes/jobs/index.ts`

- [ ] **Step 1: Update JobStatus enum**

`libraries/shared-types/src/job.ts`:
```ts
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
```

- [ ] **Step 2: Update job repository**

`apps/job-service/src/repositories/job.repository.ts`:
```ts
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
```

- [ ] **Step 3: Update job service**

`apps/job-service/src/services/job.service.ts`:
```ts
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
```

- [ ] **Step 4: Update the PUT route to accept partial body**

Replace the PUT handler in `apps/job-service/src/routes/jobs/index.ts`:
```ts
import { FastifyInstance } from "fastify";
import { Job, JobStatus } from "shared-types";
import * as jobService from "../../services/job.service";

const JOB_STATUSES = Object.values(JobStatus);

const jobSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    status: { type: "string", enum: JOB_STATUSES },
    remarks: { type: "string" },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.get("/health", async (_request, reply) => {
    return reply.status(200).send({ message: "OK" });
  });

  fastify.get(
    "/",
    {
      schema: {
        description: "Returns all jobs",
        tags: ["Jobs"],
        response: { 200: { type: "array", items: jobSchema } },
      },
    },
    async () => jobService.getAll(),
  );

  fastify.get(
    "/:id",
    {
      schema: {
        description: "Returns a job by ID",
        tags: ["Jobs"],
        params: {
          type: "object",
          properties: { id: { type: "number" } },
          required: ["id"],
        },
        response: {
          200: jobSchema,
          404: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const job = jobService.getById(id);
      if (!job) return reply.status(404).send({ error: "Job not found" });
      return job;
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        description: "Creates a new job with status NEW",
        tags: ["Jobs"],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            remarks: { type: "string", default: "" },
          },
        },
        response: { 201: jobSchema },
      },
    },
    async (request, reply) => {
      const { name, remarks = "" } = request.body as { name: string; remarks?: string };
      const job = jobService.createJob(name, remarks);
      return reply.status(201).send(job);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        description: "Partially updates a job's name, status, and/or remarks",
        tags: ["Jobs"],
        params: {
          type: "object",
          properties: { id: { type: "number" } },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            status: { type: "string", enum: JOB_STATUSES },
            remarks: { type: "string" },
          },
        },
        response: {
          200: jobSchema,
          404: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const data = request.body as Partial<Pick<Job, "name" | "status" | "remarks">>;
      const job = jobService.updateJob(id, data);
      if (!job) return reply.status(404).send({ error: "Job not found" });
      return job;
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        description: "Deletes a job by ID",
        tags: ["Jobs"],
        params: {
          type: "object",
          properties: { id: { type: "number" } },
          required: ["id"],
        },
        response: {
          204: { type: "null" },
          404: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const deleted = jobService.deleteJob(id);
      if (!deleted) return reply.status(404).send({ error: "Job not found" });
      return reply.status(204).send();
    },
  );
}
```

- [ ] **Step 5: Verify job-service compiles**

```bash
cd apps/job-service && pnpm dev
```
Expected: server starts on port 3030, no TypeScript errors. Stop with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add libraries/shared-types/src/job.ts apps/job-service/src/
git commit -m "feat: update JobStatus enum and support partial PUT updates"
```

---

## Task 2: Scaffold Next.js app

**Files:**
- Create: `apps/job-tracker-web/` (via create-next-app)

- [ ] **Step 1: Run create-next-app from the apps directory**

```bash
cd apps
pnpm create next-app@latest job-tracker-web --ts --tailwind --eslint --app --src-dir --no-git
```

When prompted for import alias, accept the default `@/*`.

- [ ] **Step 2: Install additional dependencies**

```bash
cd job-tracker-web
pnpm add @tanstack/react-query @dnd-kit/core @dnd-kit/utilities sonner
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-fetch-mock ts-jest @types/jest
```

- [ ] **Step 3: Add shared-types as workspace dependency**

In `apps/job-tracker-web/package.json`, add to `"dependencies"`:
```json
"shared-types": "workspace:*"
```

From the monorepo root:
```bash
cd ../.. && pnpm install
```

- [ ] **Step 4: Initialise shadcn/ui**

```bash
cd apps/job-tracker-web
pnpm dlx shadcn@latest init -d
pnpm dlx shadcn@latest add button dialog input label badge skeleton
```

- [ ] **Step 5: Configure transpilePackages**

`apps/job-tracker-web/next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["shared-types"],
};

export default nextConfig;
```

- [ ] **Step 6: Configure Jest**

`apps/job-tracker-web/jest.config.ts`:
```ts
import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^shared-types$": "<rootDir>/../../libraries/shared-types/src/index.ts",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
};

export default config;
```

`apps/job-tracker-web/jest.setup.ts`:
```ts
import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
fetchMock.enableMocks();
```

- [ ] **Step 7: Add test script to package.json**

In `apps/job-tracker-web/package.json`, add to `"scripts"`:
```json
"test": "jest"
```

- [ ] **Step 8: Add dev:frontend to root package.json**

`package.json` (root), add to `"scripts"`:
```json
"dev:frontend": "pnpm --filter job-tracker-web dev"
```

- [ ] **Step 9: Commit**

```bash
git add apps/job-tracker-web package.json
git commit -m "feat: scaffold Next.js frontend with Tailwind, shadcn, React Query, dnd-kit"
```

---

## Task 3: Create constants, api.ts, and queryClient (TDD)

**Files:**
- Create: `apps/job-tracker-web/src/lib/constants.ts`
- Create: `apps/job-tracker-web/src/lib/api.ts`
- Create: `apps/job-tracker-web/src/lib/queryClient.ts`
- Create: `apps/job-tracker-web/__tests__/api.test.ts`

- [ ] **Step 1: Write failing tests for api.ts**

`apps/job-tracker-web/__tests__/api.test.ts`:
```ts
import fetchMock from "jest-fetch-mock";
import { getJobs, createJob, updateJob, deleteJob } from "@/lib/api";
import { JobStatus } from "shared-types";

beforeEach(() => fetchMock.resetMocks());

const mockJob = { id: 1, name: "Engineer at Acme", status: JobStatus.NEW, remarks: "" };

describe("getJobs", () => {
  it("fetches and returns jobs array", async () => {
    fetchMock.mockResponseOnce(JSON.stringify([mockJob]));
    const result = await getJobs();
    expect(result).toEqual([mockJob]);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3030/jobs");
  });

  it("throws on non-ok response", async () => {
    fetchMock.mockResponseOnce("", { status: 500 });
    await expect(getJobs()).rejects.toThrow("Failed to fetch jobs");
  });
});

describe("createJob", () => {
  it("POSTs and returns the created job", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockJob), { status: 201 });
    const result = await createJob({ name: "Engineer at Acme", remarks: "" });
    expect(result).toEqual(mockJob);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3030/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Engineer at Acme", remarks: "" }),
    });
  });
});

describe("updateJob", () => {
  it("PUTs partial data and returns updated job", async () => {
    const updated = { ...mockJob, status: JobStatus.PENDING_INTERVIEW };
    fetchMock.mockResponseOnce(JSON.stringify(updated));
    const result = await updateJob(1, { status: JobStatus.PENDING_INTERVIEW });
    expect(result).toEqual(updated);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3030/jobs/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: JobStatus.PENDING_INTERVIEW }),
    });
  });
});

describe("deleteJob", () => {
  it("sends DELETE request", async () => {
    fetchMock.mockResponseOnce("", { status: 204 });
    await deleteJob(1);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3030/jobs/1", {
      method: "DELETE",
    });
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
cd apps/job-tracker-web && pnpm test -- --testPathPattern=api
```
Expected: FAIL — `Cannot find module '@/lib/api'`

- [ ] **Step 3: Create constants.ts**

`apps/job-tracker-web/src/lib/constants.ts`:
```ts
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
```

- [ ] **Step 4: Create api.ts**

`apps/job-tracker-web/src/lib/api.ts`:
```ts
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
```

- [ ] **Step 5: Create queryClient.ts**

`apps/job-tracker-web/src/lib/queryClient.ts`:
```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, retry: 1 },
  },
});
```

- [ ] **Step 6: Run tests — expect pass**

```bash
pnpm test -- --testPathPattern=api
```
Expected: PASS — 4 tests pass

- [ ] **Step 7: Commit**

```bash
git add src/lib/ __tests__/
git commit -m "feat: add api helpers, column constants, and queryClient"
```

---

## Task 4: Set up providers and layout

**Files:**
- Create: `apps/job-tracker-web/src/components/Providers.tsx`
- Modify: `apps/job-tracker-web/src/app/layout.tsx`

- [ ] **Step 1: Create Providers.tsx**

`apps/job-tracker-web/src/components/Providers.tsx`:
```tsx
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Update layout.tsx**

`apps/job-tracker-web/src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Track your job applications",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Providers>
          {children}
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Providers.tsx src/app/layout.tsx
git commit -m "feat: set up React Query provider and sonner toaster"
```

---

## Task 5: Create JobCard component

**Files:**
- Create: `apps/job-tracker-web/src/components/kanban/JobCard.tsx`

- [ ] **Step 1: Create JobCard.tsx**

`apps/job-tracker-web/src/components/kanban/JobCard.tsx`:
```tsx
"use client";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Job } from "shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_BADGE_COLORS } from "@/lib/constants";
import { Pencil, Trash2 } from "lucide-react";

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: number) => void;
}

export default function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
      }}
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        <p className="font-medium text-sm text-gray-900">{job.name}</p>
        {job.remarks && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{job.remarks}</p>
        )}
        <Badge className={`mt-2 text-xs border ${STATUS_BADGE_COLORS[job.status]}`}>
          {job.status.replace(/_/g, " ")}
        </Badge>
      </div>
      <div className="flex gap-1 justify-end mt-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onEdit(job)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-red-500 hover:text-red-700"
          onClick={() => onDelete(job.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/kanban/JobCard.tsx
git commit -m "feat: add draggable JobCard component"
```

---

## Task 6: Create KanbanColumn component

**Files:**
- Create: `apps/job-tracker-web/src/components/kanban/KanbanColumn.tsx`

- [ ] **Step 1: Create KanbanColumn.tsx**

`apps/job-tracker-web/src/components/kanban/KanbanColumn.tsx`:
```tsx
"use client";
import { useDroppable } from "@dnd-kit/core";
import { Job, JobStatus } from "shared-types";
import { Skeleton } from "@/components/ui/skeleton";
import JobCard from "./JobCard";

interface KanbanColumnProps {
  id: JobStatus;
  label: string;
  jobs: Job[];
  isLoading: boolean;
  onEdit: (job: Job) => void;
  onDelete: (id: number) => void;
}

export default function KanbanColumn({
  id,
  label,
  jobs,
  isLoading,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col w-64 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-700">{label}</h3>
        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {jobs.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 min-h-40 rounded-xl p-2 transition-colors ${
          isOver
            ? "bg-blue-50 border-2 border-blue-300 border-dashed"
            : "bg-gray-50 border-2 border-transparent"
        }`}
      >
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </>
        ) : (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/kanban/KanbanColumn.tsx
git commit -m "feat: add droppable KanbanColumn with skeleton loading"
```

---

## Task 7: Create AddJobModal

**Files:**
- Create: `apps/job-tracker-web/src/components/jobs/AddJobModal.tsx`

- [ ] **Step 1: Create AddJobModal.tsx**

`apps/job-tracker-web/src/components/jobs/AddJobModal.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createJob } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddJobModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createJob({ name, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job added");
      setOpen(false);
      setName("");
      setRemarks("");
    },
    onError: () => toast.error("Failed to add job"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Add Job</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Job Application</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Job Title / Company</Label>
            <Input
              id="name"
              placeholder="e.g. Software Engineer at Acme"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="remarks">Remarks</Label>
            <Input
              id="remarks"
              placeholder="Any notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={!name.trim() || mutation.isPending}
            >
              {mutation.isPending ? "Adding..." : "Add Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/jobs/AddJobModal.tsx
git commit -m "feat: add AddJobModal with create form"
```

---

## Task 8: Create EditJobModal

**Files:**
- Create: `apps/job-tracker-web/src/components/jobs/EditJobModal.tsx`

- [ ] **Step 1: Create EditJobModal.tsx**

`apps/job-tracker-web/src/components/jobs/EditJobModal.tsx`:
```tsx
"use client";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Job } from "shared-types";
import { updateJob } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditJobModalProps {
  job: Job | null;
  onClose: () => void;
}

export default function EditJobModal({ job, onClose }: EditJobModalProps) {
  const [name, setName] = useState("");
  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (job) {
      setName(job.name);
      setRemarks(job.remarks);
    }
  }, [job]);

  const mutation = useMutation({
    mutationFn: () => updateJob(job!.id, { name, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job updated");
      onClose();
    },
    onError: () => toast.error("Failed to update job"),
  });

  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Job Application</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-name">Job Title / Company</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-remarks">Remarks</Label>
            <Input
              id="edit-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={!name.trim() || mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/jobs/EditJobModal.tsx
git commit -m "feat: add EditJobModal for updating name and remarks"
```

---

## Task 9: Create KanbanBoard

**Files:**
- Create: `apps/job-tracker-web/src/components/kanban/KanbanBoard.tsx`

- [ ] **Step 1: Create KanbanBoard.tsx**

`apps/job-tracker-web/src/components/kanban/KanbanBoard.tsx`:
```tsx
"use client";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Job, JobStatus } from "shared-types";
import { getJobs, updateJob, deleteJob } from "@/lib/api";
import { COLUMNS } from "@/lib/constants";
import KanbanColumn from "./KanbanColumn";
import EditJobModal from "../jobs/EditJobModal";

export default function KanbanBoard() {
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: getJobs,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: JobStatus }) =>
      updateJob(id, { status }),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.error("Failed to move job");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted");
    },
    onError: () => toast.error("Failed to delete job"),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const jobId = active.id as number;
    const newStatus = over.id as JobStatus;
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status === newStatus) return;

    // Optimistic update
    queryClient.setQueryData(["jobs"], (old: Job[]) =>
      old.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );

    updateMutation.mutate({ id: jobId, status: newStatus });
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              jobs={jobs.filter((j) => j.status === col.id)}
              isLoading={isLoading}
              onEdit={setEditingJob}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      </DndContext>
      <EditJobModal job={editingJob} onClose={() => setEditingJob(null)} />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/kanban/KanbanBoard.tsx
git commit -m "feat: add KanbanBoard with DnD and optimistic updates"
```

---

## Task 10: Wire up page.tsx and verify

**Files:**
- Modify: `apps/job-tracker-web/src/app/page.tsx`

- [ ] **Step 1: Update page.tsx**

`apps/job-tracker-web/src/app/page.tsx`:
```tsx
import KanbanBoard from "@/components/kanban/KanbanBoard";
import AddJobModal from "@/components/jobs/AddJobModal";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
            <p className="text-sm text-gray-500 mt-1">Track your job applications</p>
          </div>
          <AddJobModal />
        </div>
        <KanbanBoard />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Start both services and verify end-to-end**

Terminal 1 — backend:
```bash
pnpm dev:job-service
```

Terminal 2 — frontend:
```bash
pnpm dev:frontend
```

Open `http://localhost:3000` and verify:
- 5 columns render: New, Pending Interview, Pending Offer, Rejected, Accepted
- Seed job card appears in the New column
- "+ Add Job" opens modal, submitting creates a card in New column
- Dragging a card to another column updates its status (optimistic, then confirmed)
- Pencil icon opens edit modal; saving updates name/remarks
- Trash icon deletes the card with a success toast

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire up job tracker kanban page"
```
