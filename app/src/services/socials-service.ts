import { supabase } from "@utils/supabase";

export async function getPoints(tripId: string): Promise<number> {
  const { data, error } = await supabase.from("votes").select("vote_type", { count: "exact" }).eq("trip_id", tripId);

  if (error) throw error;

  const upvotes = data.filter((vote) => vote.vote_type === "upvote").length;
  const downvotes = data.filter((vote) => vote.vote_type === "downvote").length;

  return upvotes - downvotes;
}

export async function updateVotes(tripId: string, userId: string, voteType: "upvote" | "downvote" | null) {
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
        const { error: deleteError } = await supabase.from("votes").delete().eq("id", existingVote.id);
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

export async function getUserVote(tripId: string, userId: string | null): Promise<"upvote" | "downvote" | null> {
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
