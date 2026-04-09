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
