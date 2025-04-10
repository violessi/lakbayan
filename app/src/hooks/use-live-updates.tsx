import { useEffect, useRef } from "react";
import { debounce } from "lodash";
import { expandBoundingBox } from "@utils/map-utils";
import { fetchLiveUpdatesBBox, fetchLiveUpdatesLine } from "@services/trip-service";
import { type SymbolSourceRef } from "@components/map/SymbolSource";

export const useLiveUpdates = (type: "box" | "line", interval: number) => {
  const symbolRef = useRef<SymbolSourceRef | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // This function clears the existing interval if it exists
  const clearExistingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // This function fetches live updates based on the type and coordinates
  const fetchAndUpdate = async (coordinates: Coordinates[]) => {
    if (type === "box") {
      const searchBounds = expandBoundingBox(coordinates, 0.5);
      const data = await fetchLiveUpdatesBBox(searchBounds);
      symbolRef.current?.update(data);
    } else if (type === "line") {
      const data = await fetchLiveUpdatesLine(coordinates, 100);
      symbolRef.current?.update(data);
    }
  };

  // This function is used to update the live status
  // Debounce to prevent excessive calls when user is panning the map
  const updateLiveStatus = debounce(async (newCoordinates: Coordinates[]) => {
    clearExistingInterval();
    if (!newCoordinates.length) return;
    console.log(`[LIVE UPDATES][${type}] Fetching initial updates...`);
    await fetchAndUpdate(newCoordinates);
    intervalRef.current = setInterval(async () => {
      console.log(`[LIVE UPDATES][${type}] Fetching live updates...`);
      await fetchAndUpdate(newCoordinates);
    }, interval * 1000);
  }, 2000);

  useEffect(() => {
    return () => {
      clearExistingInterval();
      updateLiveStatus.cancel();
    };
  }, []);

  return { symbolRef, updateLiveStatus };
};
