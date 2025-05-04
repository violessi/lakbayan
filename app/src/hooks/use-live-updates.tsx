import { useEffect, useRef } from "react";
import { debounce } from "lodash";
import { expandBoundingBox } from "@utils/map-utils";
import {
  fetchLiveUpdatesBBox,
  fetchLiveUpdatesHistory,
  fetchLiveUpdatesLine,
} from "@services/trip-service";
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
      const data = await fetchLiveUpdatesLine(coordinates, 20);
      symbolRef.current?.update(data);
    }
  };

  const fetchHistory = async (coordinates: Coordinates[], set: ({}) => void) => {
    const res = await fetchLiveUpdatesHistory(coordinates, 20);
    set(res);
  };

  // This function is used to update the live status
  // Debounce to prevent excessive calls when user is panning the map
  const updateLiveStatus = debounce(async (newCoordinates: Coordinates[]) => {
    clearExistingInterval();
    if (!newCoordinates.length) return;
    await fetchAndUpdate(newCoordinates);
    intervalRef.current = setInterval(async () => {
      await fetchAndUpdate(newCoordinates);
    }, interval * 1000);
  }, 2000);

  useEffect(() => {
    return () => {
      clearExistingInterval();
      updateLiveStatus.cancel();
    };
  }, []);

  return { symbolRef, updateLiveStatus, fetchHistory };
};
