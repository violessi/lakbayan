import { supabase, supabaseUrl } from "./supabase";

export async function getMapboxKey(): Promise<string | null> {
  console.log("Fetching Mapbox key...");
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/get-mapbox-key`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { key } = await response.json();
    return key ?? null;
  } catch (err) {
    console.error("Failed to fetch Mapbox key:", err);
    return null;
  }
}
