import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata = {
  title: "Tasks - Task Manager",
  description: "Manage tasks — create, update and track progress.",
};

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/api/auth/signin?callbackUrl=/tasks");

  return (
    <div className="space-y-6">
      <div className="rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Create Task</h2>
        <Suspense fallback={<div>Loading form...</div>}>
          <TaskForm />
        </Suspense>
      </div>

      <div className="rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Tasks</h2>
        <Suspense fallback={<div>Loading tasks...</div>}>
          <TaskList />
        </Suspense>
      </div>
    </div>
  );
}
