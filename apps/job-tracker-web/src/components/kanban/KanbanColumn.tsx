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
