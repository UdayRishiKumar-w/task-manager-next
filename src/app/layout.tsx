import HeaderAuth from "@/components/HeaderAuth";
import { MainContent } from "@/components/MainContent";
import { ModeToggle } from "@/components/ModeToggle";
import { AuthStatusSkeleton } from "@/components/skeletons/AuthStatusSkeleton";
import { ThemeProvider } from "@/components/theme-provider";
import { WebVitals } from "@/components/web-vitals";
import ApolloClientProvider from "@/graphql/client/ApolloClientProvider";
import AuthProvider from "@/graphql/client/AuthProvider";
import "@/styles/globals.css";
import clsx from "clsx";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Suspense, type PropsWithChildren } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Personal task manager — built with Next.js, GraphQL, MongoDB",
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="apple-mobile-web-app-title" content="Task Manager" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111827" media="(prefers-color-scheme: dark)" />
      </head>

      <body
        suppressHydrationWarning
        className={clsx("min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100", inter.className)}
      >
        {process.env.NODE_ENV === "development" && <WebVitals />}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ApolloClientProvider>
            <AuthProvider>
              <header className="bg-gray-50 px-3 py-3 shadow-sm sm:px-4 sm:py-4 dark:bg-gray-800" role="banner">
                <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2" aria-label="Main navigation">
                  <Link
                    href="/"
                    className="text-base font-semibold text-gray-900 transition-colors hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:text-lg dark:text-gray-100 dark:hover:text-blue-400"
                    aria-label="Task Manager home"
                  >
                    Task Manager
                  </Link>
                  <div className="flex flex-row items-center gap-1.5 sm:gap-2.5">
                    <ModeToggle />
                    <Suspense fallback={<AuthStatusSkeleton />}>
                      <HeaderAuth />
                    </Suspense>
                  </div>
                </nav>
              </header>

              <MainContent>{children}</MainContent>
            </AuthProvider>
          </ApolloClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
