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
import { selectPriorityFilter, selectStatusFilter, setPriorityFilter, setStatusFilter } from "@/store/taskFiltersSlice";
import { useQuery } from "@apollo/client/react";
import clsx from "clsx";
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
    return <p className="text-gray-600 dark:text-gray-400">No tasks yet</p>;
  }
  return (
    <ul className="space-y-3" aria-label="Task list">
      {tasks.map((task) => {
        const createdAtNum = Number(task.createdAt);
        const isValidDate = task.createdAt && !Number.isNaN(createdAtNum);

        return (
          <li
            key={task.id}
            className="flex justify-between gap-3 rounded border border-gray-300 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center dark:border-gray-600 dark:bg-gray-800"
          >
            <div className="flex items-start gap-3 sm:items-center">
              <input
                type="checkbox"
                checked={task.completed}
                disabled
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-400 text-blue-600 sm:mt-0 dark:border-gray-500 dark:bg-gray-700"
                aria-label={`"${task.title}" is ${task.completed ? "completed" : "not completed"}`}
                aria-readonly="true"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className={clsx(
                    "font-medium wrap-break-word",
                    task.completed
                      ? "text-gray-500 line-through dark:text-gray-500"
                      : "text-gray-900 dark:text-gray-100",
                  )}
                >
                  {task.title}
                </span>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  {task.priority && (
                    <Badge
                      variant={getPriorityVariant(task.priority)}
                      className="mr-1"
                      aria-label={`Priority: ${task.priority}`}
                    >
                      {task.priority}
                    </Badge>
                  )}
                  {isValidDate && (
                    <time dateTime={new Date(createdAtNum).toISOString()}>
                      Created {new Date(createdAtNum).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </time>
                  )}
                  {task.dueDate &&
                    (() => {
                      const due = new Date(task.dueDate as unknown as string);
                      const isOverdue = !task.completed && due < new Date();
                      return (
                        <time
                          dateTime={due.toISOString()}
                          className={clsx({ "text-red-600 dark:text-red-400": isOverdue })}
                          aria-label={`Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
                        >
                          Due {due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          {isOverdue && " (overdue)"}
                        </time>
                      );
                    })()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={!!task.started}
                  disabled
                  className="h-4 w-4 rounded border-gray-400 text-blue-600 dark:border-gray-500 dark:bg-gray-700"
                  aria-label={`"${task.title}" is ${task.started ? "started" : "not started"}`}
                />
                <span className="whitespace-nowrap">Started</span>
              </label>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function DashboardTaskList() {
  const dispatch = useAppDispatch();
  const statusFilter = useAppSelector(selectStatusFilter);
  const priorityFilter = useAppSelector(selectPriorityFilter);

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
