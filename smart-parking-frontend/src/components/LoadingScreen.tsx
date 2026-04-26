import { ParkingSquare } from "lucide-react";

export function LoadingScreen({ message = "Loading dashboard…" }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background">
      <div className="relative">
        <div className="h-14 w-14 rounded-2xl bg-[var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-glow)] animate-pulse">
          <ParkingSquare className="h-7 w-7 text-primary-foreground" />
        </div>
        <div className="absolute -inset-2 rounded-2xl border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
