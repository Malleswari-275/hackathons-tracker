import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return "—";
  return dayjs(date).format("MMM D, YYYY");
}

export function formatDateTime(date) {
  if (!date) return "—";
  return dayjs(date).format("MMM D, YYYY h:mm A");
}

export function timeAgo(date) {
  if (!date) return "";
  return dayjs(date).fromNow();
}

export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const EVENT_TYPES = [
  "HACKATHON",
  "INTERNSHIP",
  "IDEATHON",
  "FULLTIME",
  "INNOVATION_CHALLENGE",
  "OTHER",
];

export const EVENT_MODES = ["ONLINE", "OFFLINE", "HYBRID"];

export const COMPETITION_STATUSES = [
  "PENDING",
  "PUBLISHED",
  "REJECTED",
  "LIVE",
  "CLOSED",
];

export const REGISTRATION_STATUSES = ["REGISTERED", "NOT_REGISTERED"];

export const NOTIFICATION_TYPES = [
  "EVENT_ASSIGNED",
  "EVENT_APPROVED",
  "EVENT_REJECTED",
  "ELIGIBLE_EVENT",
  "DEADLINE_REMINDER",
  "EVENT_STARTS",
  "GENERAL",
];
