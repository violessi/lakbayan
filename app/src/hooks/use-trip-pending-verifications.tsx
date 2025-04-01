import { useState, useCallback } from "react";
import { getPendingVerifications } from "@services/moderation-service";

export function useTripPendingVerifications(userId: string | null) {
  const [pendingTrips, setPendingTrips] = useState<FullTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const trips = await getPendingVerifications(userId);
      setPendingTrips(trips);
    } catch (error) {
      console.error("Failed to fetch pending verifications:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    pendingTrips,
    loading,
    refetch: fetchTrips,
  };
}
