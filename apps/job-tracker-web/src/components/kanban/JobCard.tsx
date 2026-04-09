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
