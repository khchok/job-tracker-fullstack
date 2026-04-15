import SignOutButton from '@/components/auth/SignOutButton';
import AddJobModal from '@/components/jobs/AddJobModal';
import KanbanBoard from '@/components/kanban/KanbanBoard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
            <p className="text-sm text-gray-500 mt-1">Track your job applications</p>
          </div>
          <div className="flex items-center gap-3">
            <AddJobModal />
            <SignOutButton />
          </div>
        </div>
        <KanbanBoard />
      </div>
    </main>
  );
}
