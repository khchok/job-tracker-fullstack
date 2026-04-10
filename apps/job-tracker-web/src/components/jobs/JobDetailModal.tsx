"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_BADGE_COLORS } from "@/lib/constants";
import { useGetJobByIdQuery } from "@/services/job-service/queries";
import { JobStatus } from "shared-types";

interface JobDetailModalProps {
  jobId: string | null;
  onClose: () => void;
}

const STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.NEW]: "New",
  [JobStatus.PENDING_INTERVIEW]: "Pending Interview",
  [JobStatus.PENDING_OFFER]: "Pending Offer",
  [JobStatus.REJECTED]: "Rejected",
  [JobStatus.ACCEPTED]: "Accepted",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JobDetailModal({ jobId, onClose }: JobDetailModalProps) {
  const { data, isLoading } = useGetJobByIdQuery(jobId);

  return (
    <Dialog open={!!jobId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>
            {isLoading ? <Skeleton className="h-5 w-48" /> : data?.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col gap-3 mt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full mt-4" />
          </div>
        ) : data ? (
          <div className="flex flex-col gap-5 mt-1">
            {data.remarks && (
              <p className="text-sm text-gray-600">{data.remarks}</p>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                Status Timeline
              </p>
              <ol className="relative border-l border-gray-200 ml-2">
                {data.statuses.map((entry, i) => {
                  const isLatest = i === data.statuses.length - 1;
                  const colorClass = STATUS_BADGE_COLORS[entry.status];
                  return (
                    <li key={entry.id} className="mb-5 ml-4">
                      <span
                        className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${colorClass.split(" ")[0]}`}
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colorClass}`}
                        >
                          {STATUS_LABELS[entry.status]}
                        </span>
                        {isLatest && (
                          <span className="text-xs text-gray-400">(current)</span>
                        )}
                      </div>
                      <time className="mt-0.5 block text-xs text-gray-400">
                        {formatDate(entry.createdAt)}
                      </time>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
