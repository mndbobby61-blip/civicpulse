export const STATUSES = ["SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export const STATUS_COLOR: Record<string, string> = {
  SUBMITTED: "var(--cp-red)",
  UNDER_REVIEW: "var(--cp-amb)",
  ASSIGNED: "var(--cp-amb)",
  IN_PROGRESS: "var(--cp-amb)",
  RESOLVED: "var(--g2)",
  CLOSED: "var(--cp-mute)",
};

export const PRIO_COLOR: Record<string, string> = {
  LOW: "var(--cp-mute)",
  MEDIUM: "var(--g2)",
  HIGH: "var(--cp-amb)",
  CRITICAL: "var(--cp-red)",
};