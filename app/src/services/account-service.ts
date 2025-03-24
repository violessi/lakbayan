import { supabase } from "@utils/supabase";

export async function getUsername(contributorId: string): Promise<string | null> {
  const { data, error } = await supabase.from("profiles").select("username").eq("id", contributorId).single();

  if (error) {
    console.error("Error fetching username:", error);
    return null;
  }

  return data?.username || null;
}

export async function getUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single();

  if (error) {
    console.error("Error fetching user role:", error);
    return null;
  }

  return data?.role || null;
}

export async function getUserDetails(userId: string) {
  const { data, error } = await supabase.from("profiles").select("points, created_at").eq("id", userId).single();

  if (error) {
    console.error("Error fetching user details:", error);
    return { points: 0, joinedDate: "" };
  }

  return {
    points: data?.points || 0,
    joinedDate: data?.created_at
      ? new Date(data.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "",
  };
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
