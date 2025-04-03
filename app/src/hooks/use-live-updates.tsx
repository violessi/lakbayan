import { useState, useEffect, useRef } from "react";
import { fetchLiveUpdatesBBox } from "@services/trip-service";

interface LiveUpdate {
  id: string;
  type: string;
  coordinate: Coordinates;
}

// This hook fetches live updates based on the camera region.
// Each time the camera moves, it fetches new live updates.
// It also sets an interval to fetch live updates for that region.
export const useLiveUpdates = (region: any, interval: number) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);

  useEffect(() => {
    const fetchLiveUpdates = async () => {
      if (!region) return;

      // Generate search bounds based on the camera region
      const bounds = region.properties.visibleBounds;
      const width = (bounds[1][0] - bounds[0][0]) * 0.5;
      const height = (bounds[1][1] - bounds[0][1]) * 0.5;
      const searchBounds = [
        [bounds[0][0] - width, bounds[0][1] - height],
        [bounds[1][0] + width, bounds[1][1] + height],
      ] as [Coordinates, Coordinates];

      // Fetch live updates based on the search bounds
      const data = await fetchLiveUpdatesBBox(searchBounds);
      setLiveUpdates(data);

      // Create an interval that continuously fetches live updates
      intervalRef.current = setInterval(async () => {
        const data = await fetchLiveUpdatesBBox(searchBounds);
        setLiveUpdates(data);
      }, interval);
    };

    fetchLiveUpdates();

    // Cleanup the interval when the component unmounts or region changes
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [region]); // The hook depends on the `region` prop

  return liveUpdates;
};
