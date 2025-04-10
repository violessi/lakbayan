import { supabase } from "@utils/supabase";
import { fetchTrip } from "@services/trip-service";
import { getUsername } from "@services/account-service";

// Votes

export async function getPoints(trip: FullTrip): Promise<number> {
  return trip.upvotes - trip.downvotes;
}

export async function updateVotes(
  tripId: string,
  userId: string,
  voteType: "upvote" | "downvote" | null,
) {
  try {
    // Fetch existing vote
    const { data: existingVote, error: fetchError } = await supabase
      .from("votes")
      .select("id, vote_type")
      .eq("trip_id", tripId)
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingVote) {
      if (voteType === null) {
        // User is removing their vote
        const { error: deleteError } = await supabase
          .from("votes")
          .delete()
          .eq("id", existingVote.id);
        if (deleteError) throw deleteError;
      } else {
        // User is changing their vote
        const { error: updateError } = await supabase
          .from("votes")
          .update({ vote_type: voteType })
          .eq("id", existingVote.id);
        if (updateError) throw updateError;
      }
    } else if (voteType) {
      // User is voting for the first time
      const { error: insertError } = await supabase
        .from("votes")
        .insert({ trip_id: tripId, user_id: userId, vote_type: voteType });
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error("Error updating votes:", error);
    throw error;
  }
}

export async function getUserVote(
  tripId: string,
  userId: string | null,
): Promise<"upvote" | "downvote" | null> {
  const { data, error } = await supabase
    .from("votes")
    .select("vote_type")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user vote:", error);
    return null;
  }

  return data?.vote_type || null;
}

// Comments

export async function getComments(tripId: string): Promise<CommentData[] | null> {
  const { data, error } = await supabase
    .from("comments")
    .select("id, user_id, content, created_at, is_gps_verified")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching comments:", error);
    return null;
  }

  if (!data) return null;

  const dataWithUsername = await Promise.all(
    data.map(async (comment) => ({
      id: comment.id,
      userId: comment.user_id,
      username: (await getUsername(comment.user_id)) || "Unknown User",
      content: comment.content,
      createdAt: comment.created_at,
      isGpsVerified: comment.is_gps_verified,
    })),
  );

  return dataWithUsername;
}

export async function addComment(
  tripId: string,
  userId: string,
  content: string,
  isGpsVerified: boolean,
): Promise<boolean> {
  const { error } = await supabase.from("comments").insert([
    {
      trip_id: tripId,
      user_id: userId,
      content: content,
      is_gps_verified: isGpsVerified,
    },
  ]);

  if (error) {
    console.error("Error adding comment:", error);
    return false;
  }

  return true;
}

export async function countComments(tripId: string): Promise<number> {
  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact" })
    .eq("trip_id", tripId);

  if (error) {
    console.error("Error fetching comment count:", error);
    return 0;
  }

  return count ?? 0;
}

// Bookmarks

export async function getBookmarks(userId: string) {
  const { data, error } = await supabase.from("bookmarks").select("trip_id").eq("user_id", userId);

  if (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }

  return data.map((b) => b.trip_id);
}

export async function fetchBookmarks(userId: string): Promise<FullTrip[]> {
  try {
    const bookmarkIds = await getBookmarks(userId);
    const trips: FullTrip[] = [];

    for (const id of bookmarkIds) {
      try {
        const trip = await fetchTrip(id);
        trips.push(trip);
      } catch (err) {
        console.warn(`Skipping invalid or failed trip: ${id}`);
      }
    }

    return trips;
  } catch (error) {
    console.error("Failed to fetch bookmarks", error);
    return [];
  }
}
export async function addBookmark(userId: string, tripId: string) {
  const { error } = await supabase.from("bookmarks").insert([{ user_id: userId, trip_id: tripId }]);

  if (error) {
    console.error("Error adding bookmark:", error);
    return false;
  }

  return true;
}

export async function removeBookmark(userId: string, tripId: string) {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("trip_id", tripId);

  if (error) {
    console.error("Error removing bookmark:", error);
    return false;
  }

  return true;
}

// Moderator Verifications

export async function countModVerifications(tripId: string, type: string): Promise<number> {
  const { count, error } = await supabase
    .from("moderation_reviews")
    .select("*", { count: "exact", head: true })
    .eq("trip_toda_id", tripId)
    .eq("type", type)
    .eq("status", "verified");

  if (error) {
    console.error("Error fetching mod verifications count:", error);
    return 0;
  }

  return count || 0;
}
