import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import ChangePasswordPage from "@/pages/auth/ChangePasswordPage";

// Dashboard
import DashboardPage from "@/pages/dashboard/DashboardPage";

// Competitions
import CompetitionListPage from "@/pages/competitions/CompetitionListPage";
import CompetitionDetailPage from "@/pages/competitions/CompetitionDetailPage";
import CreateCompetitionPage from "@/pages/competitions/CreateCompetitionPage";
import EditCompetitionPage from "@/pages/competitions/EditCompetitionPage";
import ReviewCompetitionPage from "@/pages/competitions/ReviewCompetitionPage";

// Users
import AdminManagementPage from "@/pages/users/AdminManagementPage";
import StudentManagementPage from "@/pages/users/StudentManagementPage";

// Assignments, Registrations, Notifications, Profile
import AssignmentPage from "@/pages/assignments/AssignmentPage";
import RegistrationPage from "@/pages/registrations/RegistrationPage";
import NotificationsPage from "@/pages/notifications/NotificationsPage";
import ProfilePage from "@/pages/profile/ProfilePage";

export const router = createBrowserRouter([
  // Public routes
  { path: "/login", element: <LoginPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },

  // Protected routes with layout
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "change-password", element: <ChangePasswordPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "notifications", element: <NotificationsPage /> },

      // Competitions
      { path: "competitions", element: <CompetitionListPage /> },
      {
        path: "competitions/new",
        element: (
          <RoleRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <CreateCompetitionPage />
          </RoleRoute>
        ),
      },
      { path: "competitions/:id", element: <CompetitionDetailPage /> },
      {
        path: "competitions/:id/edit",
        element: (
          <RoleRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <EditCompetitionPage />
          </RoleRoute>
        ),
      },
      {
        path: "competitions/:id/review",
        element: (
          <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
            <ReviewCompetitionPage />
          </RoleRoute>
        ),
      },

      // User Management
      {
        path: "users/admins",
        element: (
          <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
            <AdminManagementPage />
          </RoleRoute>
        ),
      },
      {
        path: "users/students",
        element: (
          <RoleRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <StudentManagementPage />
          </RoleRoute>
        ),
      },

      // Assignments & Registrations
      {
        path: "assignments/:competitionId",
        element: (
          <RoleRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <AssignmentPage />
          </RoleRoute>
        ),
      },
      { path: "registrations/:competitionId", element: <RegistrationPage /> },
    ],
  },

  // Catch-all
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
