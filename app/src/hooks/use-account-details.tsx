import { useEffect, useState } from "react";
import {
  getUsername,
  getUserRole,
  getUserPoints,
  getUserJoinedDate,
} from "@services/account-service";

export interface AccountDetails {
  username: string;
  userRole: string;
  points: number;
  joinedDate: string | null;
  loading: boolean;
}

export function useAccountDetails(userId: string | undefined): AccountDetails {
  const [username, setUsername] = useState<string>("Unknown user");
  const [userRole, setUserRole] = useState<string>("Commuter");
  const [points, setPoints] = useState<number>(0);
  const [joinedDate, setJoinedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUserDetails() {
      if (userId) {
        setLoading(true);
        const [fetchedRole, fetchedUsername, fetchedPoints, fetchedJoinedDate] = await Promise.all([
          getUserRole(userId),
          getUsername(userId),
          getUserPoints(userId),
          getUserJoinedDate(userId),
        ]);
        setUserRole(fetchedRole || "Unknown user");
        setUsername(fetchedUsername || "Commuter");
        setPoints(fetchedPoints);
        setJoinedDate(fetchedJoinedDate);
      }
      setLoading(false);
    }
    fetchUserDetails();
  }, [userId]);

  return { username, userRole, points, joinedDate, loading };
}
