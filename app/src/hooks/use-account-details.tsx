import { useEffect, useState } from "react";
import { getUserRole, getUserPoints, getUserJoinedDate } from "@services/account-service";

export interface AccountDetails {
  userRole: string;
  points: number;
  joinedDate: string | null;
  loading: boolean;
}

export function useAccountDetails(userId: string | undefined): AccountDetails {
  const [userRole, setUserRole] = useState<string>("Commuter");
  const [points, setPoints] = useState<number>(0);
  const [joinedDate, setJoinedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUserDetails() {
      if (userId) {
        setLoading(true);
        const [fetchedRole, fetchedPoints, fetchedJoinedDate] = await Promise.all([
          getUserRole(userId),
          getUserPoints(userId),
          getUserJoinedDate(userId),
        ]);
        setUserRole(fetchedRole || "Unknown user");
        setPoints(fetchedPoints);
        setJoinedDate(fetchedJoinedDate);
      }
      setLoading(false);
    }
    fetchUserDetails();
  }, [userId]);

  return { userRole, points, joinedDate, loading };
}
