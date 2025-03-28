import { supabase } from "@utils/supabase";
import {
  convertKeysToSnakeCase,
  convertKeysToCamelCase,
  convertToPointWKT,
  convertToMultiPointWKT,
} from "@utils/map-utils";

// Function to insert a trip into the database
export async function insertTrip(trip: CreateTrip): Promise<Trip[]> {
  try {
    const payload = convertKeysToSnakeCase(trip);
    payload.start_coords = convertToPointWKT(payload.start_coords as Coordinates);
    payload.end_coords = convertToPointWKT(payload.end_coords as Coordinates);

    console.log("Inserting trip:", payload);
    const { data, error } = await supabase.from("trips_v2").insert([payload]).select();
    if (error) throw new Error(`Error inserting trip: ${error.message}`);

    return data.map((trip) => convertKeysToCamelCase(trip)) as Trip[];
  } catch (error) {
    throw new Error(`Error inserting trip: ${error}`);
  }
}

// Function to insert multiple segments into the database
export async function insertSegments(segments: CreateSegment[]): Promise<Segment[]> {
  try {
    const payload = segments.map((segment) => convertKeysToSnakeCase(segment));

    const insertData = payload.map((segment) => ({
      ...segment,
      start_coords: convertToPointWKT(segment.start_coords as Coordinates),
      end_coords: convertToPointWKT(segment.end_coords as Coordinates),
      waypoints: convertToMultiPointWKT(segment.waypoints as Coordinates[]),
    }));

    const { data, error } = await supabase.from("segments_v2").insert(insertData).select();
    if (error) throw new Error(`Error inserting segments: ${error.message}`);

    return data.map((segment: any) => convertKeysToCamelCase(segment)) as Segment[];
  } catch (error) {
    throw new Error(`Error inserting segments: ${error}`);
  }
}

// Function to insert trip-segment junction into the database
export async function insertTripSegmentLinks(
  tripData: Trip[],
  segmentData: Segment[],
): Promise<TripSegmentLink[]> {
  try {
    const tripSegmentLinks = segmentData.map((segment, index) => ({
      trip_id: tripData[0].id,
      segment_id: segment.id,
      segment_order: index,
    }));

    const { data, error } = await supabase
      .from("trip_segment_links_v2")
      .insert(tripSegmentLinks)
      .select();
    if (error) throw new Error(`Error inserting trip-segment links: ${error.message}`);

    return data.map((link: any) => convertKeysToCamelCase(link)) as TripSegmentLink[];
  } catch (error) {
    throw new Error(`Error inserting trip-segment links: ${error}`);
  }
}

export async function fetchTripData(
  tripDetails: TripDetails,
  radius: number,
): Promise<{ data: FullTrip[] | null; error: Error | null }> {
  try {
    // console.log("[LOGS] Fetching nearby trips:\n", tripDetails);
    const { data, error } = await supabase.rpc("get_nearby_trips", {
      start_lat: tripDetails.startCoords[1],
      start_lon: tripDetails.startCoords[0],
      end_lat: tripDetails.endCoords[1],
      end_lon: tripDetails.endCoords[0],
      radius,
    });

    if (error) throw new Error(`Supabase RPC Error: ${error.message}`);

    // console.log("[LOGS] Fetched nearby trips:\n", data);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
