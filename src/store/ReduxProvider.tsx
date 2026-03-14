"use client";

import { store } from "@/store";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";

export function ReduxProvider({ children }: Readonly<PropsWithChildren>) {
  return <Provider store={store}>{children}</Provider>;
}
