import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Car, GitCompare, Info, MapPin, Loader2 } from "lucide-react";
import { DESTINATIONS, type DestinationId } from "@/lib/parkingApi";

export type Algorithm = "greedy" | "dp";

interface ControlPanelProps {
  onPark: (carId: string, algorithm: Algorithm, destination: DestinationId) => void | Promise<void>;
  onCompare: (carId: string, destination: DestinationId) => void | Promise<void>;
  loading?: "park" | "compare" | null;
}

export function ControlPanel({ onPark, onCompare, loading }: ControlPanelProps) {
  const [carId, setCarId] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("greedy");
  const [destination, setDestination] = useState<DestinationId>("main_entrance");

  const handlePark = () => {
    if (!carId.trim() || loading) return;
    onPark(carId.trim(), algorithm, destination);
    setCarId("");
  };

  const handleCompare = () => {
    if (loading) return;
    onCompare(carId.trim() || "TEST-CAR", destination);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="car-id" className="text-sm font-medium">
          Car ID
        </Label>
        <Input
          id="car-id"
          placeholder="e.g. CAR-1234"
          value={carId}
          onChange={(e) => setCarId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePark()}
          className="h-11"
        />
      </div>

      <TooltipProvider delayDuration={150}>
        <div className="space-y-2">
          <Label htmlFor="dest" className="text-sm font-medium">
            Select Your Destination
          </Label>
          <Select
            value={destination}
            onValueChange={(v) => setDestination(v as DestinationId)}
          >
            <SelectTrigger id="dest" className="h-11">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DESTINATIONS.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose where you want to go so we can assign the best parking spot.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="algo" className="text-sm font-medium">
            Parking Mode
          </Label>
          <Select
            value={algorithm}
            onValueChange={(v) => setAlgorithm(v as Algorithm)}
          >
            <SelectTrigger id="algo" className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectItem value="greedy">
                    Quick Parking (Nearest Slot)
                  </SelectItem>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Parks your car in the nearest available spot quickly.
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectItem value="dp">
                    Smart Parking (Less Walking)
                  </SelectItem>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Finds a parking spot that reduces your walking distance to your destination.
                </TooltipContent>
              </Tooltip>
            </SelectContent>
          </Select>
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground pt-1">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              {algorithm === "greedy"
                ? "Quick Parking is faster but may require more walking."
                : "Smart Parking reduces your walking distance to your destination."}
            </span>
          </div>
        </div>
      </TooltipProvider>

      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={handlePark}
          className="h-11 w-full"
          size="lg"
          disabled={loading === "park"}
        >
          {loading === "park" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Car className="h-4 w-4" />
          )}
          Park Car
        </Button>
        <Button
          onClick={handleCompare}
          variant="outline"
          className="h-11 w-full"
          size="lg"
          disabled={loading === "compare"}
        >
          {loading === "compare" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GitCompare className="h-4 w-4" />
          )}
          Compare Options
        </Button>
      </div>
    </div>
  );
}
