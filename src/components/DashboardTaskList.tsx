"use client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getFragmentData } from "@/gql";
import {
  TaskFullFieldsFragmentDoc,
  TasksPaginatedDocument,
  type InputMaybe,
  type Priority,
  type TaskFilterInput,
  type TaskFullFieldsFragment,
} from "@/gql/graphql";
import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

export default function DashboardTaskList() {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<InputMaybe<Priority> | "ALL">("ALL");
  const limit = 50;
  const [offset] = useState(0);

  const filter = useMemo(() => {
    const f: InputMaybe<TaskFilterInput> = {};
    if (statusFilter === "COMPLETED") f.completed = true;
    if (statusFilter === "ACTIVE") f.completed = false;
    if (priorityFilter && priorityFilter !== "ALL") f.priority = priorityFilter;
    return Object.keys(f).length ? f : undefined;
  }, [statusFilter, priorityFilter]);

  const { data, loading, error, refetch } = useQuery(TasksPaginatedDocument, {
    variables: { limit, offset, filter: filter ?? undefined },
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data)
    return (
      <div className="space-y-3">
        <Skeleton height={48} />
        <Skeleton height={48} />
        <Skeleton height={48} />
      </div>
    );
  if (error) return <p className="text-red-600">Error loading tasks: {error.message}</p>;

  const raw = data?.tasksPaginated?.items ?? [];
  const tasks: TaskFullFieldsFragment[] = raw.map((t) => getFragmentData(TaskFullFieldsFragmentDoc, t));

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="status-filter" className="text-sm">
          Status:
        </label>
        <select
          id="status-filter"
          className="cursor-pointer"
          value={statusFilter}
          onChange={(e) => {
            const next = e.target.value as "ALL" | "ACTIVE" | "COMPLETED";
            setStatusFilter(next);
            const nextFilter: InputMaybe<TaskFilterInput> = {};
            if (next === "COMPLETED") nextFilter.completed = true;
            if (next === "ACTIVE") nextFilter.completed = false;
            if (priorityFilter && priorityFilter !== "ALL") nextFilter.priority = priorityFilter;
            void refetch({ limit, offset, filter: Object.keys(nextFilter).length ? nextFilter : undefined });
          }}
        >
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <label htmlFor="priority-filter" className="text-sm">
          Priority:
        </label>
        <select
          id="priority-filter"
          className="cursor-pointer"
          value={priorityFilter ?? "ALL"}
          onChange={(e) => {
            const next = e.target.value as "ALL" | Priority;
            setPriorityFilter(next);
            const nextFilter: InputMaybe<TaskFilterInput> = {};
            if (statusFilter === "COMPLETED") nextFilter.completed = true;
            if (statusFilter === "ACTIVE") nextFilter.completed = false;
            if (next && next !== "ALL") nextFilter.priority = next;
            void refetch({ limit, offset, filter: Object.keys(nextFilter).length ? nextFilter : undefined });
          }}
        >
          <option value="ALL">All</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-slate-500">No tasks yet</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between rounded border p-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={task.completed} readOnly disabled />

                <div className="flex flex-col">
                  <span className={task.completed ? "font-medium text-slate-400 line-through" : "font-medium"}>
                    {task.title}
                  </span>
                  <div className="text-xs text-slate-500">
                    {task.priority && (
                      <Badge
                        variant={
                          task.priority === "HIGH" ? "destructive" : task.priority === "LOW" ? "secondary" : "default"
                        }
                        className="mr-2"
                      >
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

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{task.started ? "Started" : "Not started"}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
