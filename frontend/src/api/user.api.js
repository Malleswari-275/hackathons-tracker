import api from "./axios";

// Admin management (SUPER_ADMIN only)
export const createAdmin = (data) => api.post("/users/admins", data);
export const getAdmins = () => api.get("/users/admins");
export const editAdmin = (id, data) => api.put(`/users/admins/${id}`, data);
export const toggleAdminStatus = (id, data) => api.patch(`/users/admins/${id}/toggle`, data);

// Student management (ADMIN / SUPER_ADMIN)
export const createStudent = (data) => api.post("/users/students", data);
export const getStudents = () => api.get("/users/students");
export const updateStudent = (id, data) => api.put(`/users/students/${id}`, data);
export const toggleStudentStatus = (id, data) => api.patch(`/users/students/${id}/toggle`, data);

// Common
export const resetUserPassword = (id) => api.post(`/users/${id}/reset-password`);
