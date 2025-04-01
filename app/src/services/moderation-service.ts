import { supabase } from "@utils/supabase";
import { fetchTrip } from "@services/trip-service-v2";

export async function getPendingVerifications(moderatorId: string): Promise<FullTrip[]> {
  const { data: reviewData, error: reviewError } = await supabase
    .from("moderation-reviews")
    .select("trip_id")
    .eq("moderator_id", moderatorId)
    .eq("status", "pending");

  if (reviewError) {
    console.error("Error fetching moderation reviews:", reviewError);
    return [];
  }

  const tripIds = reviewData.map((review) => review.trip_id);
  if (tripIds.length === 0) return [];

  const trips = await Promise.all(
    tripIds.map(async (id) => {
      try {
        return await fetchTrip(id);
      } catch (err) {
        console.error(`Failed to fetch trip ${id}:`, err);
        return null;
      }
    }),
  );

  return trips.filter((trip): trip is FullTrip => trip !== null);
}

export async function getAllModerators() {
  const { data, error } = await supabase.from("profiles").select("id").eq("role", "moderator");

  if (error) {
    console.error("Error fetching moderators:", error);
    throw error;
  }

  console.log("Fetched moderators:", data);
  return data || [];
}

export async function addTripToModeration(tripId: string) {
  try {
    const moderators = await getAllModerators();

    if (moderators.length === 0) {
      console.warn("No moderators found. Skipping moderation insert.");
      return;
    }

    const moderationEntries = moderators.map((mod) => ({
      trip_id: tripId,
      moderator_id: mod.id,
      status: "pending",
    }));

    const { error } = await supabase.from("moderation-reviews").insert(moderationEntries);

    if (error) {
      console.error("Error inserting into moderation table:", error);
      throw error;
    }

    console.log("Trip added to moderation successfully.");
  } catch (error) {
    console.error("Error adding trip to moderation:", error);
  }
}

export async function updateModerationStatus(
  moderatorId: string,
  tripId: string,
  status: string,
): Promise<void> {
  const { error } = await supabase
    .from("moderation-reviews")
    .update({ status })
    .eq("moderator_id", moderatorId)
    .eq("trip_id", tripId);

  if (error) {
    console.error("Error updating moderation status:", error);
    throw error;
  }
}
