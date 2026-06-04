"use client";
import { TaskListShell } from "@/components/TaskListShell";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getFragmentData, type FragmentType } from "@/gql";
import {
  TaskFullFieldsFragmentDoc,
  TasksPaginatedDocument,
  type Priority,
  type TaskFilterInput,
  type TaskFullFieldsFragment,
} from "@/gql/graphql";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectPriorityFilter, selectStatusFilter, setPriorityFilter, setStatusFilter } from "@/store/taskFiltersSlice";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

export default function DashboardTaskList() {
  const dispatch = useAppDispatch();
  const statusFilter = useAppSelector(selectStatusFilter);
  const priorityFilter = useAppSelector(selectPriorityFilter);

  const filter = useMemo(() => {
    const f: TaskFilterInput = {};
    if (statusFilter === "COMPLETED") f.completed = true;
    if (statusFilter === "ACTIVE") f.completed = false;
    if (priorityFilter && priorityFilter !== "ALL") f.priority = priorityFilter;
    return Object.keys(f).length ? f : undefined;
  }, [statusFilter, priorityFilter]);

  const { data, loading, error } = useQuery(TasksPaginatedDocument, {
    variables: { limit: 50, offset: 0, filter: filter ?? undefined },
    fetchPolicy: "cache-and-network",
  });

  const raw = (data?.tasksPaginated?.items ?? []) as FragmentType<typeof TaskFullFieldsFragmentDoc>[];
  const tasks: TaskFullFieldsFragment[] = getFragmentData(TaskFullFieldsFragmentDoc, raw);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          <Label htmlFor="status-filter">Status:</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => dispatch(setStatusFilter(v as "ALL" | "ACTIVE" | "COMPLETED"))}
          >
            <SelectTrigger id="status-filter" className="w-full min-w-40 sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          <Label htmlFor="priority-filter">Priority:</Label>
          <Select
            value={priorityFilter ?? "ALL"}
            onValueChange={(v) => dispatch(setPriorityFilter(v as "ALL" | Priority))}
          >
            <SelectTrigger id="priority-filter" className="w-full min-w-40 sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <TaskListShell loading={loading && !data} error={error} tasks={tasks} />
    </div>
  );
}
