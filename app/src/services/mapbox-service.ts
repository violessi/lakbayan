import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

import { supabaseUrl } from "@utils/supabase";

const BASE_URL = "https://api.mapbox.com";

let debounceTimer: NodeJS.Timeout;

export async function fetchSuggestions(query: string): Promise<any[]> {
  return new Promise((resolve) => {
    // Add debounce to limit the number of API calls, wait for keystrokes to stop
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      if (!query.trim()) {
        resolve([]);
        return;
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
        resolve(data.suggestions || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        resolve([]);
      }
    }, 100); // Debounce delay
  });
}

export async function getDirections(
  start: Coordinates,
  waypoints: Coordinates[],
  end: Coordinates,
  transportationMode: string,
  includeSteps: boolean = false, // Default: false
): Promise<{ routes: MapboxDirectionsResponse["routes"]; waypoints: any; steps?: string[] }> {
  let mode = transportationMode === "Walk" ? "walking" : "driving"; // Mapbox only supports specific modes
  const coordinates = [
    `${start[0]},${start[1]}`,
    ...waypoints.map((point) => `${point[0]},${point[1]}`),
    `${end[0]},${end[1]}`,
  ].join(";");

  const response = await fetch(
    `${BASE_URL}/directions/v5/mapbox/${mode}/${encodeURIComponent(coordinates)}?alternatives=true&geometries=geojson&language=en&overview=full&steps=${includeSteps}&access_token=${MAPBOX_ACCESS_TOKEN}`,
  );

  const responseJSON = await response.json();
  console.log("Directions response:", responseJSON);

  return { routes: responseJSON.routes, waypoints: responseJSON.waypoints };
}

export function paraphraseStep(instruction: string): string {
  // Normalize input for case-insensitive matching
  const lowercased = instruction.toLowerCase();

  // Replace turn-based instructions with general commuting steps
  if (lowercased.includes("turn right") || lowercased.includes("turn left")) {
    return "Follow the route ahead.";
  }
  if (lowercased.includes("make a u-turn")) {
    return "Stay on the same road.";
  }
  // if (
  //   lowercased.includes("your destination is on the right") ||
  //   lowercased.includes("your destination is on the left")
  // ) {
  //   return "You have arrived at your stop.";
  // }
  if (lowercased.includes("enter") || lowercased.includes("take the exit")) {
    return "Proceed to the next stop.";
  }
  if (lowercased.includes("head") || lowercased.includes("drive")) {
    return "Continue traveling along the route.";
  }
  if (lowercased.includes("stay on")) {
    return "Remain on the current route.";
  }

  return instruction; // Fallback if no match
}

export async function getDistanceDuration(start: Coordinates, end: Coordinates) {
  const coordinates = [`${start[0]},${start[1]}`, `${end[0]},${end[1]}`].join(";");

  const response = await fetch(
    `${BASE_URL}/directions/v5/mapbox/walking/${encodeURIComponent(coordinates)}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`,
  );

  const responseJSON = await response.json();
  console.log("Directions response:", responseJSON);
  const walkingInfo = {
    distance: responseJSON.routes[0].distance,
    duration: responseJSON.routes[0].duration,
  };
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
