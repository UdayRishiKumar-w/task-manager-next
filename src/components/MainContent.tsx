import { PageContentSkeleton } from "@/components/skeletons/PageContentSkeleton";
import { Suspense, type PropsWithChildren } from "react";

export function MainContent({ children }: Readonly<PropsWithChildren>) {
  return (
    <main id="main-content" className="flex-1 overflow-y-auto" role="main">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        <Suspense fallback={<PageContentSkeleton />}>{children}</Suspense>
      </div>
    </main>
  );
}
