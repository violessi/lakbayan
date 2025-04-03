import { useState, useEffect, useRef } from "react";
import { expandBoundingBox } from "@utils/map-utils";
import { fetchLiveUpdatesBBox, fetchLiveUpdatesLine } from "@services/trip-service";

// This hook fetches live updates based on the camera region.
// Each time the camera moves, it fetches new live updates.
// It also sets an interval to fetch live updates for that region.
export const useLiveUpdates = (type: "box" | "line", interval: number) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [coordinates, setUpdateCoords] = useState<Coordinates[] | null>(null);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);

  useEffect(() => {
    const fetchLiveUpdates = async () => {
      if (!coordinates) return;

      if (type === "box") {
        // Generate search bounds based on the camera region
        const searchBounds = expandBoundingBox(coordinates, 0.5);

        // Fetch live updates based on the search bounds
        const data = await fetchLiveUpdatesBBox(searchBounds);
        setLiveUpdates(data);

        // Create an interval that continuously fetches live updates
        intervalRef.current = setInterval(async () => {
          const data = await fetchLiveUpdatesBBox(searchBounds);
          setLiveUpdates(data);
        }, interval * 1000);
      }

      if (type === "line") {
        // Fetch live updates based on the line coordinates
        const data = await fetchLiveUpdatesLine(coordinates, interval);
        setLiveUpdates(data);

        // Create an interval that continuously fetches live updates
        intervalRef.current = setInterval(async () => {
          const data = await fetchLiveUpdatesLine(coordinates, interval);
          setLiveUpdates(data);
        }, interval * 1000);
      }
    };

    fetchLiveUpdates();

    return () => {
      // Cleanup when the component unmounts or coordinate changes
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [coordinates]);

  return { liveUpdates, setUpdateCoords };
};
