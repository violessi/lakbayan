import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

const BASE_URL = "https://api.mapbox.com";
const GOOGLE_PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

export async function fetchSuggestions(query: string): Promise<any[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(GOOGLE_PLACES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
      },
      body: JSON.stringify({
        textQuery: query,
      }),
    });
    const data = await response.json();

    if (data.places) {
      console.log("Suggestions:", data.places);
      const places = data.places.map((place: any) => ({
        id: place.id,
        place_name: place.displayName.text,
        geometry: {
          coordinates: [place.location.longitude, place.location.latitude],
        },
      }));
      return places;
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
