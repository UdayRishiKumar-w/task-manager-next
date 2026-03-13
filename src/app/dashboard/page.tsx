import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const DashboardTaskList = dynamic(() => import("@/components/DashboardTaskList"), {
  loading: () => <DashboardSkeleton />,
});

export const metadata: Metadata = {
  title: "Dashboard - Task Manager",
  description: "View your tasks, filter and sort tasks.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded bg-white p-4 shadow sm:p-6 dark:bg-black" aria-labelledby="dashboard-heading">
        <h2 id="dashboard-heading" className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
          Dashboard
        </h2>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardTaskList />
        </Suspense>
      </section>
    </div>
  );
}
