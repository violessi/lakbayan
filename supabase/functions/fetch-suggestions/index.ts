import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

serve(async (req) => {
  try {
    console.log("Received request:", req);
    console.log("Environment Variables:", Deno.env.toObject());
    const body = await req.text();
    console.log("Request body:", body);

    let json;
    try {
      json = JSON.parse(body);
    } catch (e) {
      console.error("Invalid JSON input:", e);
      return new Response(JSON.stringify({ error: "Invalid JSON input" }), { status: 400 });
    }

    const { query } = json;
    console.log("Parsed query:", query);

    if (!query?.trim()) {
      console.warn("Query cannot be empty");
      return new Response(JSON.stringify({ error: "Query cannot be empty" }), { status: 400 });
    }

    const GOOGLE_PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    console.log("Google API Key:", GOOGLE_API_KEY);

    if (!GOOGLE_API_KEY) {
      console.error("Missing Google API Key");
      return new Response(JSON.stringify({ error: "Missing Google API Key" }), { status: 500 });
    }

    const response = await fetch(GOOGLE_PLACES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
      },
      body: JSON.stringify({ textQuery: query }),
    });

    console.log("Google Places API response status:", response.status);

    const data = await response.json();
    console.log("Google Places API response data:", data);

    if (!data.places) {
      console.warn("No places found");
      return new Response(JSON.stringify({ suggestions: [] }), { status: 200 });
    }

    const places = data.places.map((place: any) => ({
      id: place.id,
      place_name: place.displayName.text,
      geometry: {
        coordinates: [place.location.longitude, place.location.latitude],
      },
    }));

    console.log("Suggestions:", places);

    return new Response(JSON.stringify({ suggestions: places }), { status: 200 });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
});