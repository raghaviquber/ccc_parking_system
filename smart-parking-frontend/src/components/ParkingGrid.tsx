import { cn } from "@/lib/utils";
import { Car, MapPin } from "lucide-react";
import {
  GRID_COLS,
  GRID_ROWS,
  slotCoords,
  type Destination,
} from "@/lib/parkingApi";

export type SlotStatus = "available" | "occupied" | "selected";

export interface Slot {
  id: number;
  status: SlotStatus;
  carId?: string;
}

interface ParkingGridProps {
  slots: Slot[];
  destination?: Destination;
  pathSlotId?: number | null;
}

const statusStyles: Record<SlotStatus, string> = {
  available:
    "bg-success/10 border-success/30 text-success hover:bg-success/15",
  occupied: "bg-destructive/10 border-destructive/30 text-destructive",
  selected:
    "bg-primary border-primary text-primary-foreground shadow-[var(--shadow-glow)] scale-105",
};

export function ParkingGrid({ slots, destination, pathSlotId }: ParkingGridProps) {
  // Compute path overlay positions (percentages within the grid container)
  const showPath = !!(destination && pathSlotId);
  const cellPctX = 100 / GRID_COLS;
  const cellPctY = 100 / GRID_ROWS;

  let pathLine: { x1: number; y1: number; x2: number; y2: number } | null = null;
  let destMarker: { left: string; top: string; side: "left" | "right" | "top" | "bottom" } | null =
    null;

  if (showPath && destination && pathSlotId) {
    const { x: sx, y: sy } = slotCoords(pathSlotId);
    const slotCx = (sx + 0.5) * cellPctX;
    const slotCy = (sy + 0.5) * cellPctY;
    // Clamp destination to edge of grid for visual marker
    const dx = Math.max(0, Math.min(GRID_COLS, destination.x + 0.5));
    const dy = Math.max(0, Math.min(GRID_ROWS, destination.y + 0.5));
    const destCx = (dx / GRID_COLS) * 100;
    const destCy = (dy / GRID_ROWS) * 100;
    pathLine = { x1: slotCx, y1: slotCy, x2: destCx, y2: destCy };

    let side: "left" | "right" | "top" | "bottom" = "right";
    if (destination.x < 0) side = "left";
    else if (destination.x >= GRID_COLS) side = "right";
    else if (destination.y < 0) side = "top";
    else side = "bottom";

    destMarker = {
      left: `${destCx}%`,
      top: `${destCy}%`,
      side,
    };
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={cn(
              "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 font-semibold transition-all duration-500 ease-out cursor-default",
              statusStyles[slot.status],
            )}
          >
            <Car className="h-5 w-5 opacity-70" />
            <span className="text-lg tabular-nums">
              {String(slot.id).padStart(2, "0")}
            </span>
            {slot.carId && (
              <span className="text-[10px] font-mono opacity-80 truncate max-w-[80%]">
                {slot.carId}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Path + destination overlay */}
      {showPath && pathLine && destMarker && (
        <>
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full animate-fade-in"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line
              x1={pathLine.x1}
              y1={pathLine.y1}
              x2={pathLine.x2}
              y2={pathLine.y2}
              stroke="hsl(var(--primary) / 1)"
              className="[stroke:var(--color-primary,theme(colors.primary))]"
              strokeWidth="0.6"
              strokeDasharray="1.5 1.2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ stroke: "var(--primary)" }}
            />
          </svg>
          <div
            className="pointer-events-none absolute z-10 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground shadow-[var(--shadow-glow)] animate-fade-in"
            style={{
              left: destMarker.left,
              top: destMarker.top,
              transform:
                destMarker.side === "left"
                  ? "translate(-110%, -50%)"
                  : destMarker.side === "right"
                    ? "translate(10%, -50%)"
                    : destMarker.side === "top"
                      ? "translate(-50%, -110%)"
                      : "translate(-50%, 10%)",
            }}
          >
            <MapPin className="h-3 w-3" />
            {destination!.label}
          </div>
        </>
      )}
    </div>
  );
}
