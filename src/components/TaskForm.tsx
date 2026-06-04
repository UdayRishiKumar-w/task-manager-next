"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CreateTaskInput as GQLCreateTaskInput } from "@/gql/graphql";
import { CreateTaskDocument, GetTasksDocument } from "@/gql/graphql";
import { createTaskSchema, type CreateTaskInput } from "@/lib/validators/taskSchema";
import { useMutation } from "@apollo/client/react";

export default function TaskForm() {
  const [createTask, { loading }] = useMutation(CreateTaskDocument);

  const defaultValues = {
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
    defaultValues,
    shouldFocusError: true,
  });

  const onSubmit: SubmitHandler<CreateTaskInput> = async (values) => {
    const input: GQLCreateTaskInput = {
      title: values.title,
      priority: values.priority,
    };

    if (values.description) {
      input.description = values.description;
    }

    if (values.dueDate) {
      input.dueDate = new Date(values.dueDate);
    }

    try {
      await createTask({
        variables: { input },
        refetchQueries: [{ query: GetTasksDocument }],
        awaitRefetchQueries: true,
      });
      reset({ ...defaultValues, dueDate: new Date().toISOString() });
      toast.success(`Task "${values.title}" created`);
    } catch {
      toast.error(`Task "${values.title}" failed to create`);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(onSubmit)(e);
      }}
      className="flex flex-col gap-3 sm:flex-row sm:gap-2"
      aria-label="Create new task"
    >
      <div className="flex-1 space-y-2">
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
            <Textarea
              {...field}
              aria-label="Task description"
              aria-describedby={errors.description ? "description-error" : undefined}
              aria-invalid={!!errors.description}
              placeholder="Description (optional)"
              rows={2}
              disabled={loading}
            />
          )}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.description.message as string}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:w-auto sm:flex-row sm:items-start">
        <div className="flex flex-col gap-1">
          <Label htmlFor="priority-task-form-input" className="sr-only">
            Priority
          </Label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
                <SelectTrigger id="priority-task-form-input" className="w-32" aria-label="Task priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.priority && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.priority.message}
            </p>
          )}
        </div>

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

        <Button
          type="submit"
          disabled={loading}
          aria-label={loading ? "Adding task..." : "Add task"}
          className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Adding..." : "Add"}
        </Button>
      </div>
    </form>
  );
}
