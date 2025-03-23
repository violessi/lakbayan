import { supabase } from "@utils/supabase";

export async function getUsername(contributorId: string): Promise<string | null> {
  const { data, error } = await supabase.from("profiles").select("username").eq("id", contributorId).single();

  if (error) {
    console.error("Error fetching username:", error);
    return null;
  }

  return data?.username || null;
}

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("username").eq("id", userId).single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateUserProfile(userId: string, username: string) {
  const updates = {
    id: userId,
    username,
    updated_at: new Date(),
  };

  const { error } = await supabase.from("profiles").upsert(updates);

  if (error) throw new Error(error.message);
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
