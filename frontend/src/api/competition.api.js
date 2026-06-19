import api from "./axios";

export const createCompetition = (data) => api.post("/competitions", data);
export const getCompetitions = (params) => api.get("/competitions", { params });
export const getCompetitionById = (id) => api.get(`/competitions/${id}`);
export const updateCompetition = (id, data) => api.put(`/competitions/${id}`, data);
export const deleteCompetition = (id) => api.delete(`/competitions/${id}`);
export const approveCompetition = (id) => api.patch(`/competitions/${id}/approve`);
export const rejectCompetition = (id, data) => api.patch(`/competitions/${id}/reject`, data);
export const publishCompetition = (id) => api.patch(`/competitions/${id}/publish`);
