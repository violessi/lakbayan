import { supabase } from "@utils/supabase";

export async function getUsername(contributorId: string): Promise<string | null> {
  const { data, error } = await supabase.from("profiles").select("username").eq("id", contributorId).single();

  if (error) {
    console.error("Error fetching username:", error);
    return null;
  }

  return data?.username || null;
}
