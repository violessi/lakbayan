import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

import { supabaseUrl } from "@utils/supabase";

const BASE_URL = "https://api.mapbox.com";

export async function fetchSuggestions(query: string): Promise<any[]> {
  if (!query.trim()) {
    return [];
  }

  const SUPABASE_EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1/fetch-suggestions`;

  try {
    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error("Error fet:", error);
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
  console.log("Directions response:", responseJSON);
  const directions: MapboxDirectionsResponse = { routes: responseJSON.routes, waypoints: responseJSON.waypoints };
  return directions;
}

export async function getDistanceDuration(start: Coordinates, end: Coordinates) {
  const coordinates = [`${start[0]},${start[1]}`, `${end[0]},${end[1]}`].join(";");

  const response = await fetch(
    `${BASE_URL}/directions/v5/mapbox/walking/${encodeURIComponent(coordinates)}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`,
  );

  const responseJSON = await response.json();
  console.log("Directions response:", responseJSON);
  const walkingInfo = { distance: responseJSON.routes[0].distance, duration: responseJSON.routes[0].duration };
  return walkingInfo;
}

export async function reverseGeocode(coordinates: Coordinates) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${MAPBOX_ACCESS_TOKEN}`,
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    } else {
      return "Unnamed Location";
    }
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return "Unnamed Location";
  }
}
