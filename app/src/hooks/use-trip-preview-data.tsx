import { useState, useEffect } from "react";
import { getBookmarks, addBookmark, removeBookmark } from "@services/socials-service";

export function useTripPreviewData(userId: string | null, trip: FullTrip) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!userId) return;

      setLoading(true);

      const [bookmarks] = await Promise.all([getBookmarks(userId)]);

      setBookmarked(bookmarks.includes(trip.id));

      setLoading(false);
    }

    fetchData();
  }, [userId, trip]);

  const toggleBookmark = async () => {
    if (!userId) return;

    if (bookmarked) {
      await removeBookmark(userId, trip.id);
    } else {
      await addBookmark(userId, trip.id);
    }
    setBookmarked(!bookmarked);
  };

  return {
    loading,
    bookmarked,
    toggleBookmark,
  };
}
