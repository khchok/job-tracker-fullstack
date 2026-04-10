"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateJobMutation } from "@/services/job-service/mutations";
import { useState } from "react";
import { Job } from "shared-types";
import { toast } from "sonner";

interface EditJobModalProps {
  job: Job | null;
  onClose: () => void;
}

export default function EditJobModal({ job, onClose }: EditJobModalProps) {
  const [name, setName] = useState(job?.name ?? "");
  const [remarks, setRemarks] = useState(job?.remarks ?? "");

  const { updateJobMutation, isPending } = useUpdateJobMutation();

  function handleSubmit() {
    updateJobMutation({ id: job!.id, data: { name, remarks } })
      .then(() => {
        toast.success("Job updated");
        onClose();
      })
      .catch(() => toast.error("Failed to update job"));
  }

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
              onClick={handleSubmit}
              disabled={!name.trim() || isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
