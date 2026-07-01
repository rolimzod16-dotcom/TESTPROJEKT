import type { Report } from "@/lib/types";

export type ReportPayload = Report;

type Listener = (report: ReportPayload) => void;

const listeners = new Map<string, Set<Listener>>();

export function subscribeToReports(userId: string, listener: Listener) {
  if (!listeners.has(userId)) {
    listeners.set(userId, new Set());
  }
  listeners.get(userId)!.add(listener);

  return () => {
    listeners.get(userId)?.delete(listener);
  };
}

export function publishReport(userId: string, report: Report) {
  listeners.get(userId)?.forEach((listener) => listener(report));
}