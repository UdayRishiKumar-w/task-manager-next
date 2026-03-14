"use client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getFragmentData, type FragmentType } from "@/gql";
import {
  TaskFullFieldsFragmentDoc,
  TasksPaginatedDocument,
  type InputMaybe,
  type Priority,
  type TaskFilterInput,
  type TaskFullFieldsFragment,
  type TasksPaginatedQuery,
  type TasksPaginatedQueryVariables,
} from "@/gql/graphql";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPriorityFilter, setStatusFilter } from "@/store/taskFiltersSlice";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

function getPriorityVariant(priority: string): "destructive" | "secondary" | "default" {
  if (priority === "HIGH") return "destructive";
  if (priority === "LOW") return "secondary";
  return "default";
}

function TaskListContent({
  loading,
  error,
  tasks,
}: Readonly<{
  loading: boolean;
  error: Error | undefined;
  tasks: TaskFullFieldsFragment[];
}>) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton height={48} />
        <Skeleton height={48} />
        <Skeleton height={48} />
      </div>
    );
  }
  if (error) {
    return <p className="text-red-600 dark:text-red-400">Error loading tasks: {error.message}</p>;
  }
  if (tasks.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400">No tasks yet</p>;
  }
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between rounded border p-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={task.completed}
              disabled
              aria-label={`"${task.title}" is ${task.completed ? "completed" : "not completed"}`}
              aria-readonly="true"
            />
            <div className="flex flex-col">
              <span
                className={
                  task.completed ? "font-medium text-slate-400 line-through dark:text-slate-600" : "font-medium"
                }
              >
                {task.title}
              </span>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {task.priority && (
                  <Badge variant={getPriorityVariant(task.priority)} className="mr-2">
                    {task.priority}
                  </Badge>
                )}
                {task.createdAt && (
                  <span>
                    Created{" "}
                    {new Date(Number(task.createdAt)).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span>{task.started ? "Started" : "Not started"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardTaskList() {
  const dispatch = useAppDispatch();
  const statusFilter = useAppSelector((s) => s.taskFilters.status);
  const priorityFilter = useAppSelector((s) => s.taskFilters.priority);

  const limit = 50;
  const offset = 0;

  const filter = useMemo(() => {
    const f: InputMaybe<TaskFilterInput> = {};
    if (statusFilter === "COMPLETED") f.completed = true;
    if (statusFilter === "ACTIVE") f.completed = false;
    if (priorityFilter && priorityFilter !== "ALL") f.priority = priorityFilter;
    return Object.keys(f).length ? f : undefined;
  }, [statusFilter, priorityFilter]);

  const { data, loading, error } = useQuery<TasksPaginatedQuery, TasksPaginatedQueryVariables>(TasksPaginatedDocument, {
    variables: { limit, offset, filter: filter ?? undefined },
    fetchPolicy: "cache-and-network",
  });

  const raw = (data?.tasksPaginated?.items ?? []) as FragmentType<typeof TaskFullFieldsFragmentDoc>[];
  const tasks: TaskFullFieldsFragment[] = getFragmentData(TaskFullFieldsFragmentDoc, raw);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label htmlFor="status-filter" className="text-sm font-medium">
          Status:
        </label>
        <select
          id="status-filter"
          className="cursor-pointer rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          value={statusFilter}
          onChange={(e) => dispatch(setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "COMPLETED"))}
        >
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <label htmlFor="priority-filter" className="text-sm font-medium">
          Priority:
        </label>
        <select
          id="priority-filter"
          className="cursor-pointer rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          value={priorityFilter ?? "ALL"}
          onChange={(e) => dispatch(setPriorityFilter(e.target.value as "ALL" | Priority))}
        >
          <option value="ALL">All</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      <TaskListContent loading={loading && !data} error={error} tasks={tasks} />
    </>
  );
}
