import { PageContentSkeleton } from "@/components/skeletons/PageContentSkeleton";
import { Suspense, type PropsWithChildren } from "react";

export function MainContent({ children }: Readonly<PropsWithChildren>) {
  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6" role="main">
      <Suspense fallback={<PageContentSkeleton />}>{children}</Suspense>
    </main>
  );
}
