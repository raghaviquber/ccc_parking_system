import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";

export interface LogEntry {
  id: string;
  time: string;
  message: string;
}

export function ActivityLog({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="rounded-2xl border bg-card shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 px-5 py-4 border-b">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Activity Log</h3>
      </div>
      <ScrollArea className="h-64">
        <div className="p-3">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              No activity yet. Park a car to begin.
            </p>
          ) : (
            <ul className="space-y-1">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted/60 transition-colors animate-fade-in"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">{e.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {e.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
