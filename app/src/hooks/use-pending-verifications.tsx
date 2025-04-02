import { useState, useCallback } from "react";
import {
  getPendingTripVerifications,
  getPendingTodaVerifications,
} from "@services/moderation-service";

export function usePendingVerifications(userId: string | null) {
  const [pendingTrips, setPendingTrips] = useState<FullTrip[]>([]);
  const [pendingTodas, setPendingTODA] = useState<StopData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [trips, todas] = await Promise.all([
        getPendingTripVerifications(userId),
        getPendingTodaVerifications(userId),
      ]);
      setPendingTrips(trips);
      setPendingTODA(todas);
    } catch (error) {
      console.error("Failed to fetch pending verifications:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    pendingTrips,
    pendingTodas,
    loading,
    refetch: fetchPending,
  };
}
