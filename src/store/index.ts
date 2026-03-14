import { configureStore } from "@reduxjs/toolkit";
import taskFiltersReducer from "./taskFiltersSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      taskFilters: taskFiltersReducer,
    },
  });
}

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
