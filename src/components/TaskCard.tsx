"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { TaskFullFieldsFragment } from "@/gql/graphql";
import clsx from "clsx";

export function getPriorityVariant(priority: string): "destructive" | "secondary" | "default" {
  if (priority === "HIGH") return "destructive";
  if (priority === "LOW") return "secondary";
  return "default";
}

function DueDate({ dueDate, completed }: Readonly<{ dueDate: Date | null | undefined; completed: boolean }>) {
  if (!dueDate) return null;
  const due = new Date(dueDate as unknown as string);
  const isOverdue = !completed && due < new Date();
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
}

interface TaskCardProps {
  task: TaskFullFieldsFragment;
  interactive?: boolean;
  loading?: boolean;
  onToggleCompleted?: (id: string, completed: boolean, started: boolean) => void;
  onToggleStarted?: (id: string, started: boolean) => void;
  onDelete?: (id: string) => void;
}

function getCheckboxLabel(
  title: string,
  state: boolean,
  interactive: boolean,
  activeLabel: string,
  inactiveLabel: string,
) {
  if (interactive) return `Mark "${title}" as ${state ? activeLabel : inactiveLabel}`;
  return `"${title}" is ${state ? inactiveLabel : activeLabel}`;
}

export function TaskCard({
  task,
  interactive = false,
  loading = false,
  onToggleCompleted,
  onToggleStarted,
  onDelete,
}: Readonly<TaskCardProps>) {
  const createdAtNum = Number(task.createdAt);
  const isValidDate = task.createdAt && !Number.isNaN(createdAtNum);

  const completedLabel = getCheckboxLabel(task.title, task.completed, interactive, "incomplete", "complete");
  const startedLabel = getCheckboxLabel(task.title, !!task.started, interactive, "not started", "started");

  return (
    <li>
      <Card className="flex flex-row items-center justify-between gap-3 rounded-lg p-3 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Checkbox
            checked={task.completed}
            disabled={!interactive}
            className={clsx("size-5 shrink-0", interactive ? "cursor-pointer" : "cursor-default")}
            aria-label={completedLabel}
            aria-readonly={interactive ? undefined : "true"}
            {...(interactive && {
              onCheckedChange: () => onToggleCompleted?.(task.id, task.completed, !!task.started),
            })}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <span
              className={clsx(
                "font-medium wrap-break-word",
                task.completed ? "text-gray-400 line-through dark:text-gray-500" : "text-gray-900 dark:text-gray-100",
              )}
            >
              {task.title}
            </span>
            <div className="mt-1 flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 dark:text-gray-400">
              {task.priority && (
                <Badge variant={getPriorityVariant(task.priority)} aria-label={`Priority: ${task.priority}`}>
                  {task.priority}
                </Badge>
              )}
              {isValidDate && (
                <time dateTime={new Date(createdAtNum).toISOString()}>
                  Created {new Date(createdAtNum).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </time>
              )}
              <DueDate dueDate={task.dueDate} completed={task.completed} />
            </div>
          </div>
        </div>

        {/* Right: started + delete */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <label
            className={clsx(
              "inline-flex items-center gap-2 text-xs font-medium",
              task.completed || !interactive
                ? "cursor-default text-gray-400 opacity-60 dark:text-gray-500"
                : "cursor-pointer text-gray-700 dark:text-gray-300",
            )}
          >
            <Checkbox
              checked={!!task.started}
              disabled={!interactive || task.completed}
              className={clsx("size-4", interactive && !task.completed ? "cursor-pointer" : "cursor-default")}
              aria-label={startedLabel}
              aria-readonly={interactive ? undefined : "true"}
              {...(interactive &&
                !task.completed && {
                  onCheckedChange: () => onToggleStarted?.(task.id, !!task.started),
                })}
            />
            <span className="whitespace-nowrap">Started</span>
          </label>

          {interactive && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
              onClick={() => onDelete(task.id)}
              disabled={loading}
              aria-label={`Delete task "${task.title}"`}
            >
              Delete
            </Button>
          )}
        </div>
      </Card>
    </li>
  );
}
