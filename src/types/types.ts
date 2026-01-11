export interface Task {
  id: string;
  title: string;
  completed: boolean;
  started: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  updatedAt: string;
}
