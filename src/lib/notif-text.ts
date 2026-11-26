import type { Key } from "./dict";

export function notifText(n: { type: string; message: string }, t: (k: Key) => string) {
  if (n.type === "STATUS") return `${t("nt_status")} ${t(`st_${n.message}` as Key)}`;
  if (n.type === "TASK") return `${t("nt_task")} ${n.message}`;
  return `${t("nt_new_issue")} ${n.message}`;
}