import DashboardTaskList from "@/components/DashboardTaskList";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="rounded bg-white p-6 shadow dark:bg-black">
        <h2 className="mb-4 text-lg font-semibold">Tasks</h2>
        <Suspense fallback={<div>Loading tasks...</div>}>
          <DashboardTaskList />
        </Suspense>
      </div>
    </div>
  );
}
