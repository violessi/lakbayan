import { useState, useEffect } from "react";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  countModVerifications,
  countGpsVerifications,
  countComments,
} from "@services/socials-service";

export function useTripPreviewData(userId: string | null, trip: FullTrip) {
  const [bookmarked, setBookmarked] = useState(false);
  const [modVerifications, setModVerifications] = useState(0);
  const [gpsVerifications, setGpsVerifications] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!userId) return;

      setLoading(true);

      const segmentIds = trip.segments
        .filter((seg) => !seg.id.startsWith("walk-"))
        .map((seg) => seg.id);

      const [bookmarks, modCount, gpsCount, commentCountTemp] = await Promise.all([
        getBookmarks(userId),
        countModVerifications(trip.id, "trip"),
        countGpsVerifications(segmentIds),
        countComments(trip.id),
      ]);

      setBookmarked(bookmarks.includes(trip.id));
      setModVerifications(modCount);
      setGpsVerifications(gpsCount);
      setCommentCount(commentCountTemp);
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
    modVerifications,
    gpsVerifications,
    commentCount,
    toggleBookmark,
  };
}
