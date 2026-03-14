import type { InputMaybe, Priority } from "@/gql/graphql";
import { RootState } from "@/store";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TaskFiltersState {
  status: "ALL" | "ACTIVE" | "COMPLETED";
  priority: InputMaybe<Priority> | "ALL";
}

const initialState: TaskFiltersState = {
  status: "ALL",
  priority: "ALL",
};

const taskFiltersSlice = createSlice({
  name: "taskFilters",
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<TaskFiltersState["status"]>) {
      state.status = action.payload;
    },
    setPriorityFilter(state, action: PayloadAction<TaskFiltersState["priority"]>) {
      state.priority = action.payload;
    },
  },
});

export const { setStatusFilter, setPriorityFilter } = taskFiltersSlice.actions;
export default taskFiltersSlice.reducer;

export const selectStatusFilter = (s: RootState) => s.taskFilters.status;
export const selectPriorityFilter = (s: RootState) => s.taskFilters.priority;
