import { supabase } from "@utils/supabase";

export async function getPoints(tripId: string): Promise<number | null> {
  const { data, error } = await supabase.from("trips").select("upvotes, downvotes").eq("id", tripId).single();

  if (error) {
    console.error("Error fetching points:", error);
    return null;
  }

  const upvotes = data?.upvotes || 0;
  const downvotes = data?.downvotes || 0;

  return upvotes - downvotes;
}

export async function updateVotes(tripId: string, upvotes: number, downvotes: number) {
  try {
    const { error } = await supabase.from("trips").update({ upvotes, downvotes }).eq("id", tripId);
    if (error) throw error;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating votes:", error.message);
    } else {
      console.error("Unexpected error updating votes:", error);
    }
    throw error;
  }
}
