"use client";
import { TaskListShell } from "@/components/TaskListShell";
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
import { getFragmentData, type FragmentType } from "@/gql";
import {
  DeleteTaskDocument,
  GetTasksDocument,
  TaskFullFieldsFragmentDoc,
  ToggleTaskCompletedDocument,
  ToggleTaskStartedDocument,
  type GetTasksQuery,
  type ToggleTaskCompletedMutation,
  type ToggleTaskCompletedMutationVariables,
  type ToggleTaskStartedMutation,
  type ToggleTaskStartedMutationVariables,
} from "@/gql/graphql";
import type { Reference, StoreObject } from "@apollo/client/cache";
import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function TaskList() {
  const { data, loading, error } = useQuery<GetTasksQuery>(GetTasksDocument, {
    fetchPolicy: "cache-and-network",
  });
  const [toggleTaskCompleted] = useMutation<ToggleTaskCompletedMutation, ToggleTaskCompletedMutationVariables>(
    ToggleTaskCompletedDocument,
  );
  const [toggleTaskStarted] = useMutation<ToggleTaskStartedMutation, ToggleTaskStartedMutationVariables>(
    ToggleTaskStartedDocument,
  );
  const [deleteTask] = useMutation(DeleteTaskDocument);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  const rawTasks = (data?.getTasks ?? []) as FragmentType<typeof TaskFullFieldsFragmentDoc>[];
  const tasks = getFragmentData(TaskFullFieldsFragmentDoc, rawTasks);

  const titleOf = useCallback((taskId: string) => tasks.find((t) => t.id === taskId)?.title ?? "Task", [tasks]);

  const handleToggleCompleted = useCallback(
    (taskId: string, currentCompleted: boolean, currentStarted: boolean) => {
      const nextCompleted = !currentCompleted;
      const nextStarted = nextCompleted ? true : currentStarted;
      const title = titleOf(taskId);
      void toggleTaskCompleted({
        variables: { id: taskId },
        optimisticResponse: {
          toggleTaskCompleted: { __typename: "Task", id: taskId, completed: nextCompleted, started: nextStarted },
        },
        update: (cache, { data: mutationData }) => {
          const result = mutationData?.toggleTaskCompleted;
          if (!result) return;
          const cacheId = cache.identify({ __typename: "Task", id: taskId });
          if (!cacheId) return;
          cache.modify({ id: cacheId, fields: { completed: () => result.completed, started: () => result.started } });
        },
        onCompleted: (result) => {
          const msg = result.toggleTaskCompleted.completed ? "marked complete" : "marked incomplete";
          toast.success(`Task "${title}" ${msg}`);
        },
        onError: () => toast.error(`Task "${title}" failed to update`),
      });
    },
    [titleOf, toggleTaskCompleted],
  );

  const handleToggleStarted = useCallback(
    (taskId: string, currentStarted: boolean) => {
      const title = titleOf(taskId);
      void toggleTaskStarted({
        variables: { id: taskId },
        optimisticResponse: { toggleTaskStarted: { __typename: "Task", id: taskId, started: !currentStarted } },
        update: (cache, { data: mutationData }) => {
          const result = mutationData?.toggleTaskStarted;
          if (!result) return;
          const cacheId = cache.identify({ __typename: "Task", id: taskId });
          if (!cacheId) return;
          cache.modify({ id: cacheId, fields: { started: () => result.started } });
        },
        onCompleted: (result) => {
          const msg = result.toggleTaskStarted.started ? "started" : "marked not started";
          toast.success(`Task "${title}" ${msg}`);
        },
        onError: () => toast.error(`Task "${title}" failed to update`),
      });
    },
    [titleOf, toggleTaskStarted],
  );

  const handleDelete = useCallback(
    async (taskId: string) => {
      const title = titleOf(taskId);
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
        onCompleted: () => toast.success(`Task "${title}" deleted`),
        onError: () => toast.error(`Task "${title}" failed to delete`),
      });
    },
    [titleOf, deleteTask],
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    await handleDelete(pendingDelete.id);
    setDialogOpen(false);
    setPendingDelete(null);
  }, [pendingDelete, handleDelete]);

  const handleOpenDelete = useCallback(
    (id: string) => {
      setPendingDelete({ id, title: titleOf(id) });
      setDialogOpen(true);
    },
    [titleOf],
  );

  const handleDialogOpenChange = useCallback((v: boolean) => {
    if (!v) setPendingDelete(null);
    setDialogOpen(v);
  }, []);

  return (
    <>
      <TaskListShell
        loading={loading && !data}
        error={error}
        tasks={tasks}
        interactive
        listLoading={loading}
        onToggleCompleted={handleToggleCompleted}
        onToggleStarted={handleToggleStarted}
        onDelete={handleOpenDelete}
      />
      <AlertDialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task - &ldquo;{pendingDelete?.title}&rdquo;? This action cannot be
              undone.
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
