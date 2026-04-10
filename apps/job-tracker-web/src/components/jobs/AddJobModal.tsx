"use client";
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
import { useCreateJobMutation } from "@/services/job-service/mutations";
import { useState } from "react";
import { toast } from "sonner";

export default function AddJobModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [remarks, setRemarks] = useState("");

  const { createJobMutation, isPending } = useCreateJobMutation();

  function handleSubmit() {
    createJobMutation({ name, remarks })
      .then(() => {
        toast.success("Job added");
        setOpen(false);
        setName("");
        setRemarks("");
      })
      .catch(() => toast.error("Failed to add job"));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>+ Add Job</DialogTrigger>
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
              onClick={handleSubmit}
              disabled={!name.trim() || isPending}
            >
              {isPending ? "Adding..." : "Add Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
