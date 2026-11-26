export type PrioInput = {
  priority: string;
  upvoteCount: number;
  createdAt: Date;
  slaDueAt: Date | null;
  status: string;
};

const SEV: Record<string, number> = { LOW: 10, MEDIUM: 20, HIGH: 30, CRITICAL: 40 };

export const isOpen = (s: string) => s !== "RESOLVED" && s !== "CLOSED";

// সর্বোচ্চ ১০০: গুরুত্ব ৪০ + ভোট ২০ + কতদিন ঝুলে আছে ২০ + সময়সীমা পার ২০
export function priorityParts(i: PrioInput, now: number) {
  if (!isOpen(i.status)) return { sev: 0, votes: 0, age: 0, sla: 0, total: 0 };
  const sev = SEV[i.priority] ?? 20;
  const votes = Math.min(i.upvoteCount, 20);
  const days = (now - i.createdAt.getTime()) / 86_400_000;
  const age = Math.min(Math.floor(days), 10) * 2;
  const sla = i.slaDueAt && i.slaDueAt.getTime() < now ? 20 : 0;
  return { sev, votes, age, sla, total: sev + votes + age + sla };
}

export function slaHoursLeft(due: Date | null, status: string, now: number) {
  if (!due || !isOpen(status)) return null;
  return Math.round((due.getTime() - now) / 3_600_000);
}