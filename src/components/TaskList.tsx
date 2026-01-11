"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getFragmentData } from "@/gql";
import {
  DeleteTaskDocument,
  GetTasksDocument,
  TaskFullFieldsFragmentDoc,
  ToggleTaskDocument,
  UpdateTaskDocument,
} from "@/gql/graphql";
import type { Reference, StoreObject } from "@apollo/client/cache";
import { useMutation, useQuery } from "@apollo/client/react";
import clsx from "clsx";
import { useState } from "react";

export default function TaskList() {
  const { data, loading, error } = useQuery(GetTasksDocument, {
    fetchPolicy: "cache-and-network",
  });

  const [toggleTask] = useMutation(ToggleTaskDocument);
  const [deleteTask] = useMutation(DeleteTaskDocument);
  const [updateTask] = useMutation(UpdateTaskDocument);

  if (loading && !data)
    return (
      <div className="space-y-3">
        <Skeleton height={48} />
        <Skeleton height={48} />
        <Skeleton height={48} />
      </div>
    );
  if (error) return <p className="text-red-600">Error loading tasks: {error.message}</p>;

  const rawTasks = data?.getTasks ?? [];
  const tasks = rawTasks.map((t) => getFragmentData(TaskFullFieldsFragmentDoc, t));

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask({
      variables: { id: taskId },
      update: (cache) => {
        cache.modify({
          fields: {
            getTasks(existingRefs, { readField }) {
              return (existingRefs ?? []).filter(
                (ref: Reference | StoreObject | undefined) => readField("id", ref) !== taskId,
              );
            },
          },
        });
      },
    });
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null);

  const openDeleteDialog = (id: string) => {
    setPendingDeleteTaskId(id);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteTaskId) return;
    await handleDeleteTask(pendingDeleteTaskId);
    setDialogOpen(false);
    setPendingDeleteTaskId(null);
  };

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <p className="text-slate-500">No tasks yet</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between rounded border p-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                className="cursor-pointer"
                onChange={() => {
                  void toggleTask({
                    variables: { id: task.id },
                    optimisticResponse: {
                      toggleTask: {
                        __typename: "Task",
                        id: task.id,
                        completed: !task.completed,
                      },
                    },
                    update: (cache, { data }) => {
                      const completed = data?.toggleTask.completed;
                      if (completed === undefined) return;
                      const cacheId = cache.identify({ __typename: "Task", id: task.id });
                      if (!cacheId) return;
                      cache.modify({
                        id: cacheId,
                        fields: {
                          completed() {
                            return completed;
                          },
                        },
                      });
                    },
                  });
                }}
              />

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
            </div>

            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={!!task.started}
                  className="cursor-pointer"
                  onChange={() => {
                    void updateTask({
                      variables: { input: { id: task.id, started: !task.started } },
                      refetchQueries: [{ query: GetTasksDocument }],
                      awaitRefetchQueries: true,
                    });
                  }}
                />
                <span className="cursor-pointer">Started</span>
              </label>

              <button
                className={clsx([loading ? "cursor-not-allowed" : "cursor-pointer", "text-sm text-red-600"])}
                onClick={() => openDeleteDialog(task.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
      <AlertDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          if (!v) {
            setPendingDeleteTaskId(null);
          }
          setDialogOpen(v);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} variant="destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
