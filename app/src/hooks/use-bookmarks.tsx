import { useEffect, useState } from "react";
import { fetchBookmarks } from "@services/socials-service";

export function useBookmarks(userId: string | null) {
  const [bookmarks, setBookmarks] = useState<FullTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!userId) return;

      try {
        const data = await fetchBookmarks(userId);
        setBookmarks(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, [userId]);

  return { bookmarks, loading, error };
}
