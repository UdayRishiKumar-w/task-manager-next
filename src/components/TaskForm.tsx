"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import type { CreateTaskInput as GQLCreateTaskInput } from "@/gql/graphql";
import { CreateTaskDocument, GetTasksDocument } from "@/gql/graphql";
import { createTaskSchema, type CreateTaskInput } from "@/lib/validators/taskSchema";
import { useMutation } from "@apollo/client/react";
import { clsx } from "clsx";

export default function TaskForm() {
  const [createTask, { loading }] = useMutation(CreateTaskDocument);

  const taskFormDefaultValues = {
    title: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    description: "",
    dueDate: new Date().toISOString(),
    completed: false,
    started: false,
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: taskFormDefaultValues,
    shouldFocusError: true,
  });

  const onSubmit: SubmitHandler<CreateTaskInput> = async (values) => {
    const input: Record<string, unknown> = {
      title: values.title,
      priority: values.priority,
    };

    if (values.dueDate) {
      input.dueDate = new Date(values.dueDate).toISOString();
    }

    await createTask({
      variables: { input: input as GQLCreateTaskInput },
      refetchQueries: [{ query: GetTasksDocument }],
      awaitRefetchQueries: true,
    });

    reset({
      ...taskFormDefaultValues,
      dueDate: new Date().toISOString(),
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }}
      className="flex gap-2"
      aria-label="Create new task"
    >
      <div className="flex-1">
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              disabled={loading}
              placeholder="Task title"
              aria-label="Task title"
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              required
              className={clsx(loading ? "cursor-not-allowed" : "cursor-pointer")}
            />
          )}
        />

        {errors.title && (
          <p id="title-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.title.message}
          </p>
        )}

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              id="task-description"
              aria-label="Task description"
              aria-describedby={errors.description ? "description-error" : undefined}
              aria-invalid={!!errors.description}
              placeholder="Description (optional)"
              className={clsx(["mt-2 w-full rounded border p-2", loading ? "cursor-not-allowed" : "cursor-pointer"])}
              rows={2}
              disabled={loading}
            />
          )}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.description?.message as string}
          </p>
        )}
      </div>

      <div className="w-32">
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <select
              id="priority-task-form-input"
              aria-label="Task priority"
              aria-describedby={errors.priority ? "priority-error" : undefined}
              aria-invalid={!!errors.priority}
              {...field}
              disabled={loading}
              className={clsx(["w-full rounded border px-2 py-1", loading ? "cursor-not-allowed" : "cursor-pointer"])}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          )}
        />
        {errors.priority && (
          <p id="priority-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.priority.message}
          </p>
        )}
      </div>

      <div className="w-42">
        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <DatePicker
              id="dueDate"
              value={field.value || null}
              onChange={(iso) => field.onChange(iso ?? "")}
              disabled={loading}
              aria-label="Task due date"
            />
          )}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        variant="default"
        aria-label={loading ? "Adding task..." : "Add task"}
        className={clsx(loading ? "cursor-not-allowed" : "cursor-pointer")}
      >
        {loading ? "Adding..." : "Add"}
      </Button>
    </form>
  );
}
