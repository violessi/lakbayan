import { Coordinates, MapboxDirectionsResponse } from "@/types/location-types";

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

export async function getDirections(
  start: Coordinates,
  waypoints: Coordinates[],
  end: Coordinates,
  transportationMode: string,
): Promise<MapboxDirectionsResponse> {
  let mode = "driving";
  if (transportationMode === "Walk") {
    mode = "walking";
  }

  const coordinates = [
    `${start[0]},${start[1]}`,
    ...waypoints.map((point) => `${point[0]},${point[1]}`),
    `${end[0]},${end[1]}`,
  ].join(";");

  console.log(
    `${BASE_URL}/directions/v5/mapbox/${mode}/${encodeURIComponent(coordinates)}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`,
  );
  const response = await fetch(
    `${BASE_URL}/directions/v5/mapbox/${mode}/${encodeURIComponent(coordinates)}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`,
  );

  const responseJSON = await response.json();
  const directions: MapboxDirectionsResponse = { routes: responseJSON.routes, waypoints: responseJSON.waypoints };
  return directions;
}
