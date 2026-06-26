import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/services/leads";

const styles: Record<LeadStatus, string> = {
  new: "bg-info/15 text-info border-info/30",
  contacted: "bg-warning/15 text-warning-foreground border-warning/40 dark:text-warning",
  converted: "bg-success/15 text-success border-success/30",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
