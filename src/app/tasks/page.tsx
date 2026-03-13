import { TaskFormSkeleton } from "@/components/skeletons/TaskFormSkeleton";
import { TaskListSkeleton } from "@/components/skeletons/TaskListSkeleton";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const TaskForm = dynamic(() => import("@/components/TaskForm"), {
  loading: () => <TaskFormSkeleton />,
});

const TaskList = dynamic(() => import("@/components/TaskList"), {
  loading: () => <TaskListSkeleton />,
});

export const metadata: Metadata = {
  title: "Tasks - Task Manager",
  description: "Manage tasks — create, update and track progress.",
};

export default function TasksPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded bg-white p-4 shadow sm:p-6 dark:bg-black" aria-labelledby="create-task-heading">
        <h2 id="create-task-heading" className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
          Create Task
        </h2>
        <Suspense fallback={<TaskFormSkeleton />}>
          <TaskForm />
        </Suspense>
      </section>

      <section className="rounded bg-white p-4 shadow sm:p-6 dark:bg-black" aria-labelledby="tasks-heading">
        <h2 id="tasks-heading" className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
          Your Tasks
        </h2>
        <Suspense fallback={<TaskListSkeleton />}>
          <TaskList />
        </Suspense>
      </section>
    </div>
  );
}
