import { useEffect, useState } from "react";

import { fetchLatestTransitJournals, fetchTrip } from "@services/trip-service";

export function useRecentTrips(userId: string | null) {
  const [recentJournals, setRecentJournals] = useState<TransitJournal[]>([]);
  const [tripData, setTripData] = useState<Record<string, FullTrip>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentJournals() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const journals = await fetchLatestTransitJournals(userId);
        const trips: Record<string, FullTrip> = {};
        for (const journal of journals) {
          try {
            const trip = await fetchTrip(journal.tripId);
            trips[journal.id] = trip;
          } catch (error) {
            console.error("Error fetching trip for journal", journal.id);
          }
        }
        setRecentJournals(journals);
        setTripData(trips);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRecentJournals();
  }, [userId]);

  return { recentJournals, tripData, loading };
}
