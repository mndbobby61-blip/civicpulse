/**
 * Sanitizes and quotes a single CSV cell, guarding against spreadsheet formula injection.
 */
export function csvCell(val: unknown): string {
  let s = String(val ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}
