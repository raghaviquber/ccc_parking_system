import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ParkingGrid, type Slot } from "@/components/ParkingGrid";
import { ControlPanel, type Algorithm } from "@/components/ControlPanel";
import {
  ComparisonCards,
  type AlgoResult,
} from "@/components/ComparisonCards";
import { ActivityLog, type LogEntry } from "@/components/ActivityLog";
import { LoadingScreen } from "@/components/LoadingScreen";
import { BackendBanner } from "@/components/BackendBanner";
import {
  parkCar,
  compareAlgorithms,
  getDestination,
  type DestinationId,
} from "@/lib/parkingApi";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ParkingSquare } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Smart Parking System — Find the Best Spot" },
      {
        name: "description",
        content:
          "A friendly parking assistant that helps you find a spot with the shortest walk to your destination.",
      },
    ],
  }),
});

const TOTAL_SLOTS = 16;

function initialSlots(): Slot[] {
  return Array.from({ length: TOTAL_SLOTS }, (_, i) => ({
    id: i + 1,
    status: i === 4 || i === 9 ? "occupied" : "available",
    carId: i === 4 ? "CAR-301" : i === 9 ? "CAR-118" : undefined,
  }));
}

function Index() {
  const [booting, setBooting] = useState(true);
  const [backend, setBackend] = useState<"checking" | "online" | "offline">("checking");
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [greedy, setGreedy] = useState<AlgoResult | null>(null);
  const [dp, setDp] = useState<AlgoResult | null>(null);
  const [loading, setLoading] = useState<"park" | "compare" | null>(null);
  const [activeDest, setActiveDest] = useState<DestinationId>("main_entrance");
  const [pathSlot, setPathSlot] = useState<number | null>(null);

  // Always reveal UI quickly so preview never stays blank
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 350);
    return () => clearTimeout(t);
  }, []);

  // Non-blocking backend health check
  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    fetch("https://smart-parking-backend-c90k.onrender.com/", {
      method: "GET",
      signal: ctrl.signal,
    })
      .then(() => setBackend("online"))
      .catch(() => setBackend("offline"))
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, []);

  const available = useMemo(
    () => slots.filter((s) => s.status === "available").map((s) => s.id),
    [slots],
  );

  const stats = useMemo(() => {
    const occ = slots.filter((s) => s.status !== "available").length;
    return { occ, total: slots.length, free: slots.length - occ };
  }, [slots]);

  const addLog = (message: string) => {
    setLogs((prev) =>
      [
        {
          id: crypto.randomUUID(),
          time: new Date().toLocaleTimeString(),
          message,
        },
        ...prev,
      ].slice(0, 50),
    );
  };

  const handlePark = async (
    carId: string,
    algorithm: Algorithm,
    destination: DestinationId,
  ) => {
    setLoading("park");
    setActiveDest(destination);
    try {
      const res = await parkCar(carId, algorithm, available, destination);
      setPathSlot(res.slot);
      // Brief "selected" highlight, then mark occupied
      setSlots((prev) =>
        prev.map((s) =>
          s.id === res.slot ? { ...s, status: "selected", carId } : s,
        ),
      );
      setTimeout(() => {
        setSlots((prev) =>
          prev.map((s) =>
            s.id === res.slot ? { ...s, status: "occupied", carId } : s,
          ),
        );
      }, 900);
      const algoName =
        algorithm === "greedy" ? "Quick Parking" : "Smart Parking";
      const destLabel = getDestination(destination).label;
      addLog(
        `Car ${carId} parked in Slot ${res.slot} near ${destLabel} using ${algoName}`,
      );
      toast.success(`Parked in Slot #${String(res.slot).padStart(2, "0")}`, {
        description: `${algoName} • ${res.distance.toFixed(1)}m walk to ${destLabel}`,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to park");
    } finally {
      setLoading(null);
    }
  };

  const handleCompare = async (carId: string, destination: DestinationId) => {
    setLoading("compare");
    setActiveDest(destination);
    try {
      const res = await compareAlgorithms(carId, available, destination);
      setGreedy(res.greedy);
      setDp(res.dp);
      // Show the better (smart) slot path on the grid
      setPathSlot(res.dp.slot);
      const destLabel = getDestination(destination).label;
      addLog(
        `Compared options for ${carId} → ${destLabel}: Quick → Slot ${res.greedy.slot} (${res.greedy.distance.toFixed(1)}m), Smart → Slot ${res.dp.slot} (${res.dp.distance.toFixed(1)}m)`,
      );
      toast.success("Comparison complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Compare failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      {booting && <LoadingScreen message="Starting Smart Parking…" />}
      <Toaster position="top-right" richColors />

      <BackendBanner status={backend} />

      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
              <ParkingSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                Smart Parking System
              </h1>
              <p className="text-xs text-muted-foreground">
                Find the best spot with the shortest walk
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm">
            <Stat label="Available" value={stats.free} tone="success" />
            <Stat label="Occupied" value={stats.occ} tone="destructive" />
            <Stat label="Total" value={stats.total} tone="muted" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Top section: Grid + Control */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-lg">Parking Lot</h2>
                <p className="text-sm text-muted-foreground">
                  Live slot status — destination:{" "}
                  <span className="font-medium text-foreground">
                    {getDestination(activeDest).label}
                  </span>
                </p>
              </div>
              <Legend />
            </div>
            <ParkingGrid
              slots={slots}
              destination={getDestination(activeDest)}
              pathSlotId={pathSlot}
            />
          </section>

          <aside className="rounded-2xl border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)] h-fit">
            <h2 className="font-semibold text-lg mb-1">Control Panel</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Tell us where you're going — we'll handle the rest.
            </p>
            <ControlPanel
              onPark={handlePark}
              onCompare={handleCompare}
              loading={loading}
            />
          </aside>
        </div>

        {/* Comparison */}
        <section>
          <div className="mb-4">
            <h2 className="font-semibold text-lg">Parking Options</h2>
            <p className="text-sm text-muted-foreground">
              See which approach gets you closer to your destination
            </p>
          </div>
          <ComparisonCards greedy={greedy} dp={dp} />
        </section>

        {/* Activity */}
        <ActivityLog entries={logs} />
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "destructive" | "muted";
}) {
  const dot =
    tone === "success"
      ? "bg-success"
      : tone === "destructive"
        ? "bg-destructive"
        : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function Legend() {
  const items = [
    { label: "Available", className: "bg-success" },
    { label: "Occupied", className: "bg-destructive" },
    { label: "Assigned", className: "bg-primary" },
  ];
  return (
    <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-sm ${i.className}`} />
          {i.label}
        </div>
      ))}
    </div>
  );
}

