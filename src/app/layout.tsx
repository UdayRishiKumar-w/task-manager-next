import HeaderAuth from "@/components/HeaderAuth";
import { WebVitals } from "@/components/web-vitals";
import ApolloClientProvider from "@/graphql/client/ApolloClientProvider";
import AuthProvider from "@/graphql/client/AuthProvider";
import "@/styles/globals.css";
import clsx from "clsx";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense, type PropsWithChildren } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Personal task manager — built with Next.js, GraphQL, MongoDB",
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>

      <body
        suppressHydrationWarning
        className={clsx("min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100", inter.className)}
      >
        {process.env.NODE_ENV === "development" && <WebVitals />}
        <ApolloClientProvider>
          <AuthProvider>
            <header className="bg-gray-50 p-4 shadow-sm dark:bg-gray-800">
              <div className="mx-auto flex max-w-4xl items-center justify-between">
                <h1 className="text-lg font-semibold">Task Manager</h1>
                <Suspense fallback={<div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />}>
                  <HeaderAuth />
                </Suspense>
              </div>
            </header>
            <main className="mx-auto max-w-4xl p-4">
              <Suspense
                fallback={
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-32 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                }
              >
                {children}
              </Suspense>
            </main>
          </AuthProvider>
        </ApolloClientProvider>
      </body>
    </html>
  );
}
