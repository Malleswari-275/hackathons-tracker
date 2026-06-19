import api from "./axios";

export const updateRegistration = (competitionId, data) =>
  api.patch(`/registrations/${competitionId}`, data);
export const getRegistrations = (competitionId) =>
  api.get(`/registrations/${competitionId}`);
export const getRegistrationAnalytics = () =>
  api.get("/registrations/analytics");
