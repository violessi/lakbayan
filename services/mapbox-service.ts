import { Coordinates } from "@/types/location-types";

import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";

const BASE_URL = "https://api.mapbox.com";

export async function fetchSuggestions(query: string): Promise<any[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`,
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

export async function getDirections(start: Coordinates, end: Coordinates) {
  const mode = "walking";
  const startCoordinates = `${start[0]},${start[1]}`;
  const endCoordinates = `${end[0]},${end[1]}`;
  const response = await fetch(
    `${BASE_URL}/directions/v5/mapbox/${mode}/${encodeURIComponent(startCoordinates)};${encodeURIComponent(
      endCoordinates,
    )}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`,
  );
  const directions = await response.json();
  console.log(directions);
  return directions;
}
