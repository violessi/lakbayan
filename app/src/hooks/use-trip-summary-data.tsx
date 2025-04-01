import { useEffect, useState } from "react";

import { getUsername } from "@services/account-service";
import { getPoints } from "@services/socials-service";

export function useTripSummaryData(contributorId: string, tripId: string) {
  const [contributor, setContributor] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [username, pts] = await Promise.all([getUsername(contributorId), getPoints(tripId)]);
        setContributor(username);
        setPoints(pts || 0);
      } catch {
        setContributor(null);
        setPoints(0);
      }
    }

    if (contributorId && tripId) {
      fetchData();
    }
  }, [contributorId, tripId]);

  return { contributor, points };
}
