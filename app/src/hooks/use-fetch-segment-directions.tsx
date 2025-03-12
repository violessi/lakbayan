import { useEffect, useState } from "react";
import { getDirections } from "@services/mapbox-service";

export function useFetchSegmentDirections(segmentData: Segment[]) {
  const [segmentRoutes, setSegmentRoutes] = useState<Coordinates[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllDirections() {
      setLoading(true);
      try {
        const segmentPromises = segmentData.map(async (segment, index) => {
          const { start_coords, end_coords, segment_mode } = segment;
          const waypoints = Array.isArray(segment.waypoints) ? segment.waypoints : [];

          const res = await getDirections(start_coords, waypoints, end_coords, segment_mode);
          return res?.routes?.[0]?.geometry?.coordinates || [];
        });

        const segmentRoutes = await Promise.all(segmentPromises);
        setSegmentRoutes(segmentRoutes);
      } catch (error) {
        console.error("Error fetching directions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllDirections();
  }, [segmentData]);

  return { segmentRoutes, loading };
}
