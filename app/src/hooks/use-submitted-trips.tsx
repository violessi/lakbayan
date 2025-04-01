import { useEffect, useState } from "react";
import { useUserTrips } from "@hooks/use-trip-data";

export function useSubmittedTrips(userId: string | null) {
  const { userTrips, loading: tripsLoading } = useUserTrips(userId || "");
  const [loading, setLoading] = useState(true);
  const [submittedTrips, setSubmittedTrips] = useState<TripSearch[]>([]);

  useEffect(() => {
    if (!userId || tripsLoading) return;

    setLoading(true);

    const preparedTrips: TripSearch[] = userTrips.map((trip) => ({
      ...trip,
      preSegment: null,
      postSegment: null,
    }));

    setSubmittedTrips(preparedTrips);
    setLoading(false);
  }, [userId, userTrips, tripsLoading]);

  return {
    submittedTrips,
    loading,
  };
}
