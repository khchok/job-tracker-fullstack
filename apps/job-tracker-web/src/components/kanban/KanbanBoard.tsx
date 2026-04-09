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
