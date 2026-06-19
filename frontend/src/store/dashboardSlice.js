import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  metrics: {},
  loading: false,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setMetrics: (state, action) => {
      state.metrics = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setMetrics, setLoading } = dashboardSlice.actions;
export default dashboardSlice.reducer;
