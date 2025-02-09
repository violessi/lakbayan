import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export function useTripData(tripId: string) {
  const [tripData, setTripData] = useState<Trip | null>(null);
  const [segmentData, setSegmentData] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const { data: trip, error: tripError } = await supabase
          .from("trips")
          .select(
            `id, contributor_id, name, start_location, start_coords, end_location, end_coords, gps_verified, mod_verified`,
          )
          .eq("id", tripId)
          .single();

        if (tripError) throw tripError;

        setTripData(trip);
        console.log("Trip data:", trip);

        const { data: segments, error: segmentsError } = await supabase
          .from("segments-to-trips")
          .select(
            `
            segment_order,
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
          .eq("trip_id", tripId)
          .order("segment_order", { ascending: true });

        if (segmentsError) throw segmentsError;

        const parsedSegments = segments
          .map((item) => {
            const segment = item["trip-segments"];

            // ✅ Ensure waypoints is properly parsed
            let parsedWaypoints: number[][] = [];
            try {
              parsedWaypoints = segment.waypoints ? JSON.parse(segment.waypoints) : [];
            } catch (err) {
              console.error("Error parsing waypoints:", err);
            }

            return {
              ...segment,
              segment_order: item.segment_order,
              waypoints: Array.isArray(parsedWaypoints) ? parsedWaypoints : [],
            };
          })
          .sort((a, b) => a.segment_order - b.segment_order);

        setSegmentData(parsedSegments);
        console.log("Segment data:", parsedSegments);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching trip:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [tripId]);

  return { tripData, segmentData, loading, error };
}
