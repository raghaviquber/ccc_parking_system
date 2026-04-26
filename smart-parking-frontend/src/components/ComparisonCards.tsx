import { cn } from "@/lib/utils";
import { Trophy, Zap, Brain, Info, Footprints, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface AlgoResult {
  slot: number;
  distance: number;
  timeMs: number;
}

interface ComparisonCardsProps {
  greedy: AlgoResult | null;
  dp: AlgoResult | null;
}

function ResultCard({
  title,
  icon,
  result,
  isBetter,
  accent,
  hint,
  explanation,
}: {
  title: string;
  icon: React.ReactNode;
  result: AlgoResult | null;
  isBetter: boolean;
  accent: string;
  hint: string;
  explanation: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card p-6 transition-all duration-500",
        isBetter
          ? "border-primary/40 shadow-[var(--shadow-glow)]"
          : "border-border shadow-[var(--shadow-soft)]",
      )}
    >
      {isBetter && (
        <div className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-[var(--shadow-card)]">
          <Trophy className="h-3 w-3" />
          Best Option
        </div>
      )}
      <div className="flex items-center gap-3 mb-5">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            accent,
          )}
        >
          {icon}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="More info"
                className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-center">
              {hint}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Assigned Slot</span>
            <span className="font-mono font-semibold tabular-nums">
              #{String(result.slot).padStart(2, "0")}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
              <Footprints className="h-3.5 w-3.5" />
              Walking Distance
            </span>
            <span className="font-mono font-semibold tabular-nums">
              {result.distance.toFixed(1)}m
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Time Taken</span>
            <span className="font-mono font-semibold tabular-nums">
              {result.timeMs.toFixed(2)}ms
            </span>
          </div>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border/60">
            {explanation}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Run a comparison to see results
        </p>
      )}
    </div>
  );
}

export function ComparisonCards({ greedy, dp }: ComparisonCardsProps) {
  const dpBetter = !!(greedy && dp && dp.distance < greedy.distance);
  const greedyBetter = !!(greedy && dp && greedy.distance < dp.distance);
  const tie = !!(greedy && dp && greedy.distance === dp.distance);
  const savings =
    greedy && dp ? Math.max(0, greedy.distance - dp.distance) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-5 md:grid-cols-2">
        <ResultCard
          title="Quick Parking Result"
          icon={<Zap className="h-5 w-5 text-primary-glow" />}
          accent="bg-primary-glow/15"
          result={greedy}
          isBetter={greedyBetter}
          hint="Faster assignment but may require more walking."
          explanation="Faster assignment but may require more walking."
        />
        <ResultCard
          title="Smart Parking Result"
          icon={<Brain className="h-5 w-5 text-primary" />}
          accent="bg-accent"
          result={dp}
          isBetter={dpBetter}
          hint="Optimized to reduce your walking distance."
          explanation="Optimized to reduce your walking distance."
        />
      </div>

      {greedy && dp && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl border p-4 animate-fade-in",
            dpBetter
              ? "border-primary/30 bg-primary/5"
              : "border-border bg-muted/40",
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-sm">
            {dpBetter ? (
              <>
                <span className="font-semibold">Smart Parking saves {savings.toFixed(1)} meters</span>{" "}
                of walking distance 🚶
              </>
            ) : tie || greedyBetter ? (
              <>Parking is not crowded. Quick Parking is sufficient.</>
            ) : null}
          </p>
        </div>
      )}
    </div>
  );
}
