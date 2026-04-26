import { Loader2, Wifi, WifiOff } from "lucide-react";

export function BackendBanner({
  status,
}: {
  status: "checking" | "online" | "offline";
}) {
  if (status === "online") return null;
  const isChecking = status === "checking";
  return (
    <div
      className={`border-b text-xs sm:text-sm ${
        isChecking
          ? "bg-primary/5 border-primary/20 text-primary"
          : "bg-destructive/5 border-destructive/20 text-destructive"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex items-center gap-2">
        {isChecking ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <WifiOff className="h-3.5 w-3.5" />
        )}
        <span>
          {isChecking
            ? "Connecting to backend… (Render free tier may take ~30s to wake up)"
            : "Backend offline — using local fallback so the app stays usable."}
        </span>
        {status === "offline" && (
          <Wifi className="h-3.5 w-3.5 ml-auto opacity-60" />
        )}
      </div>
    </div>
  );
}
