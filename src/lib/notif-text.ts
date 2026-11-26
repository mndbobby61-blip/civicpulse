import type { Key } from "./dict";

export function notifText(n: { type: string; message: string }, t: (k: Key) => string) {
  if (n.type === "STATUS") return `${t("nt_status")} ${t(`st_${n.message}` as Key)}`;
  if (n.type === "TASK") return `${t("nt_task")} ${n.message}`;
  if (n.type === "COMMENT") return `${t("nt_comment")} ${n.message}`;
  if (n.type === "SLA") return `${t("nt_sla")} ${n.message}`;
  return `${t("nt_new_issue")} ${n.message}`;
}