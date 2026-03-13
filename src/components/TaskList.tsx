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
import { getFragmentData, type FragmentType } from "@/gql";
import {
  DeleteTaskDocument,
  GetTasksDocument,
  TaskFullFieldsFragmentDoc,
  ToggleTaskDocument,
  UpdateTaskDocument,
  type GetTasksQuery,
  type ToggleTaskMutation,
  type ToggleTaskMutationVariables,
} from "@/gql/graphql";
import type { Reference, StoreObject } from "@apollo/client/cache";
import { useMutation, useQuery } from "@apollo/client/react";
import clsx from "clsx";
import { useState } from "react";

export default function TaskList() {
  const { data, loading, error } = useQuery<GetTasksQuery>(GetTasksDocument, {
    fetchPolicy: "cache-and-network",
  });

  const [toggleTask] = useMutation<ToggleTaskMutation, ToggleTaskMutationVariables>(ToggleTaskDocument);
  const [deleteTask] = useMutation(DeleteTaskDocument);
  const [updateTask] = useMutation(UpdateTaskDocument);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null);

  if (loading && !data)
    return (
      <div className="space-y-3">
        <Skeleton height={48} />
        <Skeleton height={48} />
        <Skeleton height={48} />
      </div>
    );
  if (error) return <p className="text-red-600 dark:text-red-400">Error loading tasks: {error.message}</p>;

  const rawTasks = (data?.getTasks ?? []) as FragmentType<typeof TaskFullFieldsFragmentDoc>[];
  const tasks = getFragmentData(TaskFullFieldsFragmentDoc, rawTasks);

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
    <>
      {tasks.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No tasks yet</p>
      ) : (
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
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-gray-400 text-blue-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:mt-0 dark:border-gray-500 dark:bg-gray-700"
                    aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
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
                          variant={
                            task.priority === "HIGH" ? "destructive" : task.priority === "LOW" ? "secondary" : "default"
                          }
                          className="mr-1"
                          aria-label={`Priority: ${task.priority}`}
                        >
                          {task.priority}
                        </Badge>
                      )}
                      {isValidDate && (
                        <time dateTime={new Date(createdAtNum).toISOString()}>
                          Created{" "}
                          {new Date(createdAtNum).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 sm:self-auto">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={!!task.started}
                      className="h-4 w-4 cursor-pointer rounded border-gray-400 text-blue-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-500 dark:bg-gray-700"
                      aria-label={`Mark "${task.title}" as ${task.started ? "not started" : "started"}`}
                      onChange={() => {
                        void updateTask({
                          variables: { input: { id: task.id, started: !task.started } },
                          refetchQueries: [{ query: GetTasksDocument }],
                          awaitRefetchQueries: true,
                        });
                      }}
                    />
                    <span className="whitespace-nowrap">Started</span>
                  </label>

                  <button
                    className={clsx([
                      loading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:underline",
                      "text-sm font-medium whitespace-nowrap text-red-700 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-red-500",
                    ])}
                    onClick={() => openDeleteDialog(task.id)}
                    disabled={loading}
                    aria-label={`Delete task "${task.title}"`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
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
    </>
  );
}
