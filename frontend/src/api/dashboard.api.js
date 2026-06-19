import api from "./axios";

export const getDashboardAnalytics = () => api.get("/dashboard/analytics");
