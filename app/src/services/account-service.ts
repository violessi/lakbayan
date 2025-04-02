import { supabase } from "@utils/supabase";

export async function createUserProfile(userId: string, username: string, isCommuter: boolean) {
  const { error } = await supabase.from("profiles").upsert([
    {
      id: userId,
      username,
      is_commuter: isCommuter,
      updated_at: new Date(),
    },
  ]);

  if (error) {
    console.error("Profile insert error:", error);
    throw new Error(error.message);
  }
}

export async function getUsername(contributorId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", contributorId)
    .single();

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

export async function getUserPoints(userId: string) {
  const { data, error } = await supabase.rpc("get_user_points", {
    uid: userId,
  });

  if (error) {
    console.error("Failed to fetch points", error);
    return null;
  }

  return data.totalPoints || 0;
}

export async function getUserJoinedDate(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user details:", error);
  }

  return data?.created_at
    ? new Date(data.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
}

export async function updateUsername(userId: string, username: string): Promise<void> {
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

export async function checkUsernameExists(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return !!data;
}
