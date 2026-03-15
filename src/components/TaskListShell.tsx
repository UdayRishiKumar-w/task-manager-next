import { TaskCard } from "@/components/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { TaskFullFieldsFragment } from "@/gql/graphql";

interface TaskListShellProps {
  loading: boolean;
  error: Error | undefined;
  tasks: TaskFullFieldsFragment[];
  interactive?: boolean;
  listLoading?: boolean;
  onToggleCompleted?: (id: string, completed: boolean, started: boolean) => void;
  onToggleStarted?: (id: string, started: boolean) => void;
  onDelete?: (id: string) => void;
}

export function TaskListShell({
  loading,
  error,
  tasks,
  interactive = false,
  listLoading = false,
  onToggleCompleted,
  onToggleStarted,
  onDelete,
}: Readonly<TaskListShellProps>) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton height={56} />
        <Skeleton height={56} />
        <Skeleton height={56} />
      </div>
    );
  }
  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">Error loading tasks: {error.message}</p>;
  }
  if (tasks.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No tasks yet</p>;
  }

  const cardProps = {
    interactive,
    loading: listLoading,
    ...(onToggleCompleted && { onToggleCompleted }),
    ...(onToggleStarted && { onToggleStarted }),
    ...(onDelete && { onDelete }),
  };

  return (
    <ul className="space-y-3" aria-label="Task list">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} {...cardProps} />
      ))}
    </ul>
  );
}
