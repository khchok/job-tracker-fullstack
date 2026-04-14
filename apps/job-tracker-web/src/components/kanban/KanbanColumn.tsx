"use client";
import { useDroppable } from "@dnd-kit/core";
import { Job, JobStatus } from "shared-types";
import { Skeleton } from "@/components/ui/skeleton";
import JobCard from "./JobCard";

function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-full mt-2 rounded" />
      <Skeleton className="h-3 w-2/3 mt-1 rounded" />
      <Skeleton className="h-5 w-16 mt-2 rounded-full" />
      <div className="flex gap-1 justify-end mt-2">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  id: JobStatus;
  label: string;
  jobs: Job[];
  isLoading: boolean;
  onView: (id: string) => void;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export default function KanbanColumn({
  id,
  label,
  jobs,
  isLoading,
  onView,
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
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        ) : (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} onView={onView} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
