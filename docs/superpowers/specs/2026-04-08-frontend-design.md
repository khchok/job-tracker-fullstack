# Job Tracker Frontend — Design Spec
Date: 2026-04-08

## Overview

A Next.js frontend for the job tracker monorepo. Allows a recruiter to view and manage job applications on a Kanban board, with drag-and-drop to update status, a modal to create new applications, and card-level edit and delete.

---

## Tech Stack

- **Framework**: Next.js (in `apps/job-tracker-web`)
- **Styling**: Tailwind CSS + shadcn/ui
- **Data fetching**: React Query (TanStack Query v5)
- **Drag and drop**: @dnd-kit/core + @dnd-kit/sortable
- **Shared types**: `shared-types` workspace package

---

## Status Enum (updated in shared-types)

```ts
export enum JobStatus {
  NEW = "NEW",
  PENDING_INTERVIEW = "PENDING_INTERVIEW",
  PENDING_OFFER = "PENDING_OFFER",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
}
```

Backend default on create: `NEW`.

---

## Kanban Board Columns

| Column Label      | JobStatus value    |
|-------------------|--------------------|
| New               | NEW                |
| Pending Interview | PENDING_INTERVIEW  |
| Pending Offer     | PENDING_OFFER      |
| Rejected          | REJECTED           |
| Accepted          | ACCEPTED           |

---

## Project Structure

```
apps/job-tracker-web/
  src/
    app/
      page.tsx              ← Kanban board (main page)
      layout.tsx            ← QueryClientProvider wrapper
    components/
      kanban/
        KanbanBoard.tsx     ← renders all 5 columns, holds DndContext
        KanbanColumn.tsx    ← single column with droppable area
        JobCard.tsx         ← draggable card (name, status badge, remarks)
      jobs/
        AddJobModal.tsx     ← shadcn Dialog, fields: name + remarks
        EditJobModal.tsx    ← shadcn Dialog, fields: name + remarks
    lib/
      api.ts                ← typed fetch wrappers (getJobs, createJob, updateJob, deleteJob)
      queryClient.ts        ← React Query client singleton
```

---

## Data Flow

### Initial load
- `useQuery(['jobs'], getJobs)` fetches `GET /jobs`
- Results grouped by `status` into 5 column arrays

### Drag and drop
- `DndContext` wraps the board; `onDragEnd` fires when a card is dropped into a new column
- Optimistic update: React Query cache updated immediately
- `PUT /jobs/:id` fires with new `status`
- On error: cache rolled back + toast notification shown

### Add job
- "Add Job" button opens `AddJobModal`
- Form fields: `name` (required), `remarks` (optional)
- On submit: `POST /jobs` → status defaults to `NEW` on backend
- On success: React Query invalidates `['jobs']` query → card appears in New column

### Edit job
- Clicking a card opens `EditJobModal`
- Form fields: `name`, `remarks`
- On submit: `PUT /jobs/:id` with updated fields
- On success: React Query invalidates `['jobs']`

### Delete job
- Delete button on card → `DELETE /jobs/:id`
- On success: React Query invalidates `['jobs']` → card removed

---

## Error Handling

- API errors surface as toast notifications (shadcn `useToast`)
- Drag optimistic updates roll back on failure
- Loading state: skeleton cards per column while initial fetch is in progress

---

## Out of Scope

- Authentication
- Persistence beyond in-memory backend store
- Mobile/responsive layout optimisation
