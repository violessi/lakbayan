import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

import { fetchTrip } from "@services/trip-service";

export function useUserTrips(contributorId: string) {
  const [userTrips, setUserTrips] = useState<FullTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contributorId) return;

    const fetchUserTrips = async () => {
      setLoading(true);
      try {
        // Get trip IDs for the contributor
        const { data, error: tripError } = await supabase
          .from("trips")
          .select("id")
          .eq("contributor_id", contributorId);

        if (tripError) throw tripError;

        const tripIds = data.map((t) => t.id);

        // Fetch each trip by ID
        const fetchedTrips: FullTrip[] = [];
        for (const id of tripIds) {
          try {
            const fullTrip = await fetchTrip(id);
            fetchedTrips.push(fullTrip);
          } catch (err) {
            console.warn(`Skipping invalid trip ID: ${id} - ${err}`);
          }
        }

        setUserTrips(fetchedTrips);
      } catch (err: any) {
        setError(err.message || "Failed to load user trips");
      } finally {
        setLoading(false);
      }
    };

    fetchUserTrips();
  }, [contributorId]);

  return { userTrips, loading, error };
}
