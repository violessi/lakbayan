import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";

export async function fetchSuggestions(query: string): Promise<any[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
    );
    const data = await response.json();

    if (data.features) {
      return data.features;
    }

    return [];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}
