import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export function useTripData() {
  const [tripData, setTripData] = useState<Trip[]>([]);
  const [segmentData, setSegmentData] = useState<Record<string, Segment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const { data: trips, error: tripError } = await supabase
          .from("trips")
          .select(
            `id, contributor_id, name, start_location, start_coords, end_location, end_coords, gps_verified, mod_verified`,
          );

        if (tripError) throw tripError;
        setTripData(trips);
        console.log("Trips data:", trips);

        // Fetch all segments related to these trips
        const { data: segments, error: segmentsError } = await supabase
          .from("segments-to-trips")
          .select(
            `
            segment_order,
            trip_id,
            trip-segments (
              id,
              segment_mode,
              segment_name,
              landmark,
              instruction,
              waypoints,
              duration,
              start_location,
              start_coords,
              end_location,
              end_coords,
              cost
            )
          `,
          )
          .order("segment_order", { ascending: true });

        if (segmentsError) throw segmentsError;

        // Process segments and group them by trip_id
        const segmentMap: Record<string, Segment[]> = {};
        segments.forEach((item) => {
          const segment = item["trip-segments"];

          // ✅ Ensure waypoints are properly parsed
          let parsedWaypoints: number[][] = [];
          try {
            parsedWaypoints = segment.waypoints ? JSON.parse(segment.waypoints) : [];
          } catch (err) {
            console.error("Error parsing waypoints:", err);
          }

          if (!segmentMap[item.trip_id]) segmentMap[item.trip_id] = [];

          segmentMap[item.trip_id].push({
            ...segment,
            segment_order: item.segment_order,
            waypoints: Array.isArray(parsedWaypoints) ? parsedWaypoints : [],
          });
        });

        setSegmentData(segmentMap);
        console.log("Segment data:", segmentMap);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching trips:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, []);

  return { tripData, segmentData, loading, error };
}
