import { supabase } from "@utils/supabase";
import { fetchTrip } from "@services/trip-service-v2";

import { z } from "zod";
import { fetchStops } from "./toda-stop-service";

export const ModerationReviewSchema = z.object({
  id: z.string(),
  tripTodaId: z.string(),
  moderatorId: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  type: z.enum(["trip", "toda"]),
});

export type ModerationReview = z.infer<typeof ModerationReviewSchema>;

export async function getPendingTripVerifications(moderatorId: string): Promise<FullTrip[]> {
  const { data: reviewData, error: reviewError } = await supabase
    .from("moderation-reviews")
    .select("trip_toda_id")
    .eq("moderator_id", moderatorId)
    .eq("status", "pending")
    .eq("type", "trip");

  if (reviewError) {
    console.error("Error fetching moderation reviews:", reviewError);
    return [];
  }

  const tripIds = reviewData.map((review) => review.trip_toda_id);
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

export async function getPendingTodaVerifications(moderatorId: string): Promise<StopData[]> {
  const { data: reviewData, error: reviewError } = await supabase
    .from("moderation-reviews")
    .select("trip_toda_id")
    .eq("moderator_id", moderatorId)
    .eq("status", "pending")
    .eq("type", "toda");

  if (reviewError) {
    console.error("Error fetching moderation reviews:", reviewError);
    return [];
  }

  const todaIds = reviewData.map((review) => review.trip_toda_id);
  if (todaIds.length === 0) return [];

  const todas = await fetchStops(todaIds);
  return todas;
}

export async function getAllModerators(): Promise<{ id: string }[]> {
  const { data, error } = await supabase.from("profiles").select("id").eq("role", "moderator");

  if (error) {
    console.error("Error fetching moderators:", error);
    throw error;
  }

  console.log("Fetched moderators:", data);
  return data || [];
}

export async function addToPendingModeratorReview(tripId: string, type: string): Promise<void> {
  try {
    const moderators = await getAllModerators();

    if (moderators.length === 0) {
      console.warn("No moderators found. Skipping moderation insert.");
      return;
    }

    const moderationEntries = moderators.map((mod) => ({
      trip_toda_id: tripId,
      moderator_id: mod.id,
      status: "pending",
      type,
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
    .eq("trip_toda_id", tripId);

  if (error) {
    console.error("Error updating moderation status:", error);
    throw error;
  }
}
