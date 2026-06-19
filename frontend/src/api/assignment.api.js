import api from "./axios";

export const assignCompetition = (data) => api.post("/assignments", data);
export const getAssignments = (competitionId) => api.get(`/assignments/${competitionId}`);
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`);
