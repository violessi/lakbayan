import { supabase } from "@utils/supabase";
import {
  convertKeysToSnakeCase,
  convertKeysToCamelCase,
  convertToPointWKT,
  convertToMultiPointWKT,
} from "@utils/map-utils";

// Function to insert a trip into the database
export async function insertTrip(trip: CreateTripV2): Promise<TripV2[]> {
  try {
    const payload = convertKeysToSnakeCase(trip);
    payload.start_coords = convertToPointWKT(payload.start_coords as Coordinates);
    payload.end_coords = convertToPointWKT(payload.end_coords as Coordinates);

    console.log("Inserting trip:", payload);
    const { data, error } = await supabase.from("trips_v2").insert([payload]).select();
    if (error) throw new Error(`Error inserting trip: ${error.message}`);

    return data.map((trip) => convertKeysToCamelCase(trip)) as TripV2[];
  } catch (error) {
    throw new Error(`Error inserting trip: ${error}`);
  }
}

// Function to insert multiple segments into the database
export async function insertSegments(segments: CreateSegmentV2[]): Promise<SegmentV2[]> {
  try {
    const finalSegments = segments.map(({ directions, ...rest }) => rest);
    const payload = finalSegments.map((segment) => convertKeysToSnakeCase(segment));

    const insertData = payload.map((segment) => ({
      ...segment,
      start_coords: convertToPointWKT(segment.start_coords as Coordinates),
      end_coords: convertToPointWKT(segment.end_coords as Coordinates),
      waypoints: convertToMultiPointWKT(segment.waypoints as Coordinates[]),
    }));

    const { data, error } = await supabase.from("segments_v2").insert(insertData).select();
    if (error) throw new Error(`Error inserting segments: ${error.message}`);

    return data.map((segment: any) => convertKeysToCamelCase(segment)) as SegmentV2[];
  } catch (error) {
    throw new Error(`Error inserting segments: ${error}`);
  }
}

// Function to insert trip-segment junction into the database
export async function insertTripSegmentLinks(
  tripData: TripV2[],
  segmentData: SegmentV2[],
): Promise<TripSegmentLinkV2[]> {
  try {
    const tripSegmentLinks = segmentData.map((segment, index) => ({
      trip_id: tripData[0].id,
      segment_id: segment.id,
      segment_order: index,
    }));

    const { data, error } = await supabase.from("trip_segment_links_v2").insert(tripSegmentLinks).select();
    if (error) throw new Error(`Error inserting trip-segment links: ${error.message}`);

    return data.map((link: any) => convertKeysToCamelCase(link)) as TripSegmentLinkV2[];
  } catch (error) {
    throw new Error(`Error inserting trip-segment links: ${error}`);
  }
}
