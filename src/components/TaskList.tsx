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
  type TaskFullFieldsFragment,
  type ToggleTaskCompletedMutation,
  type ToggleTaskStartedMutation,
} from "@/gql/graphql";
import type { ApolloCache, Reference } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function TaskList() {
  const { data, loading, error } = useQuery(GetTasksDocument, {
    fetchPolicy: "cache-and-network",
  });
  const [toggleTaskCompleted] = useMutation(ToggleTaskCompletedDocument);
  const [toggleTaskStarted] = useMutation(ToggleTaskStartedDocument);
  const [deleteTask] = useMutation(DeleteTaskDocument);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  const rawTasks = (data?.getTasks ?? []) as FragmentType<typeof TaskFullFieldsFragmentDoc>[];
  const tasks = getFragmentData(TaskFullFieldsFragmentDoc, rawTasks);

  const titleOf = useCallback(
    (taskId: string) => tasks.find((t: TaskFullFieldsFragment) => t.id === taskId)?.title ?? "Task",
    [tasks],
  );

  const handleToggleCompleted = useCallback(
    (taskId: string, currentCompleted: boolean, currentStarted: boolean) => {
      const nextCompleted = !currentCompleted;
      const nextStarted = nextCompleted ? true : currentStarted;
      const title = titleOf(taskId);
      void toggleTaskCompleted({
        variables: { id: taskId },
        optimisticResponse: {
          __typename: "Mutation",
          toggleTaskCompleted: { __typename: "Task", id: taskId, completed: nextCompleted, started: nextStarted },
        } as ToggleTaskCompletedMutation,
        update: (cache: ApolloCache, { data: mutationData }) => {
          const result = mutationData?.toggleTaskCompleted;
          if (!result) return;
          const cacheId = cache.identify({ __typename: "Task", id: taskId });
          if (!cacheId) return;
          cache.modify({ id: cacheId, fields: { completed: () => result.completed, started: () => result.started } });
        },
        onCompleted: (result: ToggleTaskCompletedMutation) => {
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
        optimisticResponse: {
          __typename: "Mutation",
          toggleTaskStarted: { __typename: "Task", id: taskId, started: !currentStarted },
        } as ToggleTaskStartedMutation,
        update: (cache: ApolloCache, { data: mutationData }) => {
          const result = mutationData?.toggleTaskStarted;
          if (!result) return;
          const cacheId = cache.identify({ __typename: "Task", id: taskId });
          if (!cacheId) return;
          cache.modify({ id: cacheId, fields: { started: () => result.started } });
        },
        onCompleted: (result: ToggleTaskStartedMutation) => {
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
              getTasks(
                existingRefs: readonly Reference[] | undefined,
                { readField }: { readField: (fieldName: string, ref: Reference) => unknown },
              ) {
                return (existingRefs ?? []).filter((ref) => readField("id", ref) !== taskId);
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
