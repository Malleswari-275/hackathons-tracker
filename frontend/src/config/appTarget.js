// Which portal this build is. Set per Cloudflare Pages project:
//   VITE_APP_TARGET=admin    -> admin/super-admin site
//   VITE_APP_TARGET=student  -> student site
//   (unset / "all")          -> everything, used for local dev
export const APP_TARGET = import.meta.env.VITE_APP_TARGET || "all";

export const TARGET_ROLES = {
  admin: ["SUPER_ADMIN", "ADMIN"],
  student: ["STUDENT"],
  all: ["SUPER_ADMIN", "ADMIN", "STUDENT"],
};

export const allowedRolesForTarget = TARGET_ROLES[APP_TARGET] || TARGET_ROLES.all;

export const isRoleAllowedHere = (role) => allowedRolesForTarget.includes(role);

export const isAdminApp = APP_TARGET === "admin" || APP_TARGET === "all";

export const APP_TITLE =
  APP_TARGET === "admin" ? "Admin Portal" :
  APP_TARGET === "student" ? "Student Portal" :
  "HackPortal";

export const PORTAL_LABEL =
  APP_TARGET === "admin" ? "administrators" :
  APP_TARGET === "student" ? "students" :
  "all users";
